import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { HeroCarousel, type HeroSlide } from '@/components/HeroCarousel';
import { ProductCard } from '@/components/ProductCard';
import { ProductGrid } from '@/components/ProductGrid';
import { ReviewCard } from '@/components/ReviewCard';
import { Stars } from '@/components/Stars';
import { getBestSellers, getNewArrivals, getRecentReviews, getReviewSummary, getStyleTiles } from '@/lib/queries';
import { JsonLd } from '@/components/JsonLd';
import { faqJsonLd } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

export const revalidate = 300;

const U = (id: string, w = 1400) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

const HERO_SLIDES: HeroSlide[] = [
  {
    image: U('1710924447533-7177c52b3da3', 2000),
    alt: 'Close view of a colourful hand-knotted rug in red, gold and blue',
    eyebrow: 'Handmade in India',
    title: 'Rugs made one knot at a time',
    cta: { label: 'Shop all rugs', href: '/rugs' },
  },
  {
    image: U('1671576518293-113ca5c64648', 2000),
    alt: 'A patterned wool rug partly rolled, showing its pile and border',
    eyebrow: 'New on the loom',
    title: 'Quiet colour, deep texture',
    cta: { label: 'See new arrivals', href: '/new-arrivals' },
  },
  {
    image: U('1671576652775-829742b71c83', 2000),
    alt: 'A rolled handmade rug in terracotta, ivory and blue',
    eyebrow: 'Custom rugs',
    title: 'Woven to fit your room',
    cta: { label: 'Design your own', href: '/custom-orders' },
  },
];

const ROOM_TILES = [
  { room: 'Living Room', image: U('1534889156217-d643df14f14a', 900) },
  { room: 'Bedroom', image: U('1560185893-a55cbc8c57e8', 900) },
  { room: 'Dining Room', image: U('1783840496479-97a42db36a47', 900) },
  { room: 'Hallway', image: U('1621700052663-f1170e9b26ec', 900) },
];

const COLOURS = [
  { name: 'Ivory', hex: '#efe8da' }, { name: 'Beige', hex: '#d3c1a5' }, { name: 'Gold', hex: '#c29a4b' },
  { name: 'Rust', hex: '#a4532f' }, { name: 'Green', hex: '#55684a' }, { name: 'Blue', hex: '#2f4a68' },
  { name: 'Grey', hex: '#9b9a96' }, { name: 'Charcoal', hex: '#3a3a3a' },
];

const HOME_FAQS = [
  { q: 'What is the difference between hand-knotted and hand-tufted rugs?',
    a: 'A hand-knotted rug is woven knot by knot on a loom and can take months to complete, giving it a lifespan of several decades. A hand-tufted rug is punched into a canvas backing with a tufting tool, which is faster to make and more affordable while still handcrafted.' },
  { q: 'How much is shipping?',
    a: 'Shipping within India is free on orders above ₹15,000. For delivery outside India, contact us for a quote.' },
  { q: 'Can I order a custom size or colour?',
    a: 'Yes. Share your size, colours and any reference images through our custom rugs page and our team will reply with a quote and timeline.' },
  { q: 'How do I care for a wool rug?',
    a: 'Vacuum weekly without a beater bar, rotate the rug every six months for even wear, blot spills immediately with a dry cloth, and have it professionally cleaned every two to three years.' },
];

const CRAFT_STEPS = [
  { n: '01', title: 'Design', body: 'Every rug begins as a drawn design, mapped onto a graph where each square is one knot.' },
  { n: '02', title: 'Dye', body: 'Yarn is dyed in small batches, which gives each rug its gentle variation of tone.' },
  { n: '03', title: 'Weave', body: 'Weavers tie each knot by hand on the loom, row by row, following the graph.' },
  { n: '04', title: 'Finish', body: 'The rug is washed, clipped and stretched flat before a final quality inspection.' },
];

