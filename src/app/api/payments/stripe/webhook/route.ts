import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { cancelOrder, fulfillOrder } from "@/lib/orderFulfillment";

// Stripe requires the raw body for signature verification.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret missing" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "Missing signature" }, { status: 400 });
  }
  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe:webhook] invalid signature", err);
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as any;
        const orderId = session.client_reference_id ?? session.metadata?.orderId;
        if (orderId) {
          await fulfillOrder(orderId, session.id);
        }
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as any;
        const orderId = session.client_reference_id ?? session.metadata?.orderId;
        if (orderId) {
          await cancelOrder(orderId, "stripe_failed_or_expired");
        }
        break;
      }
      default:
        // ignore
        break;
    }
  } catch (e) {
    console.error("[stripe:webhook] handler error", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
