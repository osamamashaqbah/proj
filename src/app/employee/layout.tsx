import { getT } from "@/i18n/server";
import { AdminSidebar } from "@/app/admin/Sidebar";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const t = getT();
  const items = [
    { href: "/employee", label: t("dashboard.admin.stats") },
    { href: "/employee/listings", label: t("dashboard.employee.pendingListings") },
    { href: "/employee/tickets", label: t("dashboard.employee.tickets") },
    { href: "/employee/guarantees", label: t("dashboard.employee.guaranteeRequests") },
  ];
  return (
    <div className="grid md:grid-cols-[230px_1fr] gap-6">
      <AdminSidebar items={items} title={t("dashboard.employee.title")} />
      <div>{children}</div>
    </div>
  );
}
