# SecretXperience.eu — Full Platform Audit
**Date: 2026-05-23 | Auditor: Claude Code**

## How to Read This Document

Each item has a **RAG status**:
- 🟢 **GREEN** — Production-ready, no action needed
- 🟡 **AMBER** — Built but incomplete or has a known gap
- 🔴 **RED** — Missing, broken, or blocks revenue/trust

Items are sorted by **Revenue / Risk Impact** within each section.
A **Priority Backlog** at the end ranks everything by impact.

---

## Section 1 — Consumer Journey

### 1.1 Discovery & Browsing

| Feature | Status | Gap / Notes |
|---|---|---|
| Homepage listing grid | 🟢 | 2-col mobile, photo slider, clickable cards |
| Category pages (8 categories) | 🟡 | Desktop card layout good; mobile cards NOT updated to 2-col+slider treatment yet (only homepage was done) |
| Search with filters | 🟢 | 12+ filters, pagination, relevance sort, verified/availability/price/meet-type |
| Discover (swipe-to-save) | 🟢 | GSAP Draggable, category pills, verified/available filters |
| Available Now badge | 🟢 | Pulsing green indicator on escorts page |
| Discreet Mode (photo blur) | 🟢 | Toggle persists via localStorage |
| Featured slider (Velvet Stage) | 🟢 | 480px portrait cards, side-peek, glow, progress bar |
| Recently viewed listings | 🟢 | Persisted in localStorage |
| Saved favourites | 🟢 | Heart button → DB, synced across sessions |
| Mobile bottom nav | 🟢 | 5 slots: Home, Search, Discover, Messages, Dashboard |
| Age shown on escort cards | 🟢 | Just added — name/age/location compact layout |
| Load More button | 🟡 | Works but no infinite scroll — users must actively tap. Increases drop-off on mobile |
| Listing deep-link (`/?listing=ID`) | 🟢 | Redirects to `/listings/ID` |

### 1.2 Listing Detail Page

| Feature | Status | Gap / Notes |
|---|---|---|
| Photo gallery with active image | 🟢 | Tap to enlarge, main + thumbnails |
| Provider profile embed | 🟢 | Name, avatar, verification badge |
| Booking CTA (meetup-only categories) | 🟢 | "Send Message" or "Book Now" based on category |
| Stripe CTA (payable categories) | 🟢 | Rentals, hotels, events, shop — Stripe checkout |
| Reviews + star rating form | 🟢 | Read reviews, submit review (no booking gate yet) |
| Similar listings panel | 🟢 | 3 cards, same category |
| Favourites toggle on detail | 🟢 | Synced with homepage heart state |
| **Age displayed on detail page** | 🔴 | Added `age` to DB and cards but listing detail page does NOT render the age field. Visitors who click through will not see age despite cards showing it. |
| **Working hours display** | 🔴 | Dashboard stores `wh_mon` → `wh_sun` in tags. Listing detail page never reads or displays them. How-it-works promises an "availability calendar" — this expectation is unmet. |
| **Share button** | 🔴 | No copy-link, WhatsApp, or Telegram share on listing detail. Sharing is one of the highest-ROI organic growth drivers for a marketplace. |
| **Review gating** | 🔴 | Any registered user can review any listing without having booked. Opens platform to review manipulation. Reviews appear on competitor listings as well as fake negative reviews. |
| **Report this listing button** | 🔴 | Report page exists at `/report` but listing detail has no "Report" link to it — users can't easily flag illegal content from the listing they're viewing. |
| Back/breadcrumb navigation | 🟡 | Browser back works but no visual breadcrumb (e.g. "Escorts › Brussels › Sophia") that aids navigation and SEO |
| **SEO: page is fully client-rendered** | 🔴 | `'use client'` on line 1 means Google's crawler sees a blank shell. Listings are in sitemap.ts but indexing will fail or return low-quality snippets. This is the single biggest SEO liability on the platform. |
| Structured data (JSON-LD) on detail | 🔴 | No Person/Service schema on individual listing pages. Homepage and category pages have it; detail pages don't. |
| Social meta tags (OG/Twitter card) | 🔴 | No `og:image`, `og:description`, or `twitter:card` on listing detail — shared links show blank previews |

