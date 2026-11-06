'use client';

import { useState } from 'react';

export function ReviewForm({ productId }: { productId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(fd.entries()), productId, rating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save your review.');
      setState('done');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Could not save your review.');
    }
  }

  if (state === 'done') {
    return (
      <div className="flex items-center justify-center self-start border border-ink/10 p-10 text-center">
        <div>
          <p className="font-display text-2xl">Thank you</p>
          <p className="mt-3 text-sm text-ink/60">Your review will appear here once our studio has checked it.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 self-start border border-ink/10 p-6">
      <h3 className="font-display text-xl">Write a review</h3>

      <fieldset>
        <legend className="label">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer text-2xl leading-none">
              <input
                type="radio"
                name="rating-choice"
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
              />
              <span aria-hidden="true" className={`peer-focus-visible:outline peer-focus-visible:outline-2 ${n <= rating ? 'text-brand-500' : 'text-ink/15'}`}>★</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="r-name" className="label">Name</label>
        <input id="r-name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="r-email" className="label">Email (never shown)</label>
        <input id="r-email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="r-title" className="label">Headline (optional)</label>
        <input id="r-title" name="title" maxLength={120} className="input" />
      </div>
      <div>
        <label htmlFor="r-body" className="label">Your review</label>
        <textarea id="r-body" name="body" rows={4} required minLength={10} maxLength={2000} className="input" />
      </div>

      {/* Honeypot — bots fill this, humans never see it. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="r-company">Company</label>
        <input id="r-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state === 'error' && <p role="alert" className="text-sm text-red-400">{message}</p>}

      <button type="submit" disabled={state === 'loading'} className="btn-primary w-full">
        {state === 'loading' ? 'Sending…' : 'Submit review'}
      </button>
    </form>
  );
}
