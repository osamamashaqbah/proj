import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requireUser } from "@/lib/rbac";
import { buildCheckoutUrls, getStripe, stripeConfigured } from "@/lib/stripe";
import { createPaypalOrder, paypalConfigured } from "@/lib/paypal";
import { createPaymobCheckout, paymobConfigured } from "@/lib/paymob";

const Body = z
  .object({
    listingId: z.string().optional().nullable(),
    officialStoreProductId: z.string().optional().nullable(),
    guaranteePackageId: z.string().optional().nullable(),
    paymentMethod: z.string().optional().nullable(),
  })
  .refine((d) => d.listingId || d.officialStoreProductId, {
    message: "Provide listingId or officialStoreProductId",
  });

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    requireUser(me);
    const body = Body.parse(await req.json());

    let titleSnapshot = "";
    let unitPriceCents = 0;
    let currency = "USD";
    let source: "MARKETPLACE" | "OFFICIAL_STORE" = "MARKETPLACE";
    let listingId: string | null = null;
    let storeProductId: string | null = null;

    if (body.officialStoreProductId) {
      const p = await prisma.officialStoreProduct.findUnique({
        where: { id: body.officialStoreProductId },
      });
      if (!p || !p.isActive || p.stock <= 0) return fail("Product unavailable", 400);
      titleSnapshot = p.title;
      unitPriceCents = p.priceCents;
      currency = p.currency;
      storeProductId = p.id;
      source = "OFFICIAL_STORE";
    } else if (body.listingId) {
      const l = await prisma.listing.findUnique({ where: { id: body.listingId } });
      if (!l || l.status !== "APPROVED") return fail("Listing unavailable", 400);
      if (l.sellerId === me!.id) return fail("You cannot buy your own listing", 400);
      titleSnapshot = l.title;
      unitPriceCents = l.priceCents;
      currency = l.currency;
      listingId = l.id;
    }

    let pkg: { id: string; feePercent: number; minFeeCents: number } | null = null;
    if (body.guaranteePackageId) {
      const p = await prisma.guaranteePackage.findUnique({ where: { id: body.guaranteePackageId } });
      if (!p || !p.isActive) return fail("Guarantee package unavailable", 400);
      pkg = { id: p.id, feePercent: p.feePercent, minFeeCents: p.minFeeCents };
    }

    let methodKey: string | null = null;
    let provider: "STRIPE" | "PAYPAL" | "PAYMOB" | "MANUAL" = "MANUAL";
    if (body.paymentMethod) {
      const pm = await prisma.paymentMethodSetting.findUnique({ where: { key: body.paymentMethod } });
      if (!pm || !pm.enabled) return fail("Payment method unavailable", 400);
      methodKey = pm.key;
      provider = pm.provider;
    }

    const subtotal = unitPriceCents;
    const fee = pkg ? Math.max(pkg.minFeeCents, Math.round((subtotal * pkg.feePercent) / 100)) : 0;
    const total = subtotal + fee;

    // Pre-check: if a real provider is selected, ensure server keys exist.
    if (provider === "STRIPE" && !stripeConfigured()) {
      return fail("Stripe not configured on server", 503);
    }
    if (provider === "PAYPAL" && !paypalConfigured()) {
      return fail("PayPal not configured on server", 503);
    }
    if (provider === "PAYMOB" && !paymobConfigured()) {
      return fail("Paymob not configured on server", 503);
    }

    // Create the order in DB first (PENDING payment).
    const order = await prisma.order.create({
      data: {
        buyerId: me!.id,
        source,
        subtotalCents: subtotal,
        guaranteeFeeCents: fee,
        totalCents: total,
        currency,
        paymentMethod: methodKey ?? undefined,
        // For escrow orders we move to IN_ESCROW only after successful payment.
        status: "PENDING_PAYMENT",
        items: {
          create: [
            {
              titleSnapshot,
              unitPriceCents,
              listingId: listingId ?? undefined,
              officialStoreProductId: storeProductId ?? undefined,
            },
          ],
        },
        payment: {
          create: {
            amountCents: total,
            currency,
            status: "PENDING",
            provider: provider.toLowerCase(),
          },
        },
        guaranteeRequest: pkg
          ? {
              create: {
                packageId: pkg.id,
                buyerId: me!.id,
                feeCents: fee,
                status: "AWAITING_FUNDS",
              },
            }
          : undefined,
      },
    });

    // For real-money providers: create checkout session and return URL.
    let checkoutUrl: string | null = null;

    if (provider === "STRIPE") {
      const stripe = getStripe()!;
      const { success, cancel } = buildCheckoutUrls(order.id);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: success,
        cancel_url: cancel,
        client_reference_id: order.id,
        customer_email: me!.email ?? undefined,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: currency.toLowerCase(),
              unit_amount: total,
              product_data: {
                name: titleSnapshot,
                description: pkg ? "Includes website guarantee fee" : undefined,
              },
            },
          },
        ],
        metadata: { orderId: order.id, buyerId: me!.id },
      });
      checkoutUrl = session.url;
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { providerRef: session.id },
      });
    } else if (provider === "PAYPAL") {
      const pp = await createPaypalOrder({
        orderId: order.id,
        amountCents: total,
        currency,
        description: titleSnapshot,
      });
      checkoutUrl = pp.approveUrl ?? null;
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { providerRef: pp.id },
      });
    } else if (provider === "PAYMOB") {
      // Paymob requires billing data. We use the buyer's email + name and
      // fall back to placeholder values for the rest (Paymob accepts "NA").
      const nameParts = (me!.name ?? me!.email ?? "User User").trim().split(/\s+/);
      const firstName = nameParts[0] ?? "User";
      const lastName = nameParts.slice(1).join(" ") || "User";
      const checkout = await createPaymobCheckout({
        orderId: order.id,
        amountCents: total,
        currency,
        billing: {
          email: me!.email ?? "noreply@example.com",
          first_name: firstName,
          last_name: lastName,
          phone_number: "NA",
          apartment: "NA",
          floor: "NA",
          street: "NA",
          building: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "NA",
          state: "NA",
        },
      });
      checkoutUrl = checkout.iframeUrl;
      await prisma.payment.update({
        where: { orderId: order.id },
        data: { providerRef: String(checkout.paymobOrderId) },
      });
    } else {
      // Manual payment: optimistically reserve the item (legacy behaviour).
      if (storeProductId) {
        await prisma.officialStoreProduct.update({
          where: { id: storeProductId },
          data: { stock: { decrement: 1 } },
        });
      }
      if (listingId) {
        await prisma.listing.update({ where: { id: listingId }, data: { status: "SOLD" } });
      }
      // For escrow with manual payments, move into IN_ESCROW (admin will verify and release).
      if (pkg) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "IN_ESCROW" },
        });
        await prisma.guaranteeRequest.update({
          where: { orderId: order.id },
          data: { status: "HELD_IN_ESCROW" },
        });
      }
    }

    return ok({ id: order.id, checkoutUrl });
  } catch (e) {
    return handleError(e);
  }
}