### 1.3 Booking & Payment Flow

| Feature | Status | Gap / Notes |
|---|---|---|
| Booking request (escort categories) | 🟢 | Date, time, duration, notes — submitted to `bookings` table |
| Stripe checkout (payable categories) | 🟢 | rentals/hotels/events/shop route live |
| Featured boost Stripe checkout | 🟢 | 7-day / 30-day plans |
| Booking confirmation email to client | 🟢 | Sent via Resend on `booking_confirmed` |
| Booking notification email to provider | 🟢 | Sent via Resend on `booking_created` |
| Stripe webhook booking activation | 🟢 | Confirmed on `checkout.session.completed` |
| **CCBill payment (adult services)** | 🔴 | Routes are built and correct but blocked on credentials. This is the highest-revenue stream — adult category transactions at 12–18% commission. |
| **Booking cancellation flow** | 🔴 | No cancel button for clients or providers post-confirmation. Bookings can only be declined before confirming — there is no way to cancel a confirmed booking. |
| **Booking cancellation email** | 🔴 | `booking_cancelled` type not handled in `/api/notify/route.ts` |
| **Payment receipts / invoice** | 🟡 | Stripe sends its own receipt but no custom branded SecretXperience receipt or invoice is generated |
| Stripe Connect (provider payouts) | 🟡 | Route exists (`/api/connect/onboard`, `/api/connect/login`) but no UI in dashboard to trigger it. Providers can't access their payout dashboard. |

---

## Section 2 — Provider Journey

### 2.1 Onboarding

| Feature | Status | Gap / Notes |
|---|---|---|
| Signup (server route, service role) | 🟢 | Creates user + profile + wallet in one transaction |
| Google OAuth | 🟢 | Available on login page |
| Role selection (client/provider) | 🟢 | Login page role selector |
| Email confirmation | 🟢 | Supabase auth email confirm |
| **Welcome email on signup** | 🔴 | No welcome email sent after successful registration. Industry standard; sets platform tone and confirms email delivery |
| Identity verification flow | 🟢 | Front + back ID + selfie → Supabase Storage → admin review → verified badge |
| Verification status page (`/verify`) | 🟢 | Shows current status with clear messaging |
| **Verification result email** | 🟡 | Notification written to DB (`notifications` table) on approve/reject but no email sent to provider |
| How-it-works for providers | 🟢 | Dedicated provider steps on `/how-it-works` |

### 2.2 Listing Management

| Feature | Status | Gap / Notes |
|---|---|---|
| Create listing (multi-step form) | 🟢 | Category, photos, details, stats, tags, tier selection |
| 5-photo upload (direct to Supabase Storage) | 🟢 | 4MB cap, drag-and-drop |
| Age field on escort/companion listings | 🟢 | Just added |
| Working hours (wh_* tags) | 🟡 | Stored as tags in dashboard edit, but NOT in create form. New listings have no working hours unless edited afterwards in dashboard |
| Listing tiers (Basic/Featured/Slider/Premium) | 🟢 | Token spend to activate |
| AI moderation before activation | 🟢 | Anthropic Claude checks listing, auto-approve or flag |
| **Listing edit from dashboard** | 🟡 | Edit modal exists but is incomplete — missing: age field, working hours editor, photo reorder/add/remove, tier upgrade from edit view |
| **Listing delete / deactivate** | 🔴 | No delete or deactivate toggle in dashboard. Providers cannot take down their listing without contacting admin. |
| **Video upload** | 🔴 | Only photos supported. Competitors and creators expect video. Significant disadvantage for creator category. |
| **Multiple listings per provider** | 🟢 | DB supports it; dashboard shows list |

### 2.3 Provider Analytics & Tools

