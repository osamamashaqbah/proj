import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, sanitizeText } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  categoryId: z.string().min(1),
  priceCents: z.number().int().positive().max(100_000_000),
  images: z.array(z.string().url()).max(10).default([]),
});

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "listing.create");
    const raw = await req.json();
    const body = Body.parse(raw);
    const cat = await prisma.category.findUnique({ where: { id: body.categoryId } });
    if (!cat || !cat.enabled) return fail("Category not available", 400);
    const listing = await prisma.listing.create({
      data: {
        sellerId: me!.id,
        title: sanitizeText(body.title, 120),
        description: sanitizeText(body.description, 5000),
        categoryId: body.categoryId,
        priceCents: body.priceCents,
        images: body.images,
        status: "PENDING",
      },
    });
    return ok({ id: listing.id });
  } catch (e) {
    return handleError(e);
  }
}
