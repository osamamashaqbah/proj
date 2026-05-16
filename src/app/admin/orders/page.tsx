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
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.orders")}</h1>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Buyer</th><th>Source</th>
              <th>Total</th><th>Status</th><th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <OrderRow key={o.id} o={{
                id: o.id,
                buyer: o.buyer.email,
                source: o.source,
                total: formatPrice(o.totalCents, o.currency, locale),
                status: o.status,
                hasGuarantee: !!o.guaranteeRequest,
              }} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
