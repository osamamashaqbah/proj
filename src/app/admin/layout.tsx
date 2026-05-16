import Link from "next/link";
import { getT } from "@/i18n/server";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = getT();
  const items = [
    { href: "/admin", label: t("dashboard.admin.stats") },
    { href: "/admin/users", label: t("dashboard.admin.users") },
    { href: "/admin/roles", label: t("dashboard.admin.roles") },
    { href: "/admin/categories", label: t("dashboard.admin.categories") },
    { href: "/admin/listings", label: t("dashboard.admin.listings") },
    { href: "/admin/store", label: t("dashboard.admin.store") },
    { href: "/admin/orders", label: t("dashboard.admin.orders") },
    { href: "/admin/guarantee-packages", label: t("dashboard.admin.guaranteePackages") },
    { href: "/admin/guarantee-requests", label: t("dashboard.admin.guaranteeRequests") },
    { href: "/admin/payment-methods", label: t("dashboard.admin.paymentMethods") },
    { href: "/admin/staff", label: t("dashboard.admin.createStaff") },
  ];
  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="card h-fit">
        <div className="text-silver-bright font-semibold mb-2">{t("dashboard.admin.title")}</div>
        <nav className="flex flex-col gap-1 text-sm">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="rounded px-2 py-1 hover:bg-bg-elevated">
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
