# Mantashaloom — handmade-rug e-commerce store

> **Before launch:** replace the placeholders in `src/lib/config.ts` (phone, WhatsApp, address,
> social links, email), review the policies in `src/app/(store)/policies/[slug]/page.tsx`, the
> copy on the home and about pages, and the demo catalogue. `public/demo` holds generated
> placeholder rugs (`node scripts/make-demo-rugs.mjs`), not product photography.

A production-shaped storefront and admin for a handmade-rug business, with a
 SEO-first catalogue pages, a merchant admin for listings/orders/blog,
and checkout through **Razorpay**.

**Theme:** dark, set in `tailwind.config.ts`: `ink` is the light text colour, `paper` the page, `sand` raised
surfaces and `night` the deepest bands. Use `text-white` only over photos, and `text-paper` on `bg-ink` buttons.

**Stack:** Next.js 15 (App Router, RSC) · TypeScript · Tailwind CSS · Prisma · PostgreSQL

---

## Quick start

```bash
npm install
cp .env.example .env          # then edit — see Configuration
npm run setup                 # applies migrations, seeds 12 rugs, 4 collections, 4 articles
npm run dev                   # http://localhost:3000
```

You need a PostgreSQL database. For local development, either point `DATABASE_URL`
at a local server or run one in Docker:

```bash
docker run -d --name mantashaloom-pg --restart unless-stopped \
  -e POSTGRES_PASSWORD=devpass -e POSTGRES_USER=mantashaloom \
  -e POSTGRES_DB=mantashaloom -p 55432:5432 postgres:16-alpine
# DATABASE_URL="postgresql://mantashaloom:devpass@localhost:55432/mantashaloom"
```

`DIRECT_URL` is optional — it defaults to `DATABASE_URL`. Set it only when `DATABASE_URL`
is a pooled connection.

Admin: **http://localhost:3000/admin** — sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

With no Razorpay keys in `.env`, the dev server sends checkout to a simulated payment page, so
you can place a full test order without an account. (A production build refuses checkout instead.)

---

## Configuration

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Used for canonicals, OG tags, sitemap and the Razorpay checkout branding. **Must match the origin you actually serve from.** |
| `DATABASE_URL` | Pooled PostgreSQL connection used by the app. |
| `DIRECT_URL` | Unpooled connection, used only by migrations (a transaction pooler cannot run them). Without a pooler, set it the same as `DATABASE_URL`. |
| `BLOB_READ_WRITE_TOKEN` | Set automatically by a Vercel Blob store. When absent locally, uploads fall back to `public/uploads`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | The single admin credential. |
| `AUTH_SECRET` | HMAC key for the admin session cookie. Use 32+ random characters. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay API keys (test `rzp_test_…` or live `rzp_live_…`). Empty = simulated payments, dev server only. |
| `RAZORPAY_WEBHOOK_SECRET` | The secret you set on the Razorpay webhook. |
| `FREE_SHIPPING_ABOVE`, `FLAT_SHIPPING_FEE`, `GST_PERCENT` | Store rules, in rupees / percent. |

Money is stored as **integer paise** everywhere. Only `formatMoney()` converts for display.

---

## Payments (Razorpay)

Gateway calls live in [`src/lib/razorpay.ts`](src/lib/razorpay.ts); order confirmation in
`confirmRazorpayPayment()` in [`src/lib/orders.ts`](src/lib/orders.ts). The flow (Razorpay
Standard Checkout):

1. `POST /api/checkout` re-prices the cart **from the database** (client prices are never trusted),
   writes a `PENDING` order, creates a Razorpay order for the same amount, and returns its id.
2. The browser opens the Razorpay popup (UPI, cards, netbanking, wallets).
3. On success the popup returns payment id + signature, posted to
   `/api/payments/razorpay/verify`. The server checks the HMAC signature, then fetches the
   payment from Razorpay and confirms it belongs to this order with the exact amount. A
   payment left `authorized` (manual-capture accounts) is captured before the order is paid.
4. Razorpay also calls `/api/payments/razorpay/webhook` (signature-checked over the raw body),
   so the order is confirmed even if the shopper closes the tab mid-payment.

`markOrderPaid()` is idempotent, so verify and webhook racing each other cannot decrement
stock twice. The cart is kept until payment succeeds, so a cancelled popup loses nothing.

**Razorpay dashboard setup:**
- **API Keys:** Account & Settings → API Keys → generate. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- **Webhook:** Account & Settings → Webhooks → Add. URL
  `https://your-domain.com/api/payments/razorpay/webhook`, a secret of your choice (also set as
  `RAZORPAY_WEBHOOK_SECRET`), events `payment.authorized`, `payment.captured`, `order.paid`.
