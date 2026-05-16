import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, rateLimit } from "@/lib/api";
import { sendMail } from "@/lib/mailer";

const Body = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimit(`forgot:${ip}`, 5, 60_000);
    if (!rl.ok) return fail("Too many requests", 429);

    const { email } = Body.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Respond OK even if not found to avoid user enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expires: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
      const url = `${process.env.NEXTAUTH_URL ?? ""}/reset-password?token=${token}`;
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        text: `Reset link (valid 30 minutes): ${url}`,
      });
    }
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}
