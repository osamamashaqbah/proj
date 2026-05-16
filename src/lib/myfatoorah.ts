// MyFatoorah REST helper. Uses the v2 "SendPayment" + "ExecutePayment" flow.
//
// Docs: https://docs.myfatoorah.com/docs/initiate-and-execute-payment-api
//
// Required environment variables:
//   MYFATOORAH_API_KEY  - your API token from My Fatoorah portal
//   MYFATOORAH_BASE_URL - base URL, e.g. https://apitest.myfatoorah.com (sandbox)
//                        or https://api.myfatoorah.com (live KW),
//                        https://api-jo.myfatoorah.com (Jordan live), etc.

export function myFatoorahConfigured() {
  return !!(process.env.MYFATOORAH_API_KEY && process.env.MYFATOORAH_BASE_URL);
}

function baseUrl() {
  return (
    process.env.MYFATOORAH_BASE_URL ?? "https://apitest.myfatoorah.com"
  ).replace(/\/$/, "");
}

async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MyFatoorah ${path} ${res.status}: ${text}`);
  }
  const data = (await res.json()) as { IsSuccess: boolean; Message?: string; Data?: T };
  if (!data.IsSuccess) {
    throw new Error(`MyFatoorah ${path}: ${data.Message ?? "unknown error"}`);
  }
  return data.Data as T;
}

/**
 * Creates a hosted invoice and returns the URL the buyer should be redirected to.
 *
 * MyFatoorah accepts the amount in the currency's main unit (e.g. JOD, USD)
 * with up to 3 decimals. We convert from cents.
 */
export async function createMyFatoorahInvoice(opts: {
  orderId: string;
  amountCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  description: string;
}): Promise<{ paymentUrl: string; invoiceId: number }> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const amount = (opts.amountCents / 100).toFixed(3);

  const data = await postJson<{
    InvoiceURL: string;
    InvoiceId: number;
  }>("/v2/SendPayment", {
    NotificationOption: "LNK", // get a payment link rather than email/SMS
    InvoiceValue: Number(amount),
    DisplayCurrencyIso: opts.currency,
    CustomerName: opts.customerName.slice(0, 50) || "Customer",
    CustomerEmail: opts.customerEmail || "noreply@example.com",
    Language: "en",
    CustomerReference: opts.orderId,
    InvoiceItems: [
      {
        ItemName: opts.description.slice(0, 100),
        Quantity: 1,
        UnitPrice: Number(amount),
      },
    ],
    CallBackUrl: `${base}/api/payments/myfatoorah/callback?orderId=${opts.orderId}`,
    ErrorUrl: `${base}/orders/cancelled?orderId=${opts.orderId}`,
  });

  return { paymentUrl: data.InvoiceURL, invoiceId: data.InvoiceId };
}

/**
 * After MyFatoorah redirects the buyer back to our callback, we use the
 * paymentId query parameter to verify the actual payment state with the API.
 */
export async function getMyFatoorahPaymentStatus(opts: {
  key: string;
  keyType: "PaymentId" | "InvoiceId";
}): Promise<{
  invoiceStatus: string;
  invoiceId: number;
  customerReference: string | null;
}> {
  const data = await postJson<{
    InvoiceStatus: string;
    InvoiceId: number;
    CustomerReference: string | null;
  }>("/v2/getPaymentStatus", {
    Key: opts.key,
    KeyType: opts.keyType,
  });
  return {
    invoiceStatus: data.InvoiceStatus,
    invoiceId: data.InvoiceId,
    customerReference: data.CustomerReference,
  };
}