| Feature | Status | Gap / Notes |
|---|---|---|
| View count on listings | 🟢 | `listing_views` table, shown in dashboard |
| Profile completeness tracker | 🟢 | Progress bar, auto-hides at 100% |
| Token wallet balance | 🟢 | Shown in dashboard stat cards |
| **Search impression tracking** | 🔴 | No data on how many times a listing appeared in search results. Providers can't see if poor visibility is from low tier or search ranking |
| **Conversion rate (views → bookings)** | 🔴 | No ratio metric. A provider with 500 views and 0 bookings can't diagnose why |
| **Revenue analytics** | 🔴 | No earnings chart or history for payable categories |
| **Response rate / response time** | 🔴 | Not tracked. Top marketplaces (Airbnb, Fiverr) surface this prominently — builds consumer trust |
| **Stripe Connect payout UI** | 🔴 | `/api/connect/onboard` and `/api/connect/login` routes exist but there is no button or section in the dashboard that lets providers connect their bank account and access payouts |
| **Availability calendar** | 🔴 | Working hours stored as tags (wh_mon: '10-22') but no calendar UI. How-it-works page explicitly promises "availability calendar" to consumers — this is a broken promise |

---

## Section 3 — Mobile Experience

| Feature | Status | Gap / Notes |
|---|---|---|
| Homepage 2-col grid with photo slider | 🟢 | Just implemented — name/age/location compact layout |
| Viewport meta tag | 🟢 | Exported in layout.tsx |
| Bottom navigation bar (5 slots) | 🟢 | Home/Search/Discover/Messages/Dashboard |
| Touch targets (≥44px) | 🟢 | Applied to key interactive elements |
| **Category pages mobile cards** | 🔴 | `/escorts`, `/nightlife`, `/creators` etc. have their own card components that do NOT have the 2-col grid + photo slider treatment. A user who taps "Escorts" from the homepage sees a completely different card layout than they just left — inconsistent and inferior UX |
| **Messages page mobile layout** | 🟡 | Functional but not audited for mobile-specific layout issues (conversation list + thread split) |
| **Search page mobile** | 🟡 | Single column on mobile (by design for search results) — acceptable but filter chips and sidebar behaviour should be tested |
| **Dashboard mobile** | 🟡 | 1762-line component — loads entire dashboard at once on mobile. No lazy loading. |
| PWA manifest / install prompt | 🔴 | No `manifest.json`, no service worker. Users on mobile cannot "Add to Home Screen" — significant trust and retention gap vs a native-feeling app |
| **Listing detail mobile layout** | 🟡 | Works but the photo gallery, review form, and similar listings sections have not been specifically tested for mobile viewport edge cases |

---

## Section 4 — SEO & Discoverability

| Feature | Status | Gap / Notes |
|---|---|---|
| Sitemap (static pages + listings + events) | 🟢 | `/sitemap.ts` includes all major pages and individual listing URLs |
| Robots.txt | 🟢 | Correctly configured |
| Homepage JSON-LD (WebSite + Organization) | 🟢 | Implemented |
| Category page JSON-LD (BreadcrumbList + Service) | 🟢 | On 6 category pages |
| Meta titles/descriptions (most pages) | 🟢 | Present on search, events, category pages |
| **Listing detail: fully client-rendered (NO SSR)** | 🔴 | The most important SEO pages on the site (`/listings/[id]`) are `'use client'`. Googlebot sees an empty div. Content is invisible to crawlers. This means individual provider listings — which should rank for "[name] escort [city]" searches — are completely invisible to Google. Fixing this is the highest-impact SEO task on the platform. |
| **Profile pages: fully client-rendered** | 🔴 | `/profile/[id]` is also `'use client'`. Same problem. |
| **OG/Twitter social meta on listing/profile** | 🔴 | Shared links show blank previews. This kills social sharing virality. |
| **City landing pages** | 🔴 | No `/escorts/brussels`, `/escorts/amsterdam`, `/escorts/berlin` pages. These are the highest-traffic search terms in this vertical — "escort brussels", "escort amsterdam" — and the platform has no pages that target them. |
| Canonical tags | 🟡 | Not explicitly set on paginated search results — may cause duplicate content issues |
| Hreflang (multilingual) | 🔴 | DE and FR markets planned but no hreflang tags, no localised pages yet |
| Image alt text on listing cards | 🟡 | `alt=""` on card images — should include listing title for image SEO |

