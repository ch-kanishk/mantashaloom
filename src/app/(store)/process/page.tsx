import { existsSync } from 'fs';
import path from 'path';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InViewVideo } from '@/components/InViewVideo';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/config';

export const metadata = buildMetadata({
  title: 'Our Process — How a Handmade Rug Is Made',
  description:
    'From natural wool to a finished rug: wool dyeing, hand-knotting and weaving, washing and clipping, by the artisans of Mantashaloom.',
  path: '/process',
});

/**
 * Each step's video lives at public/process/<slug>.mp4 (optional poster:
 * <slug>.jpg). A step without a video file renders as text only, so videos can
 * be added one at a time by dropping files in and redeploying.
 */
const STEPS: {
  slug: string;
  name: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
}[] = [
  {
    slug: 'dyeing',
    name: 'Wool dyeing',
    title: 'From natural wool to beautiful colours',
    paragraphs: [
      'Our process begins with carefully shearing natural wool from sheep, followed by thorough washing and cleaning to remove dirt and impurities. The clean fibres are then processed, carded, and spun into yarn, ready for dyeing.',
      'The wool is naturally white, and we carefully select the desired shades using our ARS POM Colour Box and specific colour numbers. Using an eco-conscious dyeing approach, the wool is immersed in heated dye baths, where controlled high temperatures help the colour penetrate the fibres evenly.',
      'Each shade requires precise colour knowledge, experience, patience, and careful temperature control. Through this skilled process, natural white wool is transformed into beautifully coloured yarn, ready to become part of our handmade rugs.',
    ],
  },
  {
    slug: 'weaving',
    name: 'Weaving',
    title: 'The art of hand-knotting & weaving',
    paragraphs: [
      'Our weaving process begins by carefully setting up the loom, where each warp thread is aligned and secured with precision. Before weaving begins, our skilled artisans study the design map, following every colour, pattern, and individual knot.',
      'Using this map as their guide, they hand-tie each knot one by one, carefully trimming the wool as the design develops. From the central pattern to the intricate borders, every detail is created through patience, concentration, and exceptional craftsmanship.',
      'As a handmade process, weaving typically takes approximately 3–5 weeks, depending on the design and size. However, larger, custom-sized rugs or those with particularly intricate and dense patterns may require 7–8 weeks to complete. Every knot reflects the hard work, dedication, and artistry of our craftsmen.',
    ],
  },
  {
    slug: 'washing',
    name: 'Washing',
    title: 'Washing – bringing every knot to life',
    subtitle: 'A delicate process of purification and perfection',
    paragraphs: [
      'Washing is one of the most essential stages in the making of a handmade hand-knotted rug. After weeks of meticulous knotting, each rug undergoes a carefully controlled washing process to remove excess dust, loose fibres, and impurities while enhancing the natural beauty of its colours and textures.',
      'Our skilled artisans use traditional washing techniques combined with expert handling to ensure that every rug receives the care it deserves. Special attention is given to the quality of water, cleaning solutions, and washing methods to preserve the integrity of the fibres and the richness of the colours.',
      'The result is a rug that feels softer, looks more vibrant, and reflects the true beauty of handcrafted artistry.',
    ],
  },
  {
    slug: 'clipping',
    name: 'Clipping',
    title: 'Clipping – defining the beauty of every knot',
    subtitle: 'Precision, patience & perfect finishing',
    paragraphs: [
      'Clipping is a crucial stage in the manufacturing of handmade hand-knotted rugs. After the weaving process is completed, the rug undergoes careful clipping to achieve an even pile height, a smooth surface, and a well-defined appearance.',
      'Our skilled artisans use specialised tools and years of experience to carefully trim excess wool or silk fibres from the rug’s surface. Every movement requires precision and attention to detail to ensure uniformity while preserving the intricate patterns and designs created during the knotting process.',
      'This meticulous process enhances the clarity of the motifs, highlights the depth of colours, and gives the rug its refined texture and luxurious finish.',
    ],
  },
];

const publicFile = (file: string) => existsSync(path.join(process.cwd(), 'public', 'process', file));

export default function ProcessPage() {
  return (
    <div className="container-page pb-20">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Our Process', url: '/process' }]} />

      <header className="mx-auto max-w-3xl py-10 text-center">
        <p className="eyebrow">Our process</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">How a {site.name} rug is made</h1>
        <p className="mt-6 text-base leading-relaxed text-ink/65">
          Four stages, all by hand: from naturally white wool to a finished rug.
        </p>
        <ol className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink/60">
          {STEPS.map((s, i) => (
            <li key={s.slug}>
              <a href={`#${s.slug}`} className="hover:text-ink">
                <span className="text-brand-700">{String(i + 1).padStart(2, '0')}</span> {s.name}
              </a>
            </li>
          ))}
        </ol>
      </header>

      <div className="mx-auto max-w-6xl space-y-24">
        {STEPS.map((step, i) => {
          const hasVideo = publicFile(`${step.slug}.mp4`);
          const poster = publicFile(`${step.slug}.jpg`) ? `/process/${step.slug}.jpg` : undefined;
          return (
            <section
              key={step.slug}
              id={step.slug}
              className={
                hasVideo
                  ? 'grid scroll-mt-24 items-center gap-10 md:grid-cols-2 md:gap-16'
                  : 'mx-auto max-w-3xl scroll-mt-24'
              }
            >
              {hasVideo && (
                <div className={i % 2 === 1 ? 'md:order-last' : undefined}>
                  {/* Natural aspect: the clips mix portrait and landscape. */}
                  <InViewVideo
                    className="mx-auto block h-auto max-h-[80vh] w-auto max-w-full bg-sand"
                    src={`/process/${step.slug}.mp4`}
                    poster={poster}
                    label={`${step.name} at the ${site.name} workshop`}
                  />
                </div>
              )}
              <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
                <p className="eyebrow">
                  Step {String(i + 1).padStart(2, '0')} · {step.name}
                </p>
                <h2 className="font-display text-3xl leading-tight text-ink">{step.title}</h2>
                {step.subtitle && <p className="font-display text-lg italic text-ink/80">{step.subtitle}</p>}
                {step.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-24 flex flex-wrap justify-center gap-4">
        <Link href="/rugs" className="btn-primary">Shop the collection</Link>
        <Link href="/about" className="btn border border-ink/20 text-ink hover:border-ink/50">Read our story</Link>
      </div>
    </div>
  );
}
