import { cn } from '@/lib/utils';

/** Five stars filled to `rating`; half stars come from clipping the filled row. */
export function Stars({ rating, className }: { rating: number; className?: string }) {
  const pct = `${(Math.min(Math.max(rating, 0), 5) / 5) * 100}%`;
  return (
    <span
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
      className={cn('relative inline-block whitespace-nowrap text-sm leading-none tracking-[0.1em]', className)}
    >
      <span aria-hidden="true" className="text-ink/15">★★★★★</span>
      <span aria-hidden="true" className="absolute inset-y-0 left-0 overflow-hidden text-brand-500" style={{ width: pct }}>
        ★★★★★
      </span>
    </span>
  );
}