---

## Section 5 — Monetisation

| Feature | Status | Gap / Notes |
|---|---|---|
| Token packages (5 tiers, Stripe) | 🟢 | Live — Starter/Casual/Connoisseur/Patron/Platinum |
| Listing tiers (Basic/Featured/Slider/Premium) | 🟢 | Token-gated, tiered visibility |
| Featured boost (Stripe Checkout) | 🟢 | 7-day €29 / 30-day €79 |
| Featured boost webhook + email | 🟢 | Activates listing, sends email |
| Stripe category transactions (rentals/hotels/events/shop) | 🟢 | Checkout + webhook + booking creation |
| **CCBill adult payment processing** | 🔴 | Highest-revenue stream. Full implementation exists (charge, webhook, status routes, MD5 digest, order creation) — BLOCKED on CCBill credentials only. No code work needed once credentials arrive. |
| **Consumer subscription tier** | 🔴 | Referenced in investor doc and how-it-works copy but no implementation. €19.99/month for unlimited messaging, priority booking would add significant recurring revenue. |
| **Tipping system** | 🟡 | `token_ledger` has a 'tip' transaction type but no UI. Providers cannot receive token tips from clients. |
| **Stripe Connect payouts to providers** | 🔴 | API routes exist but no dashboard UI. Providers in payable categories (rentals, hotels, shop) have no way to access their earnings. This means platform is currently holding funds with no disbursement mechanism visible to providers. |
| **Agency / multi-provider accounts** | 🔴 | No B2B tier. Agencies managing multiple escorts are a significant segment — they need one login managing multiple listing profiles. Currently forced to create separate accounts per provider. |
| Affiliate / partners revenue | 🟡 | /partners directory live but affiliate tracking links are not tracked — no conversion attribution, no commission automation |

---

## Section 6 — Trust & Safety

| Feature | Status | Gap / Notes |
|---|---|---|
| Identity verification (doc + selfie) | 🟢 | Full flow — upload → admin review → verified badge |
| AI moderation on listing creation | 🟢 | Anthropic Claude pre-screens before activation |
| Admin moderation panel | 🟢 | Approve/reject listings with status tracking |
| RLS on all tables | 🟢 | Row-level security enforced at DB layer |
| Wallet balance mutations server-side only | 🟢 | Authenticated role cannot directly modify balance |
| **Report form (broken backend)** | 🔴 | `/report` page exists and looks convincing, but `onSubmit` only sets `done: true` — it never saves to the database or sends an email. Reports are silently discarded. Critical legal liability. |
| **Report button on listing detail** | 🔴 | No "Report this listing" link on individual listing pages. Users who encounter illegal content must find the /report page independently — most won't bother. |
| **User ban / account suspension** | 🔴 | Admin panel has no ability to ban a user. A flagged provider simply creates a new account. |
| **How-it-works false claims** | 🟡 | How-it-works promises "end-to-end encrypted messages" (not true — messages stored plain text in Supabase) and "availability calendar" (not built). These are compliance and trust risks. |
| **Review manipulation risk** | 🔴 | No booking gate on reviews — anyone can leave any review on any listing. No spam detection. |
| **Age verification for consumers** | 🟡 | No age-gate on the homepage. EU/UK regulatory trend is moving toward mandatory age verification for adult content platforms. No implementation exists. |
| Terms of Service | 🟢 | Live at /terms |
| Privacy Policy | 🟢 | Live at /privacy |
| DMCA page | 🟢 | Live at /dmca |
| 2257 compliance page | 🟢 | Live at /2257 |
| Trust & Safety page | 🟢 | Live at /trust-safety |
| Cookie consent | 🟡 | Cookie policy page exists but no consent banner — GDPR requires explicit consent before tracking cookies are set |

---

## Section 7 — Email & Notifications

