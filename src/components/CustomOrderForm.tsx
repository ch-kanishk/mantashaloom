'use client';

import { useState } from 'react';

const SHAPES = ['Rectangle', 'Round', 'Runner', 'Square', 'Irregular'];

export function CustomOrderForm({ rugName }: { rugName?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    const v = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    // Custom requests land in the admin Enquiries inbox with everything else.
    const body = [
      v.rug && `Based on: ${v.rug}`,
      `Size: ${v.width} × ${v.length} ${v.unit}`,
      `Shape: ${v.shape}`,
      v.colours && `Colours: ${v.colours}`,
      v.notes && `Notes: ${v.notes}`,
    ].filter(Boolean).join('\n');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: v.name, email: v.email, phone: v.phone, subject: 'Custom order', message: body, company: v.company,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send your request.');
      setState('done');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Could not send your request.');
    }
  }

  if (state === 'done') {
    return (
      <div className="flex h-full items-center justify-center border border-ink/10 p-10 text-center">
        <div>
          <p className="font-display text-2xl">Request received</p>
          <p className="mt-3 text-sm text-ink/60">Our studio will reply within two working days with a quote and timeline.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-ink/10 p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="co-name" className="label">Name</label>
          <input id="co-name" name="name" required minLength={2} autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="co-email" className="label">Email</label>
          <input id="co-email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="co-phone" className="label">Phone (optional)</label>
          <input id="co-phone" name="phone" type="tel" autoComplete="tel" className="input" />
        </div>
        <div>
          <label htmlFor="co-rug" className="label">Starting design (optional)</label>
          <input id="co-rug" name="rug" defaultValue={rugName} maxLength={160} placeholder="A rug from our catalogue" className="input" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <div>
          <label htmlFor="co-width" className="label">Width</label>
          <input id="co-width" name="width" type="number" min="0.5" step="0.1" required className="input" />
        </div>
        <div>
          <label htmlFor="co-length" className="label">Length</label>
          <input id="co-length" name="length" type="number" min="0.5" step="0.1" required className="input" />
        </div>
        <div>
          <label htmlFor="co-unit" className="label">Unit</label>
          <select id="co-unit" name="unit" defaultValue="cm" className="input">
            <option value="cm">cm</option>
            <option value="ft">feet</option>
          </select>
        </div>
        <div>
          <label htmlFor="co-shape" className="label">Shape</label>
          <select id="co-shape" name="shape" className="input">
            {SHAPES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="co-colours" className="label">Colours (optional)</label>
        <input id="co-colours" name="colours" maxLength={200} placeholder="e.g. ivory ground, rust and indigo accents" className="input" />
      </div>
      <div>
        <label htmlFor="co-notes" className="label">Anything else (optional)</label>
        <textarea id="co-notes" name="notes" rows={4} maxLength={2000} className="input" placeholder="The room, your deadline, a reference image link…" />
      </div>

      {/* Honeypot — bots fill this, humans never see it. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="co-company">Company</label>
        <input id="co-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {state === 'error' && <p role="alert" className="text-sm text-red-400">{message}</p>}

      <button type="submit" disabled={state === 'loading'} className="btn-primary w-full">
        {state === 'loading' ? 'Sending…' : 'Request a quote'}
      </button>
    </form>
  );
}
