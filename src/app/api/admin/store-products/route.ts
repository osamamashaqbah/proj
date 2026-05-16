import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, sanitizeText } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(5000),
  categoryId: z.string(),
  priceCents: z.number().int().positive(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).max(10).default([]),
});

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "store.manage");
    const body = Body.parse(await req.json());
    const cat = await prisma.category.findUnique({ where: { id: body.categoryId } });
    if (!cat) return fail("Category not found", 400);
    const p = await prisma.officialStoreProduct.create({
      data: {
        title: sanitizeText(body.title, 120),
        description: sanitizeText(body.description, 5000),
        categoryId: body.categoryId,
        priceCents: body.priceCents,
        stock: body.stock,
        images: body.images,
      },
    });
    return ok({ id: p.id });
  } catch (e) {
    return handleError(e);
  }
}
