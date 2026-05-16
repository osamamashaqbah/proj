// Paymob REST helper. Implements the classic /api/auth + /api/ecommerce/orders +
// /api/acceptance/payment_keys flow used by their iframe and unified-checkout
// integrations.
//
// Docs: https://developers.paymob.com/egypt/checkout-api/
//
// Required environment variables:
//   PAYMOB_API_KEY            - your secret API key
//   PAYMOB_INTEGRATION_ID     - the integration id of an "online card" channel
//   PAYMOB_IFRAME_ID          - the iframe id you want to render
//   PAYMOB_HMAC               - HMAC secret used to verify callbacks
//   PAYMOB_BASE_URL           - default "https://accept.paymob.com"
//                               (use "https://ksa.paymob.com" for KSA, etc.)

import crypto from "crypto";

export function paymobConfigured() {
  return !!(
    process.env.PAYMOB_API_KEY &&
    process.env.PAYMOB_INTEGRATION_ID &&
    process.env.PAYMOB_IFRAME_ID &&
    process.env.PAYMOB_HMAC
  );
}

function baseUrl() {
  return process.env.PAYMOB_BASE_URL ?? "https://accept.paymob.com";
}

async function postJson<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob ${path} ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

/** Step 1: get an auth token from the API key. */
async function getAuthToken(): Promise<string> {
  const data = await postJson<{ token: string }>("/api/auth/tokens", {
    api_key: process.env.PAYMOB_API_KEY,
  });
  return data.token;
}

/** Step 2: register an order (Paymob order, not our internal one). */
async function registerOrder(
  authToken: string,
  opts: { merchantOrderId: string; amountCents: number; currency: string }
): Promise<number> {
  const data = await postJson<{ id: number }>(
    "/api/ecommerce/orders",
    {
      auth_token: authToken,
      delivery_needed: false,
      merchant_order_id: opts.merchantOrderId,
      amount_cents: opts.amountCents,
      currency: opts.currency,
      items: [],
    },
    authToken
  );
  return data.id;
}

/** Step 3: get a payment key for the iframe. */
async function getPaymentKey(
  authToken: string,
  opts: {
    paymobOrderId: number;
    amountCents: number;
    currency: string;
    billing: PaymobBilling;
  }
): Promise<string> {
  const data = await postJson<{ token: string }>(
    "/api/acceptance/payment_keys",
    {
      auth_token: authToken,
      amount_cents: opts.amountCents,
      currency: opts.currency,
      expiration: 3600,
      order_id: opts.paymobOrderId,
      billing_data: opts.billing,
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
      lock_order_when_paid: true,
    },
    authToken
  );
  return data.token;
}

export type PaymobBilling = {
  apartment?: string;
  email: string;
  floor?: string;
  first_name: string;
  street?: string;
  building?: string;
  phone_number: string;
  shipping_method?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  last_name: string;
  state?: string;
};

/**
 * Top-level helper: turns an internal order into a Paymob iframe URL the
 * buyer can be redirected to.
 */
export async function createPaymobCheckout(opts: {
  orderId: string;
  amountCents: number;
  currency: string;
  billing: PaymobBilling;
}) {
  const authToken = await getAuthToken();
  const paymobOrderId = await registerOrder(authToken, {
    merchantOrderId: opts.orderId,
    amountCents: opts.amountCents,
    currency: opts.currency,
  });
  const paymentToken = await getPaymentKey(authToken, {
    paymobOrderId,
    amountCents: opts.amountCents,
    currency: opts.currency,
    billing: opts.billing,
  });
  const iframeId = process.env.PAYMOB_IFRAME_ID;
  const iframeUrl = `${baseUrl()}/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
  return { iframeUrl, paymobOrderId, paymentToken };
}

/**
 * Verifies the HMAC sent by Paymob on a transaction callback / webhook.
 * Returns true if the signature matches; false otherwise.
 *
 * Paymob concatenates a fixed list of fields from the transaction object,
 * then HMAC-SHA512 signs them with your HMAC secret.
 */
export function verifyPaymobHmac(payload: any, providedHmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC;
  if (!secret) return false;
  // The 22 fields Paymob signs, in order. See:
  // https://developers.paymob.com/egypt/checkout-api/payment-integration/hmac-calculation
  const obj = payload?.obj ?? payload;
  const fields = [
    obj?.amount_cents,
    obj?.created_at,
    obj?.currency,
    obj?.error_occured,
    obj?.has_parent_transaction,
    obj?.id,
    obj?.integration_id,
    obj?.is_3d_secure,
    obj?.is_auth,
    obj?.is_capture,
    obj?.is_refunded,
    obj?.is_standalone_payment,
    obj?.is_voided,
    obj?.order?.id,
    obj?.owner,
    obj?.pending,
    obj?.source_data?.pan,
    obj?.source_data?.sub_type,
    obj?.source_data?.type,
    obj?.success,
  ];
  const concatenated = fields.map((v) => (v === undefined || v === null ? "" : String(v))).join("");
  const expected = crypto
    .createHmac("sha512", secret)
    .update(concatenated)
    .digest("hex");
  return safeEq(expected, providedHmac);
}

function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}
