import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { GuaranteeActions } from "./GuaranteeActions";

export const dynamic = "force-dynamic";

export default async function EmployeeGuaranteesPage() {
  const t = getT();
  const locale = getLocale();
  const reqs = await prisma.guaranteeRequest.findMany({
    include: { order: true, package: true, buyer: true },
    orderBy: { createdAt: "desc" },
  });
  const actionLabels = {
    holdEscrow: t("admin.guaranteeActions.holdEscrow"),
    release: t("admin.guaranteeActions.release"),
    refund: t("admin.guaranteeActions.refund"),
  };
  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("dashboard.employee.guaranteeRequests")}</h1>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.guarantees.headings.order")}</th>
              <th>{t("admin.guarantees.headings.buyer")}</th>
              <th>{t("admin.guarantees.headings.package")}</th>
              <th>{t("admin.guarantees.headings.fee")}</th>
              <th>{t("admin.guarantees.headings.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-xs">#{r.orderId.slice(-8)}</td>
                <td>{r.buyer.email}</td>
                <td>{locale === "ar" ? r.package.nameAr : r.package.nameEn}</td>
                <td>{formatPrice(r.feeCents, r.order.currency, locale)}</td>
                <td><span className="badge-silver">{r.status}</span></td>
                <td><GuaranteeActions id={r.id} labels={actionLabels} /></td>
              </tr>
            ))}
            {reqs.length === 0 && <tr><td colSpan={6} className="muted">—</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
