import { auth } from "@/lib/auth";
import { ok } from "@/lib/api";

export async function GET() {
  const session = await auth();
  if (!session?.user) return ok({ user: null });
  return ok({
    user: { email: session.user.email, name: session.user.name },
    roles: (session.user as any).roles ?? [],
    permissions: (session.user as any).permissions ?? [],
    locale: (session.user as any).locale ?? "en",
  });
}
