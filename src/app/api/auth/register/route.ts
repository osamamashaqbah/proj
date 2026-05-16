import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, rateLimit } from "@/lib/api";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/\d/, "Password must include a number"),
  name: z.string().min(1).max(60).optional(),
  locale: z.enum(["en", "ar"]).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimit(`register:${ip}`, 10, 60_000);
    if (!rl.ok) return fail("Too many requests", 429);

    const body = Body.parse(await req.json());
    const email = body.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return fail("An account with this email already exists.", 409);

    const passwordHash = await bcrypt.hash(body.password, 10);
    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name ?? email.split("@")[0],
        passwordHash,
        locale: body.locale ?? "en",
        roles: userRole
          ? { create: [{ roleId: userRole.id }] }
          : undefined,
      },
    });

    return ok({ id: user.id, email: user.email });
  } catch (e) {
    return handleError(e);
  }
}
