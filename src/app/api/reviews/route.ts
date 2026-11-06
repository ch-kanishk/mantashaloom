import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const schema = z.object({
  productId: z.string().min(1).max(40),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().or(z.literal('')),
  body: z.string().trim().min(10).max(2000),
  company: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    // Silently accept honeypot submissions so bots do not learn they were caught.
    if (data.company) return NextResponse.json({ ok: true });

    const product = await prisma.product.findFirst({
      where: { id: data.productId, isActive: true },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: 'This rug is no longer available.' }, { status: 404 });

    // One review per email per rug; a repeat is accepted but not stored twice.
    await prisma.review.createMany({
      data: [{
        productId: product.id,
        name: data.name,
        email: data.email,
        rating: data.rating,
        title: data.title || null,
        body: data.body,
      }],
      skipDuplicates: true,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof z.ZodError ? 'Please complete all required fields.' : 'Could not save your review.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
