'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Best Sellers', href: '/best-sellers' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Custom Rugs', href: '/custom-orders' },
  { label: 'Our Story', href: '/about' },
  { label: 'Our Process', href: '/process' },
  { label: 'Journal', href: '/blog' },
];

const TECHNIQUES = [
  { label: 'Hand-Knotted', href: '/collections/hand-knotted' },
  { label: 'Hand-Tufted', href: '/collections/hand-tufted' },
  { label: 'Flatweave', href: '/collections/flatweave' },
  { label: 'Runners', href: '/collections/runners' },
];

const ROOMS = ['Living Room', 'Bedroom', 'Dining Room', 'Hallway'].map((room) => ({
  label: room,
  href: `/rugs?room=${encodeURIComponent(room)}`,
}));

const styleHref = (style: string) => `/rugs?style=${encodeURIComponent(style)}`;

export function Header({ styles }: { styles: string[] }) {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Bumped on navigation to remount the Rugs menu, which would otherwise stay
  // open after a click because the link inside it keeps :focus-within.
  const [menuKey, setMenuKey] = useState(0);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setMenuKey((k) => k + 1);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper">
      <div className="bg-night text-ink/80">
        <div className="container-page flex min-h-8 items-center justify-center py-1 text-center text-[11px] uppercase tracking-[0.16em]">
          Free shipping across India on orders above ₹15,000
        </div>
      </div>

      <div className="container-page grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid-cols-[auto_1fr_auto] lg:gap-10">
        <div className="flex items-center lg:contents">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className="-ml-2 p-2 lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
        </div>

        <Link href="/" aria-label="Mantashaloom — home" className="shrink-0 lg:order-first">
          <Logo variant="wordmark" height={20} priority className="h-4 w-auto sm:h-5" />
        </Link>

        <nav aria-label="Primary" className="hidden h-full justify-center lg:flex">
          <ul className="flex h-full items-center gap-8">
            <li key={menuKey} className="group flex h-full items-center">
              <Link href="/rugs" className="nav-link">Rugs</Link>
              <div className="invisible absolute inset-x-0 top-full border-y border-ink/10 bg-paper opacity-0 shadow-sm transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="container-page grid grid-cols-5 gap-10 py-10">
                  <MenuColumn title="By room" links={ROOMS} />
                  <MenuColumn title="By style" links={styles.map((s) => ({ label: s, href: styleHref(s) }))} />
                  <MenuColumn title="By technique" links={TECHNIQUES} />
                  <MenuColumn
                    title="Discover"
                    links={[
                      { label: 'All Rugs', href: '/rugs' },
                      { label: 'Best Sellers', href: '/best-sellers' },
                      { label: 'New Arrivals', href: '/new-arrivals' },
                      { label: 'Custom Rugs', href: '/custom-orders' },
                    ]}
                  />
                  <Link href="/custom-orders" className="group/tile relative block aspect-[4/3] overflow-hidden bg-sand">
                    <Image
                      src="https://images.unsplash.com/photo-1766405831946-2b7f1653ed8f?w=600&q=80"
                      alt=""
                      fill
                      sizes="20vw"
                      className="object-cover transition-transform duration-700 group-hover/tile:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 font-display text-xl text-white">
                      Design your own rug
                    </span>
                  </Link>
                </div>
              </div>
            </li>
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link href={item.href} className={cn('nav-link', active && 'text-brand-700')}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-label="Search rugs"
            className="p-2"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" />
            </svg>
          </button>
          <Link href="/cart" className="relative -mr-2 p-2" aria-label={`Cart, ${ready ? count : 0} items`}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2l1.5 4h13L19 15H8L6 2H3" />
              <circle cx="10" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
            </svg>
            {ready && count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold text-paper">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-ink/10">
          <form action="/search" role="search" className="container-page py-4">
            <label htmlFor="site-search" className="sr-only">Search rugs</label>
            <input id="site-search" name="q" autoFocus placeholder="Search rugs…" className="input" />
          </form>
        </div>
      )}

      {open && (
        <nav aria-label="Mobile" className="max-h-[75vh] overflow-y-auto border-t border-ink/10 bg-paper lg:hidden">
          <ul className="container-page py-2">
            {[{ label: 'All Rugs', href: '/rugs' }, ...NAV, { label: 'Contact', href: '/contact' }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block border-b border-ink/5 py-3 text-sm uppercase tracking-wider text-ink/80">
                  {item.label}
                </Link>
              </li>
            ))}
            {[...ROOMS, ...styles.map((s) => ({ label: `${s} rugs`, href: styleHref(s) })), ...TECHNIQUES].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block border-b border-ink/5 py-2.5 pl-4 text-sm text-ink/65">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function MenuColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-ink">{title}</p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-ink/65 transition-colors hover:text-brand-700">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
