import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { LOCALE_COOKIE } from "@/i18n/config";
import { fail, handleError, ok } from "@/lib/api";

const Body = z.object({ locale: z.enum(["en", "ar"]) });

export async function POST(req: Request) {
  try {
    const { locale } = Body.parse(await req.json());
    cookies().set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "lax",
    });
    const session = await auth();
    const userId = (session?.user as any)?.id as string | undefined;
    if (userId) {
      await prisma.user.update({ where: { id: userId }, data: { locale } });
    }
    return ok({ locale });
  } catch (e) {
    return handleError(e);
  }
}
