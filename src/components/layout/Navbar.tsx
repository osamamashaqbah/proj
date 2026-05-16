import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { auth } from "@/lib/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { dashboardPathFor } from "@/lib/rbac";

export async function Navbar() {
  const t = getT();
  const locale = getLocale();
  const session = await auth();
  const user = session?.user
    ? {
        ...session.user,
        roles: (session.user as any).roles ?? [],
        permissions: (session.user as any).permissions ?? [],
        locale: (session.user as any).locale ?? locale,
        banned: (session.user as any).banned ?? false,
        id: (session.user as any).id,
      }
    : null;
  const dash = dashboardPathFor(user as any);

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/70 border-b border-purple-800/30">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight">
          <span className="bg-purple-gradient bg-clip-text text-transparent">
            {t("common.appName")}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm text-silver">
          <Link className="hover:text-white" href="/marketplace">
            {t("nav.marketplace")}
          </Link>
          <Link className="hover:text-white" href="/categories">
            {t("nav.categories")}
          </Link>
          <Link className="hover:text-white" href="/official-store">
            {t("nav.officialStore")}
          </Link>
          <Link className="hover:text-white" href="/guarantee">
            {t("nav.guarantee")}
          </Link>
          <Link className="hover:text-white" href="/payment-methods">
            {t("nav.paymentMethods")}
          </Link>
          <Link className="hover:text-white" href="/sell">
            {t("nav.sell")}
          </Link>
        </nav>
        <div className="flex-1" />
        <LanguageSwitcher />
        {user ? (
          <UserMenu
            name={user.name ?? user.email ?? "User"}
            dashPath={dash}
            t={{
              dashboard: t("nav.dashboard"),
              profile: t("nav.profile"),
              orders: t("nav.orders"),
              myListings: t("nav.myListings"),
              logout: t("common.logout"),
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              {t("common.login")}
            </Link>
            <Link href="/register" className="btn-primary">
              {t("common.register")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
