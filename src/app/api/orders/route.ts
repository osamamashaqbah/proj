import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok } from "@/lib/api";
import { getCurrentUser, requireUser } from "@/lib/rbac";

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

    let paymentMethodKey: string | null = null;
    if (body.paymentMethod) {
      const pm = await prisma.paymentMethodSetting.findUnique({ where: { key: body.paymentMethod } });
      if (!pm || !pm.enabled) return fail("Payment method unavailable", 400);
      paymentMethodKey = pm.key;
    }

    const subtotal = unitPriceCents;
    const fee = pkg ? Math.max(pkg.minFeeCents, Math.round((subtotal * pkg.feePercent) / 100)) : 0;
    const total = subtotal + fee;

    const order = await prisma.order.create({
      data: {
        buyerId: me!.id,
        source,
        subtotalCents: subtotal,
        guaranteeFeeCents: fee,
        totalCents: total,
        currency,
        paymentMethod: paymentMethodKey ?? undefined,
        status: pkg ? "IN_ESCROW" : "PENDING_PAYMENT",
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
            provider: paymentMethodKey ?? "placeholder",
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

    if (storeProductId) {
      await prisma.officialStoreProduct.update({
        where: { id: storeProductId },
        data: { stock: { decrement: 1 } },
      });
    }
    if (listingId) {
      await prisma.listing.update({ where: { id: listingId }, data: { status: "SOLD" } });
    }

    return ok({ id: order.id });
  } catch (e) {
    return handleError(e);
  }
}
