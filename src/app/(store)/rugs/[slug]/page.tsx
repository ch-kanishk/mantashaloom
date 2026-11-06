import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { ProductGallery } from '@/components/ProductGallery';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductGrid } from '@/components/ProductGrid';
import { ReviewForm } from '@/components/ReviewForm';
import { Stars } from '@/components/Stars';
import { StickyBuyBar } from '@/components/StickyBuyBar';
import { getProductBySlug, getProductReviews, getRatings, getRelatedProducts } from '@/lib/queries';
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from '@/lib/seo';
import { formatDate, formatMoney } from '@/lib/utils';

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
    take: 200,
    orderBy: { createdAt: 'desc' },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return buildMetadata({ title: 'Rug not found', noIndex: true });

  const auto = [product.technique, product.material, product.style, 'rug']
    .filter(Boolean)
    .join(' ');
  return buildMetadata({
    title: product.metaTitle || `${product.name} — ${product.sizeLabel ?? ''} ${auto}`.trim(),
    description:
      product.metaDescription ||
      product.shortDesc ||
      `${product.name}: a ${auto} handmade in India${product.sizeLabel ? `, ${product.sizeLabel}` : ''}. ${formatMoney(product.price, product.currency)} with free shipping across India.`,
    path: `/rugs/${product.slug}`,
    image: product.images[0]?.url,
    type: 'product',
  });
}

const SPEC_LABELS: [string, string][] = [
  ['sku', 'SKU'],
  ['technique', 'Technique'],
  ['material', 'Material'],
  ['style', 'Style'],
  ['colorFamily', 'Colour family'],
  ['room', 'Best for'],
  ['shape', 'Shape'],
  ['sizeLabel', 'Size'],
  ['pileHeight', 'Pile height'],
  ['knotsPerSqIn', 'Knots per sq. inch'],
  ['originCity', 'Made in'],
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews, ratings] = await Promise.all([
    getRelatedProducts(product),
    getProductReviews(product.id),
    getRatings([product.id]),
  ]);
  const rating = ratings.get(product.id);
  const cartLine = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    sizeLabel: product.sizeLabel,
    image: product.images[0]?.url ?? null,
    price: product.price,
    quantity: 1,
  };
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'All Rugs', url: '/rugs' },
    ...(product.category ? [{ name: product.category.name, url: `/collections/${product.category.slug}` }] : []),
    { name: product.name, url: `/rugs/${product.slug}` },
  ];

  const specs = SPEC_LABELS.map(([key, label]) => [label, (product as any)[key]]).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  ) as [string, string | number][];

  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;

  return (
    <div className="container-page pb-28 lg:pb-20">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          productJsonLd({
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.shortDesc || product.description,
            price: product.price,
            currency: product.currency,
            stock: product.stock,
            images: product.images.map((i) => i.url),
            material: product.material,
            colorFamily: product.colorFamily,
            widthCm: product.widthCm,
            lengthCm: product.lengthCm,
            rating,
          }),
        ]}
      />

      <Breadcrumbs items={crumbs} />

      <div className="grid gap-12 pt-4 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:pt-6">
          {product.category && (
            <Link
              href={`/collections/${product.category.slug}`}
              className="eyebrow hover:underline hover:underline-offset-4"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-3 font-display text-4xl leading-tight">{product.name}</h1>

          {rating && rating.count > 0 && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-xs text-ink/60 hover:text-brand-700">
              <Stars rating={rating.average} />
              <span>{rating.average.toFixed(1)} · {rating.count} {rating.count === 1 ? 'review' : 'reviews'}</span>
            </a>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-medium">{formatMoney(product.price, product.currency)}</span>
            {discount > 0 && (
              <>
                <span className="text-base text-ink/55 line-through">
                  {formatMoney(product.compareAt!, product.currency)}
                </span>
                <span className="badge bg-brand-100 text-brand-800">Save {discount}%</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/55">Inclusive of all taxes. Free shipping in India above ₹15,000.</p>

          {product.shortDesc && (
            <p className="mt-6 text-sm leading-relaxed text-ink/70">{product.shortDesc}</p>
          )}

          <div className="mt-8 border-y border-ink/10 py-8">
            <AddToCartButton stock={product.stock} line={cartLine} />
            <p className="mt-4 text-center text-sm text-ink/60">
              Need another size or colour?{' '}
              <Link href={`/custom-orders?rug=${product.slug}`} className="text-brand-700 underline underline-offset-2">
                Request a custom weave
              </Link>
            </p>
          </div>

          <div className="mt-2 divide-y divide-ink/10 border-b border-ink/10">
            {product.description && (
              <Detail title="About this rug" open>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">{product.description}</p>
              </Detail>
            )}
            {specs.length > 0 && (
              <Detail title="Specifications">
                <dl className="divide-y divide-ink/8 text-sm">
                  {specs.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-6 py-2.5">
                      <dt className="text-ink/55">{label}</dt>
                      <dd className="text-right text-ink">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </Detail>
            )}
            <Detail title="Shipping & returns">
              <div className="space-y-2 text-sm text-ink/60">
                <p>Dispatched from our studio within 3–5 working days.</p>
                <p>30-day room trial — return it if the colour is not right.</p>
                <p>
                  Read our <Link href="/policies/shipping" className="text-brand-700 underline underline-offset-2">shipping</Link> and{' '}
                  <Link href="/policies/returns" className="text-brand-700 underline underline-offset-2">returns</Link> policies.
                </p>
              </div>
            </Detail>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-24 scroll-mt-40 border-t border-ink/10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl">Customer reviews</h2>
            {rating && rating.count > 0 ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-ink/60">
                <Stars rating={rating.average} />
                {rating.average.toFixed(1)} out of 5 from {rating.count} {rating.count === 1 ? 'review' : 'reviews'}
              </p>
            ) : (
              <p className="mt-3 text-sm text-ink/60">No reviews yet. Bought this rug? Be the first to share how it looks at home.</p>
            )}
            <ul className="mt-8 divide-y divide-ink/10">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <Stars rating={r.rating} />
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">{r.body}</p>
                  <p className="mt-3 text-xs text-ink/55">{r.name} · {formatDate(r.createdAt)}</p>
                </li>
              ))}
            </ul>
          </div>
          <ReviewForm productId={product.id} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-10 font-display text-3xl">You may also like</h2>
          <ProductGrid products={related} className="lg:grid-cols-4" />
        </section>
      )}

      <StickyBuyBar line={cartLine} stock={product.stock} currency={product.currency} />
    </div>
  );
}

function Detail({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-lg font-normal leading-none text-ink/55 group-open:hidden">+</span>
        <span aria-hidden="true" className="hidden text-lg font-normal leading-none text-ink/55 group-open:inline">−</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
