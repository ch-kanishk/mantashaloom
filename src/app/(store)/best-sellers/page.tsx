import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { getBestSellers } from '@/lib/queries';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata = buildMetadata({
  title: 'Best-Selling Handmade Rugs',
  description: 'The handmade wool and silk rugs our customers choose most, woven in India and shipped worldwide.',
  path: '/best-sellers',
});

export default async function BestSellersPage() {
  const products = await getBestSellers(24);

  return (
    <div className="container-page pb-20">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Best Sellers', url: '/best-sellers' }]} />
      <header className="border-b border-ink/10 pb-10 pt-4">
        <h1 className="font-display text-5xl">Best Sellers</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">The rugs our customers choose most.</p>
      </header>
      <div className="pt-10"><ProductGrid products={products} /></div>
    </div>
  );
}
