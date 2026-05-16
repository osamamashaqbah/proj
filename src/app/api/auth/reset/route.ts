import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";

const Body = z.object({
  token: z.string().min(10),
  password: z.string().min(8).regex(/\d/),
});

export async function POST(req: Request) {
  try {
    const { token, password } = Body.parse(await req.json());
    const t = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!t || t.used || t.expires < new Date()) return fail("Invalid or expired token", 400);

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: t.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: t.id }, data: { used: true } }),
    ]);
    return ok({ reset: true });
  } catch (e) {
    return handleError(e);
  }
}
