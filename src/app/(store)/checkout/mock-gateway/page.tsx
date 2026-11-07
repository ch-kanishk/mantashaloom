import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatMoney } from '@/lib/utils';
import { buildMetadata } from '@/lib/seo';
import { isMockPaymentsAllowed } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export const metadata = buildMetadata({ title: 'Test payment', path: '/checkout/mock-gateway', noIndex: true });

/**
 * Stand-in for Razorpay Checkout on a local dev server with no Razorpay keys, so
 * the whole order flow can be exercised without an account. 404 everywhere else.
 */
export default async function MockGatewayPage({
  searchParams,
}: { searchParams: Promise<{ order?: string; amount?: string }> }) {
  if (!isMockPaymentsAllowed()) notFound();
  const { order = '', amount = '0' } = await searchParams;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md border border-ink/15 p-8 text-center">
        <p className="eyebrow">Development only</p>
        <h1 className="mt-3 font-display text-3xl">Simulated payment</h1>
        <p className="mt-4 text-sm text-ink/60">
          No Razorpay keys are set. Add <code className="rounded bg-sand px-1.5 py-0.5">RAZORPAY_KEY_ID</code> and{' '}
          <code className="rounded bg-sand px-1.5 py-0.5">RAZORPAY_KEY_SECRET</code> to{' '}
          <code className="rounded bg-sand px-1.5 py-0.5">.env</code> to use Razorpay Checkout.
        </p>

        <dl className="mt-8 space-y-2 border-y border-ink/10 py-6 text-sm">
          <div className="flex justify-between"><dt className="text-ink/55">Order</dt><dd>{order}</dd></div>
          <div className="flex justify-between"><dt className="text-ink/55">Amount</dt><dd>{formatMoney(Number(amount) || 0)}</dd></div>
        </dl>

        <div className="mt-8 space-y-3">
          <a href={`/api/payments/mock?order=${encodeURIComponent(order)}`} className="btn-primary w-full">
            Simulate successful payment
          </a>
          <Link href="/checkout?error=cancelled" className="btn-outline w-full">Cancel and go back</Link>
        </div>
      </div>
    </div>
  );
}
