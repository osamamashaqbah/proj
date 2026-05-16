import { prisma } from "./prisma";

/**
 * Mark an order as paid and reserve the item.
 * Idempotent: safe to call multiple times.
 */
export async function fulfillOrder(orderId: string, providerRef?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, guaranteeRequest: true, payment: true },
  });
  if (!order) return { ok: false, reason: "not_found" as const };
  if (order.status !== "PENDING_PAYMENT") return { ok: true, idempotent: true };

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: "CAPTURED",
      providerRef: providerRef ?? order.payment?.providerRef ?? undefined,
    },
  });

  // Stock / listing side-effects
  for (const it of order.items) {
    if (it.officialStoreProductId) {
      await prisma.officialStoreProduct.update({
        where: { id: it.officialStoreProductId },
        data: { stock: { decrement: it.quantity } },
      });
    }
    if (it.listingId) {
      await prisma.listing.update({
        where: { id: it.listingId },
        data: { status: "SOLD" },
      });
    }
  }

  // If a guarantee request is attached, move to escrow. Otherwise, mark PAID.
  if (order.guaranteeRequest) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "IN_ESCROW" },
    });
    await prisma.guaranteeRequest.update({
      where: { orderId: order.id },
      data: { status: "HELD_IN_ESCROW" },
    });
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });
  }

  return { ok: true };
}

export async function cancelOrder(orderId: string, reason?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false };
  if (order.status !== "PENDING_PAYMENT") return { ok: true, idempotent: true };
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED", notes: reason ?? null },
  });
  await prisma.payment.update({
    where: { orderId: order.id },
    data: { status: "FAILED" },
  });
  return { ok: true };
}
