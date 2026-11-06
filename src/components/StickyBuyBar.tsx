'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import type { CartLine } from '@/lib/cart';
import { formatMoney } from '@/lib/utils';

/** Keeps price and add-to-cart in reach on phones, where the buy box scrolls away. */
export function StickyBuyBar({ line, stock, currency }: { line: CartLine; stock: number; currency: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  if (stock <= 0) return null;

  function onAdd() {
    add(line);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-ink/10 bg-paper px-4 py-3 lg:hidden">
      <div className="min-w-0">
        <p className="truncate text-xs text-ink/55">{line.name}</p>
        <p className="text-sm font-medium">{formatMoney(line.price, currency)}</p>
      </div>
      <button type="button" onClick={onAdd} className="btn-primary shrink-0 px-5 py-2.5 text-xs">
        {added ? 'Added ✓' : 'Add to cart'}
      </button>
    </div>
  );
}
