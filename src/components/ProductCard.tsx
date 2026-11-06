import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';
import { Stars } from './Stars';
import type { ProductCardData, RatingSummary } from '@/lib/queries';

export function ProductCard({
  product,
  priority = false,
  rating,
}: {
  product: ProductCardData;
  priority?: boolean;
  rating?: RatingSummary;
}) {
  const primary = product.images[0];
  const hover = product.images[1];
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;

  return (
    <article className="group">
      <Link href={`/rugs/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          {primary ? (
            <>
              <Image
                src={primary.url}
                alt={primary.alt || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                className="object-cover transition-opacity duration-500 group-hover:opacity-0"
              />
              {hover && (
                <Image
                  src={hover.url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink/55">No image</div>
          )}

          {discount > 0 && (
            <span className="badge absolute left-3 top-3 rounded-none bg-ink text-paper">{discount}% off</span>
          )}
          {product.stock === 0 && (
            <span className="badge absolute right-3 top-3 rounded-none bg-paper text-ink">Sold out</span>
          )}
        </div>

        <div className="pt-4 text-center">
          <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover:text-brand-700">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-ink/55">
            {[product.technique, product.sizeLabel].filter(Boolean).join(' · ')}
          </p>
          {rating && rating.count > 0 && (
            <p className="mt-1.5 flex items-center justify-center gap-1.5">
              <Stars rating={rating.average} className="text-xs" />
              <span className="text-xs text-ink/55">({rating.count})</span>
            </p>
          )}
          <p className="mt-2 flex items-baseline justify-center gap-2">
            <span className="text-sm text-ink">{formatMoney(product.price, product.currency)}</span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-xs text-ink/55 line-through">
                {formatMoney(product.compareAt, product.currency)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
