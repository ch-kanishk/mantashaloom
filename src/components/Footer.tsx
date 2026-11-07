import Link from 'next/link';
import { site } from '@/lib/config';
import { NewsletterForm } from './NewsletterForm';
import { Logo } from './Logo';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Rugs', href: '/rugs' },
      { label: 'Best Sellers', href: '/best-sellers' },
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Hand-Knotted', href: '/collections/hand-knotted' },
      { label: 'Hand-Tufted', href: '/collections/hand-tufted' },
      { label: 'Flatweave & Dhurrie', href: '/collections/flatweave' },
      { label: 'Runners', href: '/collections/runners' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Our Process', href: '/process' },
      { label: 'Custom Orders', href: '/custom-orders' },
      { label: 'Customer Reviews', href: '/reviews' },
      { label: 'The Journal', href: '/blog' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Trade Programme', href: '/contact?topic=trade' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping & Delivery', href: '/policies/shipping' },
      { label: 'Returns & Refunds', href: '/policies/returns' },
      { label: 'Rug Care Guide', href: '/blog' },
      { label: 'Privacy Policy', href: '/policies/privacy' },
      { label: 'Terms of Service', href: '/policies/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20">
      <section aria-label="Newsletter" className="bg-sand">
        <div className="container-page mx-auto flex flex-col items-center py-14 text-center">
          <h2 className="font-display text-3xl">Join the {site.name} circle</h2>
          <p className="mt-2 max-w-md text-sm text-ink/60">New rugs, styling notes and care guides, in your inbox.</p>
          <div className="mt-6 w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>

      <div className="bg-night text-white">
        <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" aria-label="Mantashaloom — home" className="inline-block">
              <Logo variant="wordmark" tone="light" height={20} className="h-5 w-auto" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Hand-knotted and hand-tufted rugs, made one knot at a time for floors that outlive trends.
            </p>
            <div className="mt-5 flex gap-5 text-xs uppercase tracking-[0.14em] text-white/60">
              <a href={site.social.instagram} rel="noopener" className="hover:text-white">Instagram</a>
              <a href={site.social.facebook} rel="noopener" className="hover:text-white">Facebook</a>
              <a href={site.social.pinterest} rel="noopener" className="hover:text-white">Pinterest</a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 font-body text-xs font-medium uppercase tracking-[0.18em] text-white">{col.title}</h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
            <p className="flex items-center gap-3">
              <span>Secure payments by Razorpay</span>
              <span aria-hidden="true">·</span>
              <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
