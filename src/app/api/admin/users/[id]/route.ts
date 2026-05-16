import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  isBanned: z.boolean().optional(),
  roles: z.array(z.string()).optional(), // role NAMES
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "user.manage");
    const body = Body.parse(await req.json());

    if (typeof body.isBanned === "boolean") {
      await prisma.user.update({ where: { id: params.id }, data: { isBanned: body.isBanned } });
    }
    if (body.roles) {
      const allRoles = await prisma.role.findMany({ where: { name: { in: body.roles } } });
      await prisma.userRole.deleteMany({ where: { userId: params.id } });
      await prisma.userRole.createMany({
        data: allRoles.map((r) => ({ userId: params.id, roleId: r.id })),
        skipDuplicates: true,
      });
    }
    return ok({ id: params.id });
  } catch (e) {
    return handleError(e);
  }
}
