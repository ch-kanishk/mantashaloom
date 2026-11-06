'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  cta: { label: string; href: string };
}

const INTERVAL_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured rugs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-night"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.title}
          aria-hidden={i !== active}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            i === active ? 'opacity-100' : 'invisible opacity-0'
          )}
        >
          <Image src={slide.image} alt={slide.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />
          <div className="absolute inset-x-0 bottom-20 px-6 text-center text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-white/85">{slide.eyebrow}</p>
            {i === 0 ? (
              <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-[1.08] sm:text-7xl">{slide.title}</h1>
            ) : (
              <p className="mx-auto mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.08] sm:text-7xl">{slide.title}</p>
            )}
            <Link href={slide.cta.href} className="btn mt-8 bg-white text-paper hover:bg-ink">
              {slide.cta.label}
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-7 flex justify-center gap-1">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1}: ${slide.title}`}
            aria-current={i === active}
            className="p-2"
          >
            <span className={cn('block h-0.5 w-9 transition-colors', i === active ? 'bg-white' : 'bg-white/40')} />
          </button>
        ))}
      </div>
    </section>
  );
}
