import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewCard } from '@/components/ReviewCard';
import { Stars } from '@/components/Stars';
import { getRecentReviews, getReviewSummary } from '@/lib/queries';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata = buildMetadata({
  title: 'Customer Reviews',
  description: 'What customers say about their Mantashaloom, in their own words.',
  path: '/reviews',
});

export default async function ReviewsPage() {
  const [reviews, summary] = await Promise.all([getRecentReviews(60), getReviewSummary()]);

  return (
    <div className="container-page pb-20">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Reviews', url: '/reviews' }]} />
      <header className="border-b border-ink/10 pb-10 pt-4">
        <h1 className="font-display text-5xl">Customer Reviews</h1>
        {summary.count > 0 && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink/60">
            <Stars rating={summary.average} />
            {summary.average.toFixed(1)} out of 5 from {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </header>

      {reviews.length > 0 ? (
        <div className="grid gap-5 pt-10 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="font-display text-2xl">No reviews yet</p>
          <p className="mt-2 text-sm text-ink/60">Own one of our rugs? You can leave a review on its product page.</p>
          <Link href="/rugs" className="btn-outline mt-6">Browse all rugs</Link>
        </div>
      )}
    </div>
  );
}
