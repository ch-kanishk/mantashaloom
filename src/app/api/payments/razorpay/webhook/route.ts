import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature, type RazorpayPayment } from '@/lib/razorpay';
import { confirmRazorpayPayment } from '@/lib/orders';

export const dynamic = 'force-dynamic';

/**
 * Razorpay webhook (Dashboard -> Account & Settings -> Webhooks), subscribed to
 * payment.authorized, payment.captured and order.paid. Confirms orders even when
 * the shopper closes the tab before the browser verify call completes.
 *
 * Unknown or mismatched orders are acknowledged with 200 so Razorpay does not
 * retry them forever; only an invalid signature or a transient error is not.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'))) {
    console.warn('[razorpay-webhook] rejected: bad signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: RazorpayPayment } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const handled = ['payment.authorized', 'payment.captured', 'order.paid'];
  const payment = event.payload?.payment?.entity;
  if (!event.event || !handled.includes(event.event) || !payment?.order_id) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const order = await prisma.order.findFirst({ where: { gatewayOrderId: payment.order_id } });
  if (!order) {
    console.warn('[razorpay-webhook] no order for', payment.order_id);
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const result = await confirmRazorpayPayment(order, payment);
    return NextResponse.json({ received: true, status: result });
  } catch (err) {
    console.error('[razorpay-webhook]', order.orderNumber, err);
    const mismatch = err instanceof Error && /does not (belong|match)/.test(err.message);
    // Mismatches will never succeed on retry; anything else (network, capture) should be retried.
    return NextResponse.json({ received: true, error: 'not confirmed' }, { status: mismatch ? 200 : 500 });
  }
}
