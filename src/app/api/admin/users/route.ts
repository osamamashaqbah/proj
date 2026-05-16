import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  email: z.string().email(),
  name: z.string().max(60).optional(),
  password: z.string().min(8).regex(/\d/),
  role: z.enum(["EMPLOYEE", "ADMIN", "USER"]),
});

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "user.manage");
    const body = Body.parse(await req.json());
    const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (exists) return fail("Email already exists", 409);
    const passwordHash = await bcrypt.hash(body.password, 10);
    const role = await prisma.role.findUnique({ where: { name: body.role } });
    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        passwordHash,
        roles: {
          create: [
            ...(role ? [{ roleId: role.id }] : []),
            ...(userRole && userRole.id !== role?.id ? [{ roleId: userRole.id }] : []),
          ],
        },
      },
    });
    return ok({ id: user.id });
  } catch (e) {
    return handleError(e);
  }
}
