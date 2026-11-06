import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CustomOrderForm } from '@/components/CustomOrderForm';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Custom Rugs — Any Size, Colour or Shape',
  description:
    'Commission a handmade rug woven to your exact size, colours and shape in India. Share your brief and get a quote and timeline within two working days.',
  path: '/custom-orders',
});

const STEPS = [
  { n: '01', title: 'Share your brief', body: 'Tell us the size, shape and colours, or start from any design in our catalogue.' },
  { n: '02', title: 'Get a quote', body: 'Our studio replies within two working days with a price and timeline.' },
  { n: '03', title: 'We weave it', body: 'Your rug is made by hand on our looms in India.' },
  { n: '04', title: 'Delivered to you', body: 'It is washed, finished, inspected and shipped by tracked, insured courier.' },
];

export default async function CustomOrdersPage({
  searchParams,
}: { searchParams: Promise<{ rug?: string }> }) {
  const { rug } = await searchParams;
  const product = rug
    ? await prisma.product.findFirst({ where: { slug: rug, isActive: true }, select: { name: true } })
    : null;

  return (
    <div className="container-page pb-20">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Custom Orders', url: '/custom-orders' }]} />

      <header className="max-w-2xl py-8">
        <p className="eyebrow">Made to measure</p>
        <h1 className="mt-3 font-display text-5xl">Your rug, your way</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/65">
          Every design we make can be woven to a custom size, colour palette or shape. Measure in centimetres
          where you can — it is the most precise way to tell us what fits your room.
        </p>
      </header>

      <ol className="grid grid-cols-2 gap-8 border-y border-ink/10 py-10 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.n}>
            <p className="font-display text-3xl text-brand-500">{step.n}</p>
            <h2 className="mt-2 font-body text-sm font-medium uppercase tracking-[0.14em]">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-14 max-w-3xl">
        <CustomOrderForm rugName={product?.name} />
      </div>
    </div>
  );
}
