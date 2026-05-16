import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { getT } from "@/i18n/server";
import { cancelOrder } from "@/lib/orderFulfillment";

export const dynamic = "force-dynamic";

export default async function OrderCancelledPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const t = getT();
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const orderId = searchParams.orderId;
  if (orderId) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order && order.buyerId === me.id && order.status === "PENDING_PAYMENT") {
      await cancelOrder(order.id, "user_cancelled");
    }
  }
  return (
    <div className="max-w-md mx-auto card text-center space-y-4">
      <div className="text-5xl">⚠️</div>
      <h1 className="arcade-title text-2xl">{t("payments.checkoutCancelled")}</h1>
      <Link href="/marketplace" className="btn-primary inline-block">
        {t("nav.marketplace")}
      </Link>
    </div>
  );
}