export default async function HomePage() {
  const [bestSellers, newArrivals, styles, reviews, reviewSummary, posts, collections] = await Promise.all([
    getBestSellers(8),
    getNewArrivals(4),
    getStyleTiles(),
    getRecentReviews(3),
    getReviewSummary(),
    prisma.post.findMany({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' }, take: 3 }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 3 }),
  ]);

  return (
    <>
      <JsonLd data={faqJsonLd(HOME_FAQS)} />

      <HeroCarousel slides={HERO_SLIDES} />

      {/* USP strip */}
      <section aria-label="Why shop with us" className="border-b border-ink/10">
        <div className="container-page grid grid-cols-2 gap-4 py-5 text-center text-xs uppercase tracking-[0.14em] text-ink/70 lg:grid-cols-4">
          {['Made by hand', 'Free shipping over ₹15,000', 'Custom sizes & colours', 'Secure checkout'].map((usp) => (
            <p key={usp}>{usp}</p>
          ))}
        </div>
      </section>

      {/* Shop by room */}
      <section className="container-page py-20">
        <CentredHeader title="Shop by room" subtitle="Find the right rug for every space in your home." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ROOM_TILES.map((tile) => (
            <Link key={tile.room} href={`/rugs?room=${encodeURIComponent(tile.room)}`} className="group relative block aspect-[3/4] overflow-hidden bg-sand">
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 text-center font-display text-2xl text-white">
                {tile.room}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="container-page pb-20">
          <CentredHeader title="Best sellers" />
          <div className="rail">
            {bestSellers.map((product) => (
              <div key={product.id} className="w-[70%] shrink-0 snap-start sm:w-[42%] lg:w-[calc(25%-15px)]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center"><Link href="/best-sellers" className="btn-outline">View all</Link></p>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="bg-sand py-20">
          <div className="container-page">
            <CentredHeader title="Explore our collections" />
            <div className="grid gap-5 md:grid-cols-3">
              {collections.map((collection) => (
                <Link key={collection.id} href={`/collections/${collection.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                    {collection.heroImage && (
                      <Image
                        src={collection.heroImage}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="mt-5 text-center font-display text-2xl">{collection.name}</h3>
                  <p className="mt-1 text-center text-xs uppercase tracking-[0.16em] text-ink/60 underline underline-offset-4">
                    Explore the collection
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Maker story */}
      <section className="relative h-[70vh] min-h-[440px] overflow-hidden bg-night">
        <Image
          src={U('1619444978283-cccfb92c357d', 2000)}
          alt="The border of a dark hand-knotted rug in low light"
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="container-page relative flex h-full flex-col items-center justify-center text-center text-white">
          <p className="text-xs uppercase tracking-[0.28em] text-white/85">Our story</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Every rug carries the hand that made it</h2>
          <Link href="/about" className="btn mt-8 border border-white text-white hover:bg-white hover:text-paper">Read our story</Link>
        </div>
      </section>

      {/* Shop by style */}
      {styles.length > 0 && (
        <section className="container-page py-20">
          <CentredHeader title="Shop by style" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {styles.slice(0, 5).map((tile) => (
              <Link key={tile.style} href={`/rugs?style=${encodeURIComponent(tile.style)}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-full bg-sand">
                  {tile.image && (
                    <Image
                      src={tile.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <h3 className="mt-4 text-center font-display text-xl transition-colors group-hover:text-brand-700">{tile.style}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Shop by colour */}
      <section className="container-page pb-20">
        <CentredHeader title="Shop by colour" />
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
          {COLOURS.map((colour) => (
            <Link key={colour.name} href={`/rugs?color=${colour.name}`} className="group text-center">
              <span
                className="mx-auto block h-16 w-16 rounded-full border border-ink/30 transition-transform group-hover:scale-110"
                style={{ backgroundColor: colour.hex }}
              />
              <span className="mt-2 block text-xs uppercase tracking-[0.12em] text-ink/70">{colour.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-page pb-20">
          <CentredHeader title="New arrivals" />
          <ProductGrid products={newArrivals} className="lg:grid-cols-4" />
          <p className="mt-10 text-center"><Link href="/new-arrivals" className="btn-outline">View all</Link></p>
        </section>
      )}

      {/* Custom orders */}
      <section className="grid bg-sand lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[520px]">
          <Image
            src={U('1594040226829-7f251ab46d80')}
            alt="Someone standing barefoot on a flatwoven rug in blue, red and ivory"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="px-6 py-14 text-center lg:px-20">
          <p className="eyebrow">Custom rugs</p>
          <h2 className="mt-3 font-display text-4xl leading-tight">Made to fit your room</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/65">
            Any design, woven to your size, colours and shape. Send us your brief and we will reply with a
            quote and timeline.
          </p>
          <Link href="/custom-orders" className="btn-primary mt-8">Start a custom order</Link>
        </div>
      </section>

      {/* Craft steps */}
      <section className="container-page py-20">
        <CentredHeader title="How a rug is made" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {CRAFT_STEPS.map((step) => (
            <div key={step.n} className="text-center">
              <p className="font-display text-3xl text-brand-600">{step.n}</p>
              <h3 className="mt-2 font-display text-2xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews — only ever shows approved customer reviews */}
      {reviews.length > 0 && (
        <section className="border-t border-ink/10 bg-sand py-20">
          <div className="container-page">
            <header className="mb-10 text-center">
              <p className="eyebrow">Customer reviews</p>
              <h2 className="mt-3 font-display text-4xl">In their own words</h2>
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-ink/60">
                <Stars rating={reviewSummary.average} />
                {reviewSummary.average.toFixed(1)} from {reviewSummary.count} {reviewSummary.count === 1 ? 'review' : 'reviews'}
              </p>
            </header>
            <div className="flex flex-col justify-center gap-5 md:flex-row">
              {reviews.map((r) => (
                <div key={r.id} className="flex md:w-1/3 [&>article]:w-full"><ReviewCard review={r} /></div>
              ))}
            </div>
            <p className="mt-10 text-center">
              <Link href="/reviews" className="text-sm uppercase tracking-[0.12em] text-brand-700 underline underline-offset-8">
                Read all reviews
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Journal */}
      {posts.length > 0 && (
        <section className="container-page py-20">
          <header className="mb-10 text-center">
            <p className="eyebrow">The journal</p>
            <h2 className="mt-3 font-display text-4xl">Styling notes & care guides</h2>
          </header>
          <div className="grid gap-8 md:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-sand">
                    {post.coverImage && (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ink/55">
                    {post.publishedAt ? formatDate(post.publishedAt) : ''}
                  </p>
                  <h3 className="mt-2 font-display text-xl leading-snug transition-colors group-hover:text-brand-700">
                    {post.title}
                  </h3>
                  {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-ink/60">{post.excerpt}</p>}
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — mirrors the FAQPage JSON-LD above for rich results */}
      <section className="border-t border-ink/10 bg-sand py-20">
        <div className="container-page max-w-3xl">
          <h2 className="mb-10 text-center font-display text-4xl">Frequently asked</h2>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {HOME_FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg text-ink [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span aria-hidden="true" className="font-body text-xl text-ink/55 group-open:hidden">+</span>
                  <span aria-hidden="true" className="hidden font-body text-xl text-ink/55 group-open:inline">−</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CentredHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-10 text-center">
      <h2 className="font-display text-4xl sm:text-[42px]">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-ink/60">{subtitle}</p>}
    </header>
  );
}
