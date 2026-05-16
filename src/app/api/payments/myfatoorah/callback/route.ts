// MyFatoorah redirects the buyer here after a payment attempt.
// We verify the payment status via the API (do NOT trust query params alone),
// then fulfill or cancel the order and redirect the buyer.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getMyFatoorahPaymentStatus,
  myFatoorahConfigured,
} from "@/lib/myfatoorah";
import { cancelOrder, fulfillOrder } from "@/lib/orderFulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const paymentId = url.searchParams.get("paymentId");
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!orderId) {
    return NextResponse.redirect(`${base}/orders/cancelled`);
  }
  if (!myFatoorahConfigured()) {
    return NextResponse.redirect(
      `${base}/orders/cancelled?orderId=${orderId}`
    );
  }
  if (!paymentId) {
    await cancelOrder(orderId, "myfatoorah_no_payment_id");
    return NextResponse.redirect(
      `${base}/orders/cancelled?orderId=${orderId}`
    );
  }

  try {
    const status = await getMyFatoorahPaymentStatus({
      key: paymentId,
      keyType: "PaymentId",
    });

    // Sanity check: the customer reference returned by MyFatoorah should
    // match the order id we sent in.
    if (status.customerReference && status.customerReference !== orderId) {
      console.warn(
        "[myfatoorah:callback] customer reference mismatch",
        status.customerReference,
        orderId
      );
      return NextResponse.redirect(
        `${base}/orders/cancelled?orderId=${orderId}`
      );
    }

    if (status.invoiceStatus.toLowerCase() === "paid") {
      await fulfillOrder(orderId, String(status.invoiceId));
      await prisma.payment.update({
        where: { orderId },
        data: { providerRef: String(status.invoiceId) },
      });
      return NextResponse.redirect(
        `${base}/orders/success?orderId=${orderId}&provider=myfatoorah`
      );
    }

    await cancelOrder(orderId, `myfatoorah_${status.invoiceStatus}`);
    return NextResponse.redirect(
      `${base}/orders/cancelled?orderId=${orderId}`
    );
  } catch (e) {
    console.error("[myfatoorah:callback]", e);
    await cancelOrder(orderId, "myfatoorah_error");
    return NextResponse.redirect(
      `${base}/orders/cancelled?orderId=${orderId}`
    );
  }
}
