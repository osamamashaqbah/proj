import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const t = getT();
  const locale = getLocale();
  const orders = await prisma.order.findMany({
    where: { buyerId: me.id },
    include: { items: true, guaranteeRequest: { include: { package: true } }, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="section-title">{t("orders.title")}</h1>
      {orders.length === 0 && <div className="muted">{t("orders.noOrders")}</div>}
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-silver-bright font-mono text-sm">#{o.id.slice(-8)}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="badge-purple">{t(`orders.source.${o.source}`)}</span>
                <span className="badge-silver">{t(`orders.status.${o.status}`)}</span>
                {o.guaranteeRequest && (
                  <span className="badge-success">✓ {t("orders.guaranteeApplied")}</span>
                )}
              </div>
            </div>
            <ul className="mt-3 text-sm space-y-1">
              {o.items.map((it) => (
                <li key={it.id} className="flex justify-between">
                  <span className="text-silver-bright">{it.titleSnapshot} × {it.quantity}</span>
                  <span>{formatPrice(it.unitPriceCents * it.quantity, o.currency, locale)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid sm:grid-cols-3 gap-2 text-sm border-t border-neon-violet/20 pt-3">
              <div className="flex justify-between"><span className="muted">{t("orders.subtotal")}</span><span>{formatPrice(o.subtotalCents, o.currency, locale)}</span></div>
              <div className="flex justify-between"><span className="muted">{t("orders.guaranteeFee")}</span><span>{formatPrice(o.guaranteeFeeCents, o.currency, locale)}</span></div>
              <div className="flex justify-between font-semibold text-silver-bright">
                <span>{t("orders.total")}</span>
                <span className="bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                  {formatPrice(o.totalCents, o.currency, locale)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
