// Paymob calls this URL twice:
// - As a server-to-server webhook (POST) once the transaction is processed.
// - As a browser redirect (GET) after the iframe finishes (response/return URL).
//
// We verify the HMAC, then mark our order as fulfilled or cancelled and
// either redirect the user (GET) or return JSON (POST).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymobHmac } from "@/lib/paymob";
import { cancelOrder, fulfillOrder } from "@/lib/orderFulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function paramsToObject(params: URLSearchParams) {
  const obj: any = {};
  for (const [key, value] of params.entries()) {
    // Paymob flattens nested fields into dot/bracket keys on GET callbacks.
    // We just set them flat - verifyPaymobHmac falls back to obj?.x lookups.
    obj[key] = value;
  }
  return obj;
}

async function handleResult(payload: any, providedHmac: string | null) {
  if (!providedHmac || !verifyPaymobHmac(payload, providedHmac)) {
    console.warn("[paymob] invalid hmac");
    return { ok: false, status: 400 as const };
  }
  // The merchant order id is what we set when registering the order.
  const merchantOrderId =
    payload?.obj?.order?.merchant_order_id ??
    payload?.merchant_order_id ??
    payload?.["order.merchant_order_id"] ??
    null;
  const success =
    payload?.obj?.success === true || payload?.success === "true" || payload?.success === true;
  const transactionId =
    payload?.obj?.id?.toString() ?? payload?.id?.toString() ?? undefined;

  if (!merchantOrderId) {
    console.warn("[paymob] missing merchant order id");
    return { ok: false, status: 400 as const };
  }

  if (success) {
    await fulfillOrder(merchantOrderId, transactionId);
    await prisma.payment.update({
      where: { orderId: merchantOrderId },
      data: { rawPayload: payload as any },
    });
    return { ok: true, status: 200 as const, success: true, orderId: merchantOrderId };
  }

  await cancelOrder(merchantOrderId, "paymob_failed");
  return { ok: true, status: 200 as const, success: false, orderId: merchantOrderId };
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const providedHmac = url.searchParams.get("hmac");
    const payload = await req.json();
    const result = await handleResult(payload, providedHmac);
    return NextResponse.json({ ok: result.ok }, { status: result.status });
  } catch (e) {
    console.error("[paymob:webhook]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const providedHmac = url.searchParams.get("hmac");
  const payload = paramsToObject(url.searchParams);
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const result = await handleResult(payload, providedHmac);

  if (!result.ok) {
    return NextResponse.redirect(`${base}/orders/cancelled`);
  }
  if (result.success) {
    return NextResponse.redirect(
      `${base}/orders/success?orderId=${result.orderId}&provider=paymob`
    );
  }
  return NextResponse.redirect(
    `${base}/orders/cancelled?orderId=${result.orderId}`
  );
}