- Test and live mode have **separate** keys and webhooks; set both up when you go live.

---

## Brand assets

The master artwork lives at [`assets/logo-source.png`](assets/logo-source.png). Everything
under `public/brand/` is generated from it by `npm run brand`, which traces the PNG to SVG
so the logo stays sharp at any size:

| Asset | Used for |
| --- | --- |
| `brand/lockup-h.svg` (+`-light`) | Site header — the mark and wordmark recomposed side by side, because the stacked wordmark is illegible at header height |
| `brand/lockup.svg` (+`-light`) | Admin sign-in, and anywhere with vertical room |
| `brand/mark.svg` (+`-light`) | Admin bar and other tight spaces |
| `favicon.svg`, `apple-touch-icon.png` | Browser tab and iOS home screen (white mark on brand dark, so it reads on any tab colour) |
| `og-default.png` | Social share card — 1200x630 raster, because Facebook/X/LinkedIn do not render SVG |

Swap `assets/logo-source.png` and re-run `npm run brand` to rebrand the whole site.
The `-light` variants are white artwork for dark backgrounds.

Render the logo through the `<Logo>` component rather than referencing files directly:

```tsx
<Logo variant="lockup-h" height={40} />        // short bars
<Logo variant="wordmark" height={20} />        // header and footer
<Logo variant="mark" height={30} tone="dark" />  // on a light background
```

---

## SEO

- Per-page `generateMetadata` with canonical, OpenGraph and Twitter tags
- JSON-LD: `Organization`, `WebSite` + Sitemap search, `Product` (price, availability,
  material, dimensions), `BreadcrumbList`, `BlogPosting`, `Blog`, `CollectionPage`, `FAQPage`
- `/sitemap.xml` generated from the database, `/robots.txt`, `/feed.xml` (RSS)
- Products, collections and posts are statically generated and revalidated (ISR); editing
  in the admin revalidates the affected paths immediately
- Filtered listings and search results are `noindex` to keep near-duplicate facets out of
  the crawl budget; cart/checkout/order/admin are disallowed in robots.txt
- Semantic headings, real `<nav>`/`<address>`/`<dl>` landmarks, labelled inputs, skip link,
  `next/image` with AVIF/WebP and explicit `sizes`

Meta title/description are editable per product, collection and post; sensible values are
generated when left blank.

---

## Admin

`/admin`, gated by an HMAC-signed cookie.

- **Dashboard** — 30-day revenue and orders, fulfilment queue, low-stock/draft/enquiry alerts
- **Products** — search, low-stock filter, show/hide, delete; a full editor with drag-order
  images (file upload or URL), rug attributes that drive the shop filters *and* the Product
  schema, and per-product SEO fields
- **Orders** — filter by status, full order detail, status/carrier/tracking updates, raw
  gateway response for debugging
- **Blog** — markdown editor with live preview, cover upload, tags, publish/unpublish
- **Collections** and **Enquiries** (contact-form messages and newsletter subscribers)

Uploads are written to `public/uploads`. On a serverless host, replace the body of
`src/app/api/admin/upload/route.ts` with an S3/Cloudinary put — the client only needs `{ url }`.

### Security notes

- The admin session cookie is verified **in middleware** (`src/lib/session-edge.ts`, Web Crypto)
  before any admin route renders. A layout-only check is not sufficient: React begins
  streaming before a layout's `redirect()` resolves, so unauthenticated requests would
  still receive rendered admin HTML.
- Order totals are always recomputed server-side from the database.
- Uploads are restricted by MIME type and size, and stored under a random filename.
- The contact form has a honeypot field.

Single-admin by design. For staff accounts with roles, swap `src/lib/auth.ts` for NextAuth
or Clerk — `requireSession()` is the only thing the actions call.

---

## Merchandising pages

- **Shop by room** tiles and filters use the `room` value set on each product in the admin.
- **Best Sellers** (`/best-sellers`) ranks rugs by units on paid orders, then fills with featured and newest rugs.
- **Shop by style** tiles and the Shop menu are built from the `style` values on active products, so a new style appears on its own.
- **Reviews** are submitted on product pages and stay hidden until approved at `/admin/reviews`.
- **Custom orders** (`/custom-orders`) arrive in `/admin/enquiries` with the subject "Custom order".

---

## Deploying to Vercel

