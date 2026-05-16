import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  nameEn: z.string().min(1).max(80),
  nameAr: z.string().min(1).max(80),
  kind: z.enum(["USED_GAMES", "ACCOUNTS", "SUBSCRIPTIONS", "DIGITAL_ITEMS", "SERVICES", "OTHER"]),
  riskWarning: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "category.manage");
    const body = Body.parse(await req.json());
    const c = await prisma.category.create({
      data: { ...body, enabled: true },
    });
    return ok({ id: c.id });
  } catch (e) {
    return handleError(e);
  }
}
