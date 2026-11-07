/**
 * Razorpay payment gateway (Standard Checkout).
 * ---------------------------------------------------------------------------
 *   1. /api/checkout creates our order and a Razorpay order  -> createRazorpayOrder()
 *   2. The browser opens Razorpay's checkout popup with that order id
 *   3. On success the popup hands back payment id + signature, which the
 *      browser posts to /api/payments/razorpay/verify. The server checks the
 *      signature AND fetches the payment from Razorpay before marking it PAID.
 *   4. Razorpay also calls /api/payments/razorpay/webhook, so an order is still
 *      confirmed if the shopper closes the tab before step 3 completes.
 *
 * Keys: Dashboard -> Account & Settings -> API Keys. Test keys (rzp_test_…)
 * run real checkout flows with test cards/UPI and move no money.
 *
 * Without keys, a local dev server falls back to /checkout/mock-gateway. A
 * production build never does: checkout is refused instead, so a missing key
 * cannot turn into free orders.
 */
import crypto from 'crypto';

const API = 'https://api.razorpay.com/v1';

export function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  };
}

export function isRazorpayConfigured(cfg = getRazorpayConfig()) {
  return Boolean(cfg.keyId && cfg.keySecret);
}

/** Simulated payments: only on a dev server with no keys configured. */
export function isMockPaymentsAllowed() {
  return process.env.NODE_ENV !== 'production' && !isRazorpayConfigured();
}

function hmacHex(secret: string, data: string) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function safeEqual(expected: string, provided: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Signature returned by the checkout popup: HMAC(order_id|payment_id, key secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret || !orderId || !paymentId || !signature) return false;
  return safeEqual(hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
}

/** X-Razorpay-Signature on webhooks: HMAC(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret || !signature) return false;
  return safeEqual(hmacHex(webhookSecret, rawBody), signature);
}

async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const { keyId, keySecret } = getRazorpayConfig();
  const res = await fetch(`${API}${path}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const description = (data as any)?.error?.description;
    throw new Error(description ? `Razorpay: ${description}` : `Razorpay request failed (${res.status})`);
  }
  return data as T;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  method?: string;
  email?: string;
  contact?: string;
  error_description?: string | null;
}

/** amount in paise; receipt is our order number (max 40 chars). */
export function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return api<RazorpayOrder>('/orders', {
    method: 'POST',
    body: { amount: input.amount, currency: input.currency, receipt: input.receipt, notes: input.notes },
  });
}

export function fetchPayment(paymentId: string) {
  return api<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

/**
 * Accounts set to manual capture leave payments "authorized", and Razorpay
 * refunds those automatically after a few days. Capture explicitly so an order
 * we mark PAID is always actually collected.
 */
export async function ensureCaptured(payment: RazorpayPayment): Promise<RazorpayPayment> {
  if (payment.status !== 'authorized') return payment;
  try {
    return await api<RazorpayPayment>(`/payments/${encodeURIComponent(payment.id)}/capture`, {
      method: 'POST',
      body: { amount: payment.amount, currency: payment.currency },
    });
  } catch (err) {
    // A concurrent webhook/verify call may have captured it first.
    const latest = await fetchPayment(payment.id);
    if (latest.status === 'captured') return latest;
    throw err;
  }
}