**1. Push the repo to GitHub**, then import it at [vercel.com/new](https://vercel.com/new).
Framework preset is detected as Next.js; no build overrides are needed — `npm run build`
already runs `prisma generate && prisma migrate deploy && next build`, so schema changes
apply on every deploy.

**2. Create the database.** In the Vercel project: **Storage → Create → Postgres** (Neon).
That sets `DATABASE_URL` and is enough to deploy — the build defaults `DIRECT_URL` to
`DATABASE_URL` when it is absent.

If your provider gives you a *pooled* connection string (PgBouncer, Neon's `-pooler` host),
also set `DIRECT_URL` to the **unpooled / direct** string. Migrations cannot run through a
transaction pooler, and without it `prisma migrate deploy` will fail on the pooled URL.

**3. Create the image store.** **Storage → Create → Blob**. This sets
`BLOB_READ_WRITE_TOKEN`, which is what routes admin uploads to Blob instead of the
filesystem. Skip it and file uploads return a clear 501 — pasting image URLs still works.

**4. Set the remaining environment variables** (Settings → Environment Variables), for
Production *and* Preview:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` — no trailing slash |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | your real admin credentials |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | from the Razorpay dashboard (see Payments) |
| `STORE_CURRENCY`, `FREE_SHIPPING_ABOVE`, `FLAT_SHIPPING_FEE`, `GST_PERCENT` | store rules |

`NEXT_PUBLIC_SITE_URL` is baked in at build time and is used for canonicals, OG tags, the
sitemap — if it is wrong, links and previews point at the wrong origin. Change it and redeploy, do not just edit and restart.

**5. Deploy.** The first deploy runs the migration and creates empty tables. To load the
demo catalogue (optional), run the seed locally against the production database:

```bash
DATABASE_URL="<production connection string>" npm run db:seed   # deletes existing products/orders/posts
```

A `DATABASE_URL` given on the command line always wins over `.env`, and `DIRECT_URL` is
paired to it automatically — so this cannot accidentally target your local database.
`npm run db:deploy` prints the host and database it is about to touch before running.

**6. Add the Razorpay webhook:** `https://your-domain.com/api/payments/razorpay/webhook` (see Payments).

**7. Add your domain** (Settings → Domains) and update `NEXT_PUBLIC_SITE_URL` to match,
then redeploy.

### Vercel-specific notes

- `regions` is set to `bom1` (Mumbai) in `vercel.json` — closest to an India-based store
  and its database. Change it if your customers or database live elsewhere.
- The admin gate runs in Middleware (Edge), so it uses Web Crypto rather than `node:crypto`.
- Payment routes get a 30s `maxDuration`; the upload route 60s.
- Serverless filesystems are read-only apart from `/tmp`, and `/tmp` does not persist
  between invocations — hence Blob for uploads.

## Deploying to Hostinger (Business / Cloud, Node.js Web App)

**1. Database — Neon.** Hostinger web hosting only offers MySQL, so use a free
[Neon](https://neon.tech) Postgres project (region: *AWS Asia Pacific — Singapore*). From
**Connect**, copy the **pooled** string (host contains `-pooler`) for `DATABASE_URL` and
the **direct** string (pooling toggled off) for `DIRECT_URL`. Both need `?sslmode=require`.

**2. Uploads folder.** In hPanel **File Manager**, create a folder in your home directory
*outside* the website folder, e.g. `/home/u123456789/mantashaloom-uploads`, and note its full
path. A redeploy replaces the app folder, and `next start` does not serve files added to
`public/` after the build, so uploads go here and are served by `src/app/uploads/[file]`.

**3. Create the app.** hPanel → **Websites → Add website → Node.js Apps → Import Git
repository**, connect GitHub and pick `ch-kanishk/mantashaloom`, branch `main`.

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Node version | 20.x (or 22.x) |
| Build command | `npm run build` |
| Start command | `npm start` |

**4. Environment variables** (same screen): everything in the Vercel table above, plus
`DATABASE_URL`, `DIRECT_URL` and `UPLOAD_DIR` (the full path from step 2). Do not set
`BLOB_READ_WRITE_TOKEN`. `NEXT_PUBLIC_SITE_URL` must be the final `https://` domain.

**5. Deploy.** The build runs the migrations against Neon. Load the demo catalogue
(optional) from your own machine, as in Vercel step 5. Then add the Razorpay webhook
`https://your-domain.com/api/payments/razorpay/webhook` (see Payments). Pushing to `main` redeploys.

Not included, and worth adding next: transactional order emails (the order and enquiry
write points are the hooks), a real search index if the catalogue grows past a few thousand
SKUs, and multi-currency.

---

## Scripts

| Command | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run setup` | Apply migrations + seed |
| `npm run db:migrate` | Create a migration after editing the schema |
| `npm run db:deploy` | Apply pending migrations (what CI/Vercel runs) |
| `npm run db:seed` | Reseed demo catalogue (**deletes existing products, orders and posts**) |
| `npm run db:studio` | Prisma Studio |
