import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as any,
      typescript: true,
    });
  }
  return _stripe;
}

export function stripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function buildCheckoutUrls(orderId: string) {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return {
    success: `${base}/orders/success?orderId=${orderId}&provider=stripe`,
    cancel: `${base}/orders/cancelled?orderId=${orderId}`,
  };
}
