import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/config';

export const metadata = buildMetadata({
  title: 'Our Story — A Legacy Reimagined',
  description:
    'A rug-making family since 1984. From Afgaan Arts to Mantashaloom: handmade rugs once again reaching the United States, Australia, UAE and Germany.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="container-page pb-20">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />

      <header className="mx-auto max-w-3xl py-10 text-center">
        <p className="eyebrow">Our story</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">A legacy reimagined</h1>
        <p className="mt-6 text-base leading-relaxed text-ink/65">
          Three generations of rug makers, one journey that has come full circle.
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
          ['1984', 'The year our family founded Afgaan Arts'],
          ['3 generations', 'Of rug makers, from my grandfather to me'],
          ['4 countries', 'Our rugs reach today: the US, Australia, UAE and Germany'],
        ].map(([stat, label]) => (
          <div key={stat} className="text-center">
            <p className="font-display text-4xl text-brand-700">{stat}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{label}</p>
          </div>
        ))}
      </div>

      <section className="mx-auto mt-20 max-w-3xl space-y-5 text-[15px] leading-relaxed text-ink/75">
        <h2 className="mb-3 font-display text-3xl text-ink">Our story</h2>
        <p>
          Our journey began in 1984, when my grandfather, my father, and my five uncles came together to
          establish a rug manufacturing company called Afgaan Arts. Built on craftsmanship, dedication, and
          family values, the company grew into a successful business, exporting handmade rugs to countries
          including Germany, the United States, Canada, and Australia.
        </p>
        <p>
          Over time, changing circumstances led to a decline in exports, and eventually, the company had to
          close. Our family continued its passion for rug making by working in India&rsquo;s manufacturing
          industry.
        </p>
        <p>
          As I grew older, I knew I wanted to carry this legacy forward. At the age of 20, I decided to build
          something of my own. With seven years of learning, hands-on experience, hard work, determination,
          and my family&rsquo;s support, I developed the skills and confidence to establish my own company.
        </p>
        <p>
          Today, my journey has come full circle. Our rugs are once again reaching international markets,
          including the United States, Australia, UAE, and Germany.
        </p>
        <blockquote className="border-l-2 border-brand-600 pl-5 font-display text-xl leading-snug text-ink">
          With {site.name}, my vision is to bring the beauty of natural materials, traditional craftsmanship,
          and thoughtfully designed rugs into homes around the world.
        </blockquote>
        <p>
          Every rug we create carries a part of our family&rsquo;s heritage, years of experience, and a passion
          for timeless craftsmanship.
        </p>
        <p className="font-display text-lg text-ink">Thank you for being a part of our journey.</p>
      </section>

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

      <div className="mt-16 flex flex-wrap justify-center gap-4">
        <Link href="/rugs" className="btn-primary">Shop the collection</Link>
        <Link href="/process" className="btn border border-ink/20 text-ink hover:border-ink/50">See how our rugs are made</Link>
      </div>
    </div>
  );
}
