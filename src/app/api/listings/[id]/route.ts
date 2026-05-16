import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, sanitizeText } from "@/lib/api";
import { getCurrentUser, hasPermission, requireUser } from "@/lib/rbac";

const Patch = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(5000).optional(),
  categoryId: z.string().optional(),
  priceCents: z.number().int().positive().max(100_000_000).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requireUser(me);
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return fail("Not found", 404);
    const isOwner = listing.sellerId === me!.id;
    if (!isOwner && !hasPermission(me, "listing.edit.any")) return fail("Forbidden", 403);

    const body = Patch.parse(await req.json());
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title: body.title ? sanitizeText(body.title, 120) : undefined,
        description: body.description ? sanitizeText(body.description, 5000) : undefined,
        categoryId: body.categoryId,
        priceCents: body.priceCents,
        images: body.images,
        // edits by owners reset status to PENDING
        status: isOwner && !hasPermission(me, "listing.edit.any") ? "PENDING" : undefined,
      },
    });
    return ok({ id: updated.id });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requireUser(me);
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return fail("Not found", 404);
    const isOwner = listing.sellerId === me!.id;
    if (!isOwner && !hasPermission(me, "listing.delete.any")) return fail("Forbidden", 403);
    await prisma.listing.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
