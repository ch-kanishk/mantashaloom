import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { deleteReview, setReviewApproved } from '@/app/admin/actions';
import { ConfirmSubmit } from '@/components/admin/ConfirmSubmit';
import { Stars } from '@/components/Stars';

export const dynamic = 'force-dynamic';

export default async function AdminReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ isApproved: 'asc' }, { createdAt: 'desc' }],
    include: { product: { select: { name: true, slug: true } } },
    take: 200,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Reviews</h1>
        <p className="mt-1 text-sm text-ink/55">Reviews stay hidden from the store until you approve them.</p>
      </div>

      <section className="space-y-4">
        {reviews.length === 0 && (
          <p className="card px-6 py-16 text-center text-sm text-ink/55">No reviews yet.</p>
        )}
        {reviews.map((r) => (
          <article key={r.id} className={`card p-6 ${r.isApproved ? '' : 'border-brand-300 bg-brand-50/40'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {r.name}
                  {!r.isApproved && <span className="badge ml-2 bg-brand-200 text-brand-900">Pending</span>}
                </p>
                <p className="text-xs text-ink/55">
                  <a href={`mailto:${r.email}`} className="hover:text-brand-700">{r.email}</a>
                  {' · '}
                  <Link href={`/rugs/${r.product.slug}`} className="hover:text-brand-700">{r.product.name}</Link>
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-ink/55">{formatDate(r.createdAt)}</span>
                <form action={setReviewApproved}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="approved" value={r.isApproved ? 'false' : 'true'} />
                  <button type="submit" className="text-brand-700 hover:underline">
                    {r.isApproved ? 'Hide' : 'Approve'}
                  </button>
                </form>
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit label="Delete" message="Delete this review?" />
                </form>
              </div>
            </div>
            <div className="mt-4"><Stars rating={r.rating} /></div>
            {r.title && <p className="mt-2 font-medium">{r.title}</p>}
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/75">{r.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
