// Minimal PayPal REST helper using fetch (no SDK dependency).
// Docs: https://developer.paypal.com/api/rest

type Token = { access_token: string; expires_at: number };
let cached: Token | null = null;

function baseUrl() {
  const env = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase();
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function paypalConfigured() {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getToken(): Promise<string> {
  if (cached && cached.expires_at > Date.now() + 30_000) {
    return cached.access_token;
  }
  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`PayPal token error: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return cached.access_token;
}

export async function createPaypalOrder(opts: {
  orderId: string;
  amountCents: number;
  currency: string;
  description: string;
}) {
  const token = await getToken();
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: opts.orderId,
          description: opts.description.slice(0, 127),
          amount: {
            currency_code: opts.currency,
            value: (opts.amountCents / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${base}/api/payments/paypal/capture?orderId=${opts.orderId}`,
        cancel_url: `${base}/orders/cancelled?orderId=${opts.orderId}`,
        brand_name: "GameVault",
        user_action: "PAY_NOW",
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id: string; links: { rel: string; href: string }[] };
  const approveLink = data.links.find((l) => l.rel === "approve")?.href;
  return { id: data.id, approveUrl: approveLink };
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const token = await getToken();
  const res = await fetch(
    `${baseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture error: ${res.status} ${text}`);
  }
  return (await res.json()) as { id: string; status: string };
}
