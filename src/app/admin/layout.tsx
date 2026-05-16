import { getT } from "@/i18n/server";
import { AdminSidebar } from "./Sidebar";

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
    { href: "/admin/tickets", label: t("support.title") },
    { href: "/admin/staff", label: t("dashboard.admin.createStaff") },
  ];
  return (
    <div className="grid md:grid-cols-[230px_1fr] gap-6">
      <AdminSidebar items={items} title={t("dashboard.admin.title")} />
      <div>{children}</div>
    </div>
  );
}
