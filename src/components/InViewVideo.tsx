'use client';

import { useEffect, useRef } from 'react';

/**
 * Muted, looping video that only downloads and plays while on screen, so a page
 * with several clips does not fetch them all up front. Shows the poster until
 * then; viewers can unmute or pause with the native controls.
 */
export function InViewVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay blocked; controls remain */
          });
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      controls
      preload="none"
      aria-label={label}
    />
  );
}
