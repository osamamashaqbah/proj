import { prisma } from "@/lib/prisma";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { OrderRow } from "./OrderRow";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const t = getT();
  const locale = getLocale();
  const orders = await prisma.order.findMany({
    include: { buyer: true, items: true, guaranteeRequest: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const orderStatusLabels: Record<string, string> = {
    PENDING_PAYMENT: t("orders.status.PENDING_PAYMENT"),
    PAID: t("orders.status.PAID"),
    IN_ESCROW: t("orders.status.IN_ESCROW"),
    DELIVERED: t("orders.status.DELIVERED"),
    COMPLETED: t("orders.status.COMPLETED"),
    CANCELLED: t("orders.status.CANCELLED"),
    REFUNDED: t("orders.status.REFUNDED"),
    DISPUTED: t("orders.status.DISPUTED"),
  };
  const sourceLabels: Record<string, string> = {
    MARKETPLACE: t("orders.source.MARKETPLACE"),
    OFFICIAL_STORE: t("orders.source.OFFICIAL_STORE"),
  };

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.orders")}</h1>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.orders.headings.id")}</th>
              <th>{t("admin.orders.headings.buyer")}</th>
              <th>{t("admin.orders.headings.source")}</th>
              <th>{t("admin.orders.headings.total")}</th>
              <th>{t("admin.orders.headings.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <OrderRow
                key={o.id}
                o={{
                  id: o.id,
                  buyer: o.buyer.email,
                  source: o.source,
                  sourceLabel: sourceLabels[o.source] ?? o.source,
                  total: formatPrice(o.totalCents, o.currency, locale),
                  status: o.status,
                  hasGuarantee: !!o.guaranteeRequest,
                }}
                statusLabels={orderStatusLabels}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
