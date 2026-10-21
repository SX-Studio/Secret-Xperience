# SecretXperience.eu

A two-sided marketplace for adult services in the European Union: providers advertise and
sell, members browse, book, message, tip and watch live. Built as one Next.js application
on Supabase, with payment, verification and streaming providers plugged in per feature.

The live site is <https://secretxperience.eu>.

## What is in the application

Roughly 70 pages and 60 API routes under `app/`. The main areas:

| Area | Routes | What it does |
|---|---|---|
| Discovery | `/`, `/discover`, `/search`, `/[category]`, `/escorts/[city]`, `/listings` | Browsing and search, by category and by city. |
| Listings | `/listings/create`, `/listings/[id]`, `/boost` | Providers publish, edit and boost their advertisements. |
| Profiles | `/c/[username]`, `/profile/[id]`, `/creators` | Public provider and creator pages. |
| Live | `/live`, `/go-live`, `/livestreams/[id]` | Live streaming through LiveKit, with recording to S3. |
| Members | `/login`, `/dashboard`, `/messages`, `/gifts`, `/refer` | Accounts, messaging, tipping, referrals. |
| Money | `api/checkout`, `api/ccbill/*`, `api/verotel/*`, `api/nowpayments/*`, `api/gifts/*` | Card, high-risk and crypto rails, plus payouts. |
| Trust and safety | `/report`, `/2257`, `api/moderation/check`, `api/admin/listing-moderation` | Reporting, record-keeping, automated and manual moderation. |
| Admin | `/admin`, `/admin/community`, `api/admin/*` | The operator console. |
| Legal | `/privacy`, `/cookies`, `/dmca`, `/regulations`, `/2257` | The public policies. |

## Stack

- **Next.js 13** (App Router) and **React 18**, TypeScript throughout.
- **Supabase** for the database, authentication and storage. Schema and migrations in `supabase/`.
- **Tailwind CSS** with the design tokens in `tailwind.config.js` (CSS variables, not literal colours).
- **LiveKit** for live video, recorded to an S3-compatible bucket.
- **Stripe, CCBill, Verotel and NOWPayments** for payments, **Twilio Verify** for phone checks,
  **Resend** for email, the **Anthropic API** for content moderation.

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
npm run lint
npm run build
```

`.env.example` lists every variable the code reads, grouped by the service it belongs to.
Supabase is the only one the app cannot start without; the others switch their feature off
or fail at the point of use.

## Where everything lives

```
app/                  the application: pages, API routes, components
utils/                shared helpers
middleware.ts         request middleware
public/               static assets served as-is (images, video, the marketing hub)
supabase/             database schema and migrations
scripts/              one-off operational scripts
email-previews/       rendered examples of the transactional emails
marketing/            the marketing plan, 00-INDEX.md first
docs/                 how the platform is run
  business/           investor memorandum and pitch deck (confidential)
  audits/             dated point-in-time reviews
archive/              no longer in use, kept on purpose; see archive/README.md
```

Two rules keep this tidy:

- **The top folder is for the application and its configuration.** Documents go in `docs/`,
  not next to `package.json`.
- **Anything that stops being used moves to `archive/`, it does not stay lying around.**

| I want to... | Read |
|---|---|
| understand the product | `docs/business/INVESTOR_MEMORANDUM.md` |
| know what state the platform is in | `docs/audits/` (check the date in the header) |
| work on marketing | `marketing/00-INDEX.md` |
| know how member data is handled | `docs/data-handling-policy.md` |
| pick or change a payment processor | `docs/processor-decision-memo.md` |

## A note on this repository

It holds the investor memorandum, the pitch deck and operational documents alongside the
code. Everyone who can read the repository can read those too, so treat access to it as
access to the company's confidential material.
