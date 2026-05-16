import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({ permissions: z.array(z.string()) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "role.manage");
    const { permissions } = Body.parse(await req.json());
    const perms = await prisma.permission.findMany({ where: { key: { in: permissions } } });
    await prisma.rolePermission.deleteMany({ where: { roleId: params.id } });
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: params.id, permissionId: p.id })),
      skipDuplicates: true,
    });
    return ok({ id: params.id });
  } catch (e) {
    return handleError(e);
  }
}