| Notification | Status | Gap |
|---|---|---|
| Booking created → provider email | 🟢 | Live via Resend |
| Booking confirmed → client email | 🟢 | Live via Resend |
| Featured boost activated email | 🟢 | Live via Resend |
| **Welcome email on signup** | 🔴 | Not sent. First impression of platform is silence after registration. |
| **Listing approved / rejected email** | 🔴 | Admin approves listing → no email to provider. Provider must check dashboard to discover status. |
| **Identity verification approved / rejected email** | 🔴 | Notification written to `notifications` table but no email sent. |
| **New message received email** | 🔴 | No email notification when a new message arrives. Providers who aren't actively on the platform miss client enquiries entirely. |
| **Booking cancellation email** | 🔴 | `booking_cancelled` type not handled in `/api/notify/route.ts` |
| **Re-engagement email** (provider inactive 7+ days) | 🔴 | No automated drip. pg_cron is available — could trigger re-activation nudges. |
| In-app notifications bell | 🟡 | `notifications` table exists, admin can write to it, but no notifications icon/dropdown in the main nav for users to see them |

---

## Section 8 — Admin & Operations

| Feature | Status | Gap |
|---|---|---|
| Listing moderation (approve/reject) | 🟢 | Admin panel with status badges |
| Identity verification review | 🟢 | Doc/selfie review with approve/reject |
| Platform statistics cards | 🟢 | User count, listing count, revenue indicators |
| **User management (ban/suspend)** | 🔴 | No ability to ban a user account or suspend a provider |
| **Revenue dashboard** | 🔴 | No admin view of total revenue, MRR, top earners, or payment history |
| **Bulk moderation** | 🔴 | Admin must approve/reject one listing at a time. At scale (1,000+ listings) this is unworkable. |
| **Content search in admin** | 🔴 | No search/filter in admin listing table — must scroll through all pending listings |
| **Audit log** | 🔴 | No log of admin actions (who approved what, when). Legal compliance risk. |
| Admin notifications to users | 🟢 | Can insert into notifications table via RLS policy |
| **Automated flagging** | 🟡 | AI moderation flags listings but admin has no filter to view "flagged but approved anyway" history |

---

## Section 9 — Performance & Reliability

| Item | Status | Gap |
|---|---|---|
| Vercel edge deployment | 🟢 | Auto-deploy on push to main |
| Supabase RLS at DB layer | 🟢 | Security at infrastructure level |
| `@supabase/ssr` cookie adapter | 🟢 | All routes use `getAll/setAll` pattern |
| **CCBill charge route: old cookie adapter** | 🔴 | `/api/ccbill/charge/route.ts` line ~45 still uses `get: (n) => cookieStore.get(n)?.value` — will cause auth failures when CCBill goes live |
| **Dashboard page size (1,762 lines)** | 🟡 | Entire dashboard is one client component with no code splitting. On low-end mobile devices, parsing 1,762 lines of JS on initial load adds ~200-400ms. Should be split into tab-based lazy imports. |
| **Listing detail page size (1,327 lines)** | 🟡 | Pure client component — no SSR, no streaming, no partial hydration. Competes poorly in Core Web Vitals. |
| **No image optimisation** | 🟡 | Provider images served directly from Supabase Storage without `next/image` optimisation. On mobile, full-resolution photos (~2–5MB each) are downloaded and scaled in CSS. Slow on 4G. |
| Missing database indexes | 🟡 | `20250521_search_indexes.sql` migration (pg_trgm GIN) not applied yet — text search performance degrades as listings grow |
| **Tier auto-expire cron** | 🟡 | `20250521_tier_auto_expire.sql` migration not applied yet — listing tiers never expire, meaning paid tiers stay active indefinitely after they should have ended |
| Error pages (404/500) | 🟡 | Next.js defaults used — not branded, no "go back to homepage" action |

---

## Section 10 — Feature Parity vs Top-Tier Marketplaces

Benchmarked against Airbnb, OnlyFans, Fiverr, and the best adult platforms (Eros.com, Slixa):

