import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { fetchPayment, verifyPaymentSignature } from '@/lib/razorpay';
import { confirmRazorpayPayment } from '@/lib/orders';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  orderNumber: z.string().min(1).max(40),
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
});

/**
 * Called by the browser when the Razorpay popup reports success. The browser is
 * not trusted: the signature proves Razorpay issued these ids, and the payment
 * is then fetched from Razorpay to check its order, amount and status.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: body.orderNumber } });
  if (!order || order.gatewayOrderId !== body.razorpay_order_id) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (!verifyPaymentSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature)) {
    console.warn('[razorpay-verify] bad signature for', order.orderNumber);
    return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
  }

  const redirect = (status: string) => `/order/${order.orderNumber}?status=${status}`;
  try {
    const payment = await fetchPayment(body.razorpay_payment_id);
    const result = await confirmRazorpayPayment(order, payment, body.razorpay_signature);
    return NextResponse.json({ status: result, redirect: redirect(result.toLowerCase()) });
  } catch (err) {
    // Signature was valid, so money may have moved: show "pending" and let the webhook settle it.
    console.error('[razorpay-verify]', order.orderNumber, err);
    return NextResponse.json({ status: 'PENDING', redirect: redirect('pending') });
  }
}
