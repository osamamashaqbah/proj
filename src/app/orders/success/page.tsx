import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { getLocale, getT } from "@/i18n/server";
import { formatPrice } from "@/lib/format";
import { fulfillOrder } from "@/lib/orderFulfillment";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string; provider?: string };
}) {
  const t = getT();
  const locale = getLocale();
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const orderId = searchParams.orderId;
  if (!orderId) redirect("/orders");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order || order.buyerId !== me.id) redirect("/orders");

  // Optimistic Stripe fallback: if user lands here before webhook fires,
  // try to verify the session via Stripe API and fulfill manually.
  if (
    order.status === "PENDING_PAYMENT" &&
    searchParams.provider === "stripe" &&
    order.payment?.providerRef
  ) {
    try {
      const stripe = getStripe();
      if (stripe) {
        const session = await stripe.checkout.sessions.retrieve(
          order.payment.providerRef
        );
        if (session.payment_status === "paid") {
          await fulfillOrder(order.id, session.id);
        }
      }
    } catch (e) {
      console.error("[orders/success] verify failed", e);
    }
  }

  return (
    <div className="max-w-md mx-auto card text-center space-y-4">
      <div className="text-5xl">✅</div>
      <h1 className="arcade-title text-2xl">{t("payments.checkoutSuccess")}</h1>
      <div className="muted text-sm">#{order.id.slice(-8)}</div>
      <div className="text-2xl font-display font-bold bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
        {formatPrice(order.totalCents, order.currency, locale)}
      </div>
      <Link href="/orders" className="btn-primary inline-block">
        {t("orders.title")}
      </Link>
    </div>
  );
}