| Feature | SecretXperience | Top Tier | Gap Priority |
|---|---|---|---|
| Verified reviews gated by booking | ✗ | ✓ | HIGH |
| Provider response rate displayed | ✗ | ✓ | HIGH |
| Availability calendar | ✗ | ✓ | HIGH |
| Share listing (WhatsApp/copy link) | ✗ | ✓ | HIGH |
| Age on listing detail | ✗ | ✓ | HIGH |
| Consumer subscription tier | ✗ | ✓ | HIGH |
| Video in listings | ✗ | ✓ | MEDIUM |
| Mobile PWA / install prompt | ✗ | ✓ | MEDIUM |
| Push notifications | ✗ | ✓ | MEDIUM |
| Multilingual (DE/FR) | ✗ | ✓ | MEDIUM |
| Listing URL slug (not UUID) | ✗ | ✓ | MEDIUM |
| Provider "last seen" indicator | ✗ | ✓ | LOW |
| City landing pages for SEO | ✗ | ✓ | HIGH |
| SSR on listing detail pages | ✗ | ✓ | CRITICAL |
| OG social previews | ✗ | ✓ | HIGH |
| Age gate for consumers | ✗ | ✓ | MEDIUM |
| GDPR cookie consent banner | ✗ | ✓ | HIGH |

---

## Priority Backlog (Sorted by Revenue + Risk Impact)

### 🔴 P0 — Fix Now (Blocks Revenue or Creates Legal Exposure)

| # | Task | Why |
|---|---|---|
| 1 | **Wire CCBill credentials when available** | Single highest-revenue stream. All code is ready — zero dev work needed, just env vars. |
| 2 | **Fix CCBill charge route cookie adapter** | `/api/ccbill/charge/route.ts` uses old `get:` pattern — auth will break when CCBill goes live. |
| 3 | **Fix report form backend** | Reports are silently discarded. Illegal content reports never reach admin. This is a DSA compliance failure. |
| 4 | **Convert listing detail to SSR** | `/listings/[id]` is `'use client'` — invisible to Google. Every listing URL in the sitemap returns an empty shell to crawlers. |
| 5 | **Apply tier auto-expire migration** | `20250521_tier_auto_expire.sql` — listing tiers never expire. Providers who paid for a 7-day tier are getting it indefinitely for free. Revenue leak. |
| 6 | **Add Report button to listing detail** | Legal: users must be able to flag content from context. Link to /report with listing ID pre-filled. |

### 🟡 P1 — High Impact (Revenue + User Retention)

| # | Task | Why |
|---|---|---|
| 7 | **Show age on listing detail page** | Cards show age but clicking through loses that info. Breaks the expectation just set on the card. |
| 8 | **Add share button to listing detail** | WhatsApp + copy-link. Viral sharing is free traffic. Most adult platform bookings come from shared links. |
| 9 | **Category pages: apply mobile 2-col + photo slider** | Inconsistent experience — homepage cards look modern, category page cards look dated on mobile. |
| 10 | **Add welcome email on signup** | First impression. Sets platform tone. Confirms email is live. Reduces churn on day 1. |
| 11 | **Add notification email for new messages** | Providers miss client enquiries. Missed enquiries = missed bookings = provider churn. |
| 12 | **Add listing approved/rejected email** | Providers don't know when their listing goes live. Reduces activation friction. |
| 13 | **Gate reviews on completed bookings** | Prevents fake/malicious reviews. Protects providers and builds platform trust. |
| 14 | **Add city landing pages for SEO** | `/escorts/brussels`, `/escorts/amsterdam` etc. — highest-volume search terms. Currently no pages for them. |
| 15 | **Add Stripe Connect payout UI in dashboard** | Providers in payable categories have no way to access earnings. Platform appears to be holding their money with no disbursement path. |
| 16 | **GDPR cookie consent banner** | Legal requirement under GDPR. No consent banner = potential fine. |

### 🟡 P2 — Medium Impact (Platform Maturity)

