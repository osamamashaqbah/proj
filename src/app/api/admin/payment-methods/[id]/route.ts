import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  enabled: z.boolean().optional(),
  labelEn: z.string().min(1).max(80).optional(),
  labelAr: z.string().min(1).max(80).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
  provider: z.enum(["STRIPE", "PAYPAL", "MANUAL"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "payment.manage");
    const body = Body.parse(await req.json());
    const m = await prisma.paymentMethodSetting.update({ where: { id: params.id }, data: body });
    return ok({ id: m.id });
  } catch (e) {
    return handleError(e);
  }
}
