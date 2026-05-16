import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { PaymentMethodRow } from "./PaymentMethodRow";

export const dynamic = "force-dynamic";

export default async function AdminPaymentMethodsPage() {
  const t = getT();
  const methods = await prisma.paymentMethodSetting.findMany({ orderBy: { sortOrder: "asc" } });
  const labels = {
    enabled: t("common.enabled"),
    disabled: t("common.disabled"),
  };
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.paymentMethods")}</h1>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.payments.headings.key")}</th>
              <th>{t("admin.payments.headings.labelEn")}</th>
              <th>{t("admin.payments.headings.labelAr")}</th>
              <th>Provider</th>
              <th>{t("admin.payments.headings.enabled")}</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => <PaymentMethodRow key={m.id} m={m} labels={labels} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
