import { NextResponse } from "next/server";
import { capturePaypalOrder, paypalConfigured } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/orderFulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PayPal redirects users back here after approval (return_url).
// Query params: orderId (our internal order id), token (PayPal order id), PayerID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const paypalOrderId = url.searchParams.get("token");
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!orderId || !paypalOrderId) {
    return NextResponse.redirect(`${base}/orders/cancelled`);
  }
  if (!paypalConfigured()) {
    return NextResponse.redirect(`${base}/orders/cancelled?orderId=${orderId}`);
  }

  try {
    const result = await capturePaypalOrder(paypalOrderId);
    if (result.status === "COMPLETED" || result.status === "APPROVED") {
      await fulfillOrder(orderId, paypalOrderId);
      // ensure the providerRef is stored
      await prisma.payment.update({
        where: { orderId },
        data: { providerRef: paypalOrderId },
      });
      return NextResponse.redirect(`${base}/orders/success?orderId=${orderId}&provider=paypal`);
    }
    return NextResponse.redirect(`${base}/orders/cancelled?orderId=${orderId}`);
  } catch (e) {
    console.error("[paypal:capture]", e);
    return NextResponse.redirect(`${base}/orders/cancelled?orderId=${orderId}`);
  }
}
