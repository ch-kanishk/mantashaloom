import Link from 'next/link';
import { Stars } from './Stars';
import type { getRecentReviews } from '@/lib/queries';
import { formatDate } from '@/lib/utils';

export function ReviewCard({ review }: { review: Awaited<ReturnType<typeof getRecentReviews>>[number] }) {
  return (
    <article className="flex flex-col border border-ink/10 bg-paper p-6">
      <Stars rating={review.rating} />
      {review.title && <h3 className="mt-3 font-display text-lg leading-snug">{review.title}</h3>}
      <p className="mt-2 line-clamp-6 flex-1 whitespace-pre-line text-sm leading-relaxed text-ink/70">{review.body}</p>
      <p className="mt-4 text-xs text-ink/55">{review.name} · {formatDate(review.createdAt)}</p>
      <Link href={`/rugs/${review.product.slug}`} className="mt-1 text-xs text-brand-700 hover:underline">
        {review.product.name}
      </Link>
    </article>
  );
}
