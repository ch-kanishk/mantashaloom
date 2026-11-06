import { ProductCard } from './ProductCard';
import { getRatings, type ProductCardData } from '@/lib/queries';
import { cn } from '@/lib/utils';

export async function ProductGrid({ products, className }: { products: ProductCardData[]; className?: string }) {
  if (!products.length) {
    return (
      <div className="col-span-full py-24 text-center">
        <p className="font-display text-2xl text-ink">No rugs match these filters</p>
        <p className="mt-2 text-sm text-ink/60">Try widening your selection or clearing a filter.</p>
      </div>
    );
  }
  const ratings = await getRatings(products.map((p) => p.id));
  return (
    <div className={cn('grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} rating={ratings.get(p.id)} />
      ))}
    </div>
  );
}