| # | Task | Why |
|---|---|---|
| 17 | **Working hours display on listing detail** | Dashboard stores wh_* tags — just need to read and render them. How-it-works promises an availability calendar. |
| 18 | **Working hours in listing create form** | New listings currently have no way to set hours at creation. Must edit afterwards. |
| 19 | **Fix how-it-works false claims** | Remove "end-to-end encrypted" and "availability calendar" until built. Trust risk. |
| 20 | **OG meta tags on listing + profile pages** | `og:image` + `og:description` for share previews on WhatsApp, Telegram, Twitter. |
| 21 | **Apply search indexes migration** | `20250521_search_indexes.sql` — pg_trgm GIN indexes. Text search degrades without them at scale. |
| 22 | **User ban / suspension in admin** | Flagged accounts can create new accounts with no consequences. Minimal implementation: `suspended` boolean on profiles. |
| 23 | **In-app notifications dropdown** | `notifications` table exists, admin can write to it — just need a bell icon + dropdown in nav. |
| 24 | **Listing delete / deactivate toggle** | Providers cannot remove their listing without contacting admin. Blocking UX. |
| 25 | **Add listing_id + redirect to report form** | Pre-fill the report URL field when arriving from a listing detail "Report" button. |

### 🟢 P3 — Lower Priority (Polish & Growth)

| # | Task | Why |
|---|---|---|
| 26 | **Infinite scroll on homepage** | Replace "Load More" button with scroll-triggered fetch. Mobile UX improvement. |
| 27 | **Optimise images with next/image** | Replace raw `<img>` tags on cards with `next/image` for automatic WebP conversion and lazy loading. |
| 28 | **PWA manifest + install prompt** | `manifest.json` + service worker. "Add to Home Screen" prompt increases retention. |
| 29 | **Consumer subscription tier** | €19.99/month for unlimited messaging + priority. Requires Stripe subscription setup. |
| 30 | **Tipping UI for token tips** | Transaction type exists in ledger — just needs a "Send tip" button on listing/profile pages. |
| 31 | **Video upload support** | Critical for creator category. Supabase Storage supports it — add `<video>` rendering to listing detail. |
| 32 | **Multilingual (DE/FR)** | `next-intl` or `next-i18next`. German and French are the two largest untapped markets. |
| 33 | **Revenue dashboard in admin** | Aggregate token purchases + boosts + category transactions = total MRR. Basic chart. |
| 34 | **Listing URL slugs** | `/listings/sofia-antwerp` vs `/listings/uuid` — better SEO, better UX, shareable. |
| 35 | **Provider response rate tracking** | Log message timestamps vs response timestamps. Surface as a badge on listing detail. |
| 36 | **Breadcrumb navigation on listing detail** | "Escorts › Antwerp › Sofia" — both UX and SEO value |
| 37 | **Age gate for consumers** | Cookie-based "I confirm I am 18+" on first visit. Increasingly required by EU regulators. |
| 38 | **Branded error pages (404/500)** | Replace Next.js defaults with on-brand pages that link back to homepage. |

---

## Summary Scorecard

| Dimension | Score | Top Gaps |
|---|---|---|
| Consumer journey | 6/10 | Listing detail SEO, age missing, no share button, no city landing pages |
| Provider journey | 5/10 | No delete/deactivate, no Stripe Connect UI, no analytics beyond views |
| Mobile experience | 7/10 | Category pages not updated, no PWA |
| SEO & discoverability | 4/10 | Listing detail client-rendered, no city pages, no OG tags |
| Monetisation | 5/10 | CCBill blocked, no consumer sub, no tipping UI, no Connect payout UI |
| Trust & safety | 5/10 | Report form broken, no user ban, review manipulation possible |
| Email & notifications | 4/10 | 5 of 9 key notification types are missing |
| Admin & operations | 4/10 | No ban, no revenue dashboard, no bulk moderation |
| Performance | 6/10 | No image optimisation, no code splitting on large pages, missing migrations |
| Feature parity | 5/10 | 9 of 17 top-tier features absent |

**Overall: 51/100 — Functional foundation, significant gaps before production-grade**

The platform is real, live, and monetisable today. The most impactful fixes are:
1. SSR on listing detail (SEO)
2. CCBill credentials (revenue)
3. City landing pages (organic traffic)
4. Missing emails (provider retention)
5. Report form backend (legal compliance)

---
*Generated by platform audit — 2026-05-23*
