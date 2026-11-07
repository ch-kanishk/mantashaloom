import { prisma } from './db';
import { ensureCaptured, type RazorpayPayment } from './razorpay';

/**
 * Marks an order paid exactly once and decrements stock in the same transaction.
 * Safe to call repeatedly — the callback and the webhook both route through here.
 */
export async function markOrderPaid(
  orderNumber: string,
  { paymentId, signature, raw }: { paymentId?: string; signature?: string; raw?: unknown }
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) return { ok: false as const, reason: 'NOT_FOUND' as const };
    if (order.paymentStatus === 'PAID') return { ok: true as const, order, alreadyPaid: true };

    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        gatewayPaymentId: paymentId ?? order.gatewayPaymentId,
        gatewaySignature: signature ?? order.gatewaySignature,
        paymentRaw: raw ? JSON.stringify(raw) : order.paymentRaw,
      },
      include: { items: true },
    });
    return { ok: true as const, order: updated, alreadyPaid: false };
  });
}

export async function markOrderFailed(orderNumber: string, raw?: unknown) {
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.paymentStatus === 'PAID') return null;
  return prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'FAILED',
      paymentStatus: 'FAILED',
      paymentRaw: raw ? JSON.stringify(raw) : order.paymentRaw,
    },
  });
}

/**
 * Confirm a Razorpay payment against our order and mark it PAID. Used by both the
 * browser verify call and the webhook. The payment must belong to this order's
 * Razorpay order and match its amount and currency exactly.
 */
export async function confirmRazorpayPayment(
  order: { orderNumber: string; gatewayOrderId: string | null; total: number; currency: string },
  payment: RazorpayPayment,
  signature?: string
): Promise<'PAID' | 'PENDING' | 'FAILED'> {
  if (!order.gatewayOrderId || payment.order_id !== order.gatewayOrderId) {
    throw new Error(`Payment ${payment.id} does not belong to order ${order.orderNumber}`);
  }
  if (payment.amount !== order.total || payment.currency !== order.currency) {
    throw new Error(`Payment ${payment.id} amount ${payment.amount} ${payment.currency} does not match order total`);
  }

  const settled = await ensureCaptured(payment);
  if (settled.status === 'captured') {
    await markOrderPaid(order.orderNumber, { paymentId: settled.id, signature, raw: settled });
    return 'PAID';
  }
  // A failed attempt does not fail the order: the shopper can retry in the popup.
  return settled.status === 'failed' ? 'FAILED' : 'PENDING';
}
