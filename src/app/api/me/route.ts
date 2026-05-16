import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/rbac";
import { fail, handleError, ok } from "@/lib/api";

const Body = z.object({
  name: z.string().min(1).max(60).optional(),
  locale: z.enum(["en", "ar"]).optional(),
});

export async function PATCH(req: Request) {
  try {
    const me = await getCurrentUser();
    requireUser(me);
    const body = Body.parse(await req.json());
    const updated = await prisma.user.update({
      where: { id: me!.id },
      data: { name: body.name ?? undefined, locale: body.locale ?? undefined },
    });
    return ok({ id: updated.id });
  } catch (e) {
    return handleError(e);
  }
}
