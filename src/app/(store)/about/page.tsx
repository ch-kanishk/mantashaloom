import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/config';

export const metadata = buildMetadata({
  title: 'Our Story — Handmade Rugs from India',
  description:
    'Mantashaloom makes hand-knotted and hand-tufted rugs by hand on the loom. Read about how each rug is designed, dyed and woven.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="container-page pb-20">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />

      <header className="mx-auto max-w-3xl py-10 text-center">
        <p className="eyebrow">Our story</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">Made by hand, made to last</h1>
        <p className="mt-6 text-base leading-relaxed text-ink/65">
          {site.name} makes rugs the way they have long been made in India — slowly, by hand, and to be
          kept for decades.
        </p>
      </header>

      <div className="relative aspect-[21/9] w-full overflow-hidden bg-sand">
        <Image
          src="https://images.unsplash.com/photo-1726464107536-3b62e6d3d2cb?w=2000&q=80"
          alt="Handmade rugs in shades of red and rose, stacked and folded"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-14 sm:grid-cols-3">
        {[
          ['200+', 'Weaving families we buy from directly, with no middlemen'],
          ['40+', 'Countries we have shipped a finished rug to'],
          ['9 months', 'Average time to complete an 8×10 hand-knotted carpet'],
        ].map(([stat, label]) => (
          <div key={stat} className="text-center">
            <p className="font-display text-4xl text-brand-700">{stat}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{label}</p>
          </div>
        ))}
      </div>

      <section className="mx-auto mt-20 max-w-3xl space-y-8 text-[15px] leading-relaxed text-ink/75">
        <div>
          <h2 className="mb-3 font-display text-2xl text-ink">How we work</h2>
          <p>
            Every design starts as a hand-painted graph — a grid where each square is one knot. A master
            weaver reads that graph aloud in a sing-song code called <em>talim</em>, and the family at the
            loom ties the wool accordingly. Nothing about this can be rushed. A finely knotted 8×10 rug at
            300 knots per square inch contains close to three and a half million knots.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-display text-2xl text-ink">Our materials</h2>
          <p>
            We choose wool for its spring and resilience and silk for its lustre, and dye yarn in small
            batches so that every rug carries a gentle, natural variation of tone.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-display text-2xl text-ink">Why handmade</h2>
          <p>
            A handmade rug wears slowly, can be repaired and is often handed down. Every piece has small
            irregularities that show the hand that made it, and no two are quite the same.
          </p>
        </div>
      </section>

      <div className="mt-16 text-center">
        <Link href="/rugs" className="btn-primary">Shop the collection</Link>
      </div>
    </div>
  );
}
