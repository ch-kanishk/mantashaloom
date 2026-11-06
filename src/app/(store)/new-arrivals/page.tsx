import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductGrid } from '@/components/ProductGrid';
import { getNewArrivals } from '@/lib/queries';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 300;

export const metadata = buildMetadata({
  title: 'New Arrivals — Latest Handmade Rugs',
  description: 'The newest hand-knotted and hand-tufted rugs from our studio.',
  path: '/new-arrivals',
});

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);

  return (
    <div className="container-page pb-20">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'New Arrivals', url: '/new-arrivals' }]} />
      <header className="border-b border-ink/10 pb-10 pt-4">
        <h1 className="font-display text-5xl">New Arrivals</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">Just off the looms in India.</p>
      </header>
      <div className="pt-10"><ProductGrid products={products} /></div>
    </div>
  );
}
