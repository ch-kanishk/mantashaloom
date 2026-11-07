import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isMockPaymentsAllowed } from '@/lib/razorpay';
import { markOrderPaid } from '@/lib/orders';

export const dynamic = 'force-dynamic';

/**
 * "Simulate successful payment" on /checkout/mock-gateway. Only works on a dev
 * server with no Razorpay keys; everywhere else it is a 404.
 */
export async function GET(req: Request) {
  if (!isMockPaymentsAllowed()) return new NextResponse('Not found', { status: 404 });

  const orderNumber = new URL(req.url).searchParams.get('order') || '';
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.paymentProvider !== 'mock') return new NextResponse('Not found', { status: 404 });

  await markOrderPaid(orderNumber, { paymentId: `mock_pay_${orderNumber}`, raw: { mock: true } });
  return NextResponse.redirect(new URL(`/order/${orderNumber}?status=paid`, req.url), 303);
}
