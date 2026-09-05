# SecretXperience — Project Memory

Read this at the start of every session. Update as state changes.

## ⚠️ Payment processor compliance — VERIFIED FACTS (do NOT paraphrase from memory; these are quoted from actual vendor emails, 2026-06)
- **Verotel** — WILL process escort sites, but ONLY if escorts is the sole vertical. Verbatim (email from Mathilda, Yoursafe/Verotel CES, 2026-06): *"We unfortunately do not process for websites that combine escorts with any other services. Websites with escort listings may be the only service offered on such websites."* Also explicitly refuses these categories entirely: **Massage, Nightlife, Rentals, Hotels, Events**. Physical goods (Shop) capped at 30% (rest must be digital), and goods must be hosted on own site — third-party links only allowed to own social (X, Instagram). Acceptable single-vertical shapes they listed: escort listings / content creation / pics & clips / dating & AI companionship. **NET: Verotel = YES for an escorts-only site, NO for the current multi-vertical site.**
- **CCBill** — FLAT NO for escorts, regardless of site structure. Verbatim (email from Mili Torres, Sales Development, CCBill, milit@ccbill.com): *"Unfortunately, we do not provide payment services for any escort sites."* **NET: CCBill = dead end for escorts. Do not pursue for this site.**
- **DECISION STILL OPEN (as of 2026-06-06)**: narrow site to escorts-only (Verotel approves) vs. keep multi-vertical and pursue a high-risk processor. User is thinking it over — do NOT make site-structure changes until they decide.
- **Accuracy rule for this project**: when a claim depends on what a vendor said, quote the source text and separate "what they wrote" from "my interpretation." Flag general-industry reasoning (fallible) vs. facts from documents the user provided (verifiable).
- **Research rule**: always use WebSearch (and WebFetch / gstack browser where accessible) to verify processor claims before recommending them. Do not rely on training-data memory for processor policies.

## Payment processor research — brokers/ISOs (researched 2026-06-06 via WebSearch)
Direct adult PSPs (Verotel, CCBill, Segpay, Vendo) are NOT the right channel for a multi-vertical escort-listing site. The realistic path is a **high-risk broker/ISO** that places you with an acquiring bank. Key findings:
- **QuadraPay** — explicitly covers escort *listing* sites, EU/SEPA acquiring with 1–2 day SEPA settlement to European bank account. Confirmed reseller/ISO (not direct processor). Active thread: initial outreach sent and replied; our pre-approval response sent 2026-06-06. Full thread in `docs/processor-outreach.md`. Their own site candidly notes: *"Globally, the escort listing industry is gradually decreasing... it's no longer a potential industry for most acquiring banks"* — honest market signal. Source: https://quadrapay.com/escort-merchant-account/
- **Instabill** — advertises escort accounts, 160+ currencies, EU + offshore. However, documented reviewer reports: applied with full docs, then *"declined... Instabill DON'T support adult sites, dating sites, or escort sites"* — treat as a maybe, not a yes. Not yet contacted. Source: https://instabill.com/ecommerce-industries/escort-merchant-accounts/
- **Merchant Advice Service** — UK broker, covers EU, places escort/adult merchants. Not yet contacted.
- **Segpay / Vendo** — markets as "adult/dating" but does NOT explicitly confirm escort listing acceptance. Do not assume from their adult marketing pages.
- **Key framing for all applications**: we charge for B2B advertising credits (tokens), not escort bookings. Escort/companionship = meetup-request only, zero on-platform payment. This is the compliance story that differentiates us from a booking platform. Lead with it.
- **Crypto fallback**: no processor can decline crypto. NOWPayments / BTCPay Server can wire into the existing token/wallet flow as a parallel rail. Recommend as backup regardless of which broker approves.

## What this is
Premium adult services marketplace for the EU (BE/NL/DE/FR/LU primary).
Live at **secretxperience.eu** (and www.secretxperience.eu). Owner email: heyokanaga@gmail.com.

## Stack
- **Next.js 13.5.1** App Router, TypeScript, deployed on **Vercel** (NOT 14 — important for cookie API behavior)
  - Team: `team_8bUh79wAVTN5pyFKcCQGIXEy`
  - Project: `prj_uE7mmweTEj1NwLhddYWXiI1Pbw1T`
  - Auto-deploys on push to `main`
- **Supabase** project `duwuzaelmggldhkgoebn` — auth, DB, RLS, pg_cron, storage
  - Using publishable key `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (replaces deprecated anon key)
- **Resend** for transactional email (set `RESEND_API_KEY` in Vercel to enable)
- GSAP 3.12.5 from CDN for category animations

## Branch policy
**Develop on `main`.** User has explicitly said multiple times: only make changes on the main branch. Every commit auto-deploys to production.

## Architecture quirks (important — don't re-learn these)
- `app/page.tsx` uses massive `dangerouslySetInnerHTML` for the homepage layout. React components (SliderAds, CategoryAnimations) are mounted into placeholder `<div id="...">` nodes via `createPortal` + `useEffect`.
- The CategoryAnimations mount point (`#catAnimsMount`) MUST sit OUTSIDE `<main class="main">` and BEFORE `<div class="layout">` so it's full-width above the sidebar/listings split.
- Static HTML in `dangerouslySetInnerHTML` is built at compile time — any `${var}` reference inside it must use variables that exist at JSX render scope, NOT inside useEffect-only scope. Heart buttons (`data-fav-lid`) go in the dynamic `renderCards` useEffect, NOT in the static template.
- Provider/listing card category routes: `escorts → /escorts`, `companions → /companionship`, `nightlife → /nightlife`, `creators → /creators`, `rentals → /rentals`, `hotels → /hotels`, `events → /events`, `shop → /shop`.

## ⚡ Next Session — Resume Here (2026-06-05)
Last thing completed: **Mobile horizontal-overflow fix** (commit `6c114d1` on `main`) — CONFIRMED working by user.

What fixed it (after several failed attempts):
- ROOT CAUSE: CSS grid items default to `min-width: auto` and refuse to shrink below content width. `.main` (a grid item in `.layout`) stayed at desktop width even when the grid said `1fr`, so the whole page overflowed right and the mobile media query never produced a narrow layout.
- FIX: `min-width: 0` + `overflow-x:hidden` + `max-width:100%` on `.main` AND `.layout`. Mobile media-query rules for `.layout{grid-template-columns:1fr}`, `.cards{repeat(2,1fr)}`, `.admin-stats{repeat(2,1fr)}` made `!important`. `html`/`body` capped at `max-width:100vw`.
- Also fixed "View listing" → "View advertisement" rename miss in featured banner.
- LESSON: when a flex/grid CHILD overflows, the fix is almost always `min-width:0` on that child, NOT overflow-hidden on the parent.

Earlier this session (2026-06-05): LiveBanner ticker overflow (removed `padding-left:100%`, two side-by-side copies), SliderAds GPU-escape (`contain:layout paint`), login OAuth key restore (`provider:'google'`), admin role labels (Advertiser), go-live camera fallback, live-badge realtime channel dedup.

Prior milestone: **Mobile listing card redesign** (commit `40668f5` on `main`).

What was done:
- Homepage listing cards: 2-col grid forced at ALL mobile widths (420px no longer collapses to 1 col)
- Photo slider added per card — prev/next arrows + "1/N" counter, `window.__slideCard` swaps `img#si-{id}` src
- Card hero: full-bleed cover image with gradient overlay, 200px mobile / 175px small phone
- Card body: compact layout — name + price on same row, location below, category label hidden on mobile
- Slider state tracked per card via `window.__sliderIdx`

What's next (user hasn't asked for these yet, don't do proactively):
- The category pages (escorts, nightlife, etc.) have their own card components — they may also need the same mobile 2-col + slider treatment if user requests it
- Pending Supabase migrations still need to be applied (see Pending section)
- CCBill — DECLINED escorts entirely (2026-06, see top "Payment processor compliance" section). Dead end, do not pursue.

---

## Done (recent work, don't redo)
- **Crypto token rail — NOWPayments (built, NOT yet deployed/verified)** — parallel payment rail to Verotel for buying tokens (advertising credits; compliant — tokens ≠ escort booking). Mirrors the Verotel flow exactly. Files: `app/lib/nowpayments.ts` (config → `configured:false` until both env vars set, `createInvoice` via `api.nowpayments.io/v1/invoice`, `verifyIpn` = HMAC-SHA512 of key-sorted JSON vs `x-nowpayments-sig`), `app/api/nowpayments/charge/route.ts` (auth → pending `payment_orders` row with `advertiser:'nowpayments'` → hosted invoice → `{ url }`; graceful `{configured:false}` HTTP 200 → tokens page shows the same "coming soon" modal), `app/api/nowpayments/webhook/route.ts` (verify IPN sig → credit only on `payment_status:'finished'`, ledger-based idempotency identical to the Verotel webhook). UI: `app/tokens/page.tsx` gained a `payWithCrypto()` handler + a subtle "◎ Pay with crypto" button under each package's "Buy now". **To activate:** set `NOWPAYMENTS_API_KEY` + `NOWPAYMENTS_IPN_SECRET` in Vercel, redeploy, and register the IPN callback `https://www.secretxperience.eu/api/nowpayments/webhook` in the NOWPayments store settings. Built on branch `claude/investment-plan-sx-content24-i3z6i0`, NOT merged to `main` — untested payment change, needs review + a Vercel preview build before merge.
- **`/creators` COLLABS banner (`app/creators/CollabsPromo.tsx`) — FIXED LAYOUT, do not swap without asking**: two cells. **Large left (hero) cell = the 3s COLLABS logo flash** (`/promos/collabs-promo-3s.mp4`, `VIDEO_FLASH`). **Narrow right "PROMO" cell = the original 40s vertical COLLABS fashion promo** (`/promos/collabs-promo-original.mp4`, `VIDEO_PROMO`; has a "VEED" watermark top-right — left as-is on purpose). Both autoplay/muted/loop, `object-fit:cover`, link to collabs-photography.com. Other promo files kept: `collabs-promo.mp4` (10s flash), `collabs.jpg` (old green wordmark, unused).
- **OnlyFans creator directory (2026-07-05)** — `app/data/onlyfans.ts` (36 creators, country groups BE/DE/RO/ES/int'l) rendered by `OnlyFansShowcase` on the homepage (portal → `#onlyfansShowcaseMount`, above the partners band) and on `/creators` (inline). Creators with `featured: true` + a photo at `public/onlyfans/<handle>.jpg` get a large clickable 160px photo card in the "✦ Featured" row; photos are 200×200 crops with the creator's name baked onto the image (made via headless-Chromium screenshot). 9 featured so far. Others render as chips with initials-monogram avatars that auto-upgrade when a photo file appears. Referral params (`?rec=`) on baddiemi + lisawildlove must be preserved. NOTE: photos sent mid-turn in chat are NOT persisted to the transcript — ask the user to resend one per message, waiting for confirmation between each. — partner data extracted to `app/data/partners.ts` (single source of truth); new `PartnersShowcase` component renders the full directory as compact chips above the homepage footer (portal → `#partnersShowcaseMount`, first 4 categories visible, "Show all" expands). Fixed on `/partners`: `premium-content` section (Dorcel Club, the one live affiliate) was missing from `industryIds` so it never rendered; `Official Partner` badge had no style. Edit partners in `app/data/partners.ts` — both pages update.
- **Verotel FlexPay payment integration (2026-06-04) — LIVE IN TEST MODE, full flow verified** — token purchases now go through **Verotel FlexPay** (hosted payment page), replacing the dead CCBill path. Website #136440, status "New - Testing mode". Files: `app/api/verotel/charge/route.ts` (builds signed `startorder` URL → redirect) and `app/api/verotel/webhook/route.ts` (verifies postback signature → credits wallet, mirrors old CCBill wallet logic). Signature = `lowercase(sha256(SIGNATURE_KEY + ":key=value" sorted case-insensitively, excluding signature))`. **Gotchas learned:** (1) do NOT pass `successURL`/`declineURL` as request params — they break the signature; configure them in Verotel panel → FlexPay options instead. (2) Description must be ASCII (no em dash). (3) `.trim()` the key (env paste whitespace). Env vars in Vercel: `VEROTEL_SHOP_ID=136440`, `VEROTEL_SIGNATURE_KEY=<secret>`. Panel URLs set: Success `…/tokens?status=success`, Decline `…/tokens?status=cancel`, Postback `…/api/verotel/webhook`. `tokens/page.tsx` `handlePurchase` calls `/api/verotel/charge`; if it returns `configured:false` (env missing) it shows a graceful "Payment coming soon" modal instead of a 503. Test card `9999994707596217` confirmed crediting wallet end-to-end. **Next: click "Request authorization" in Verotel to move test → live compliance review.** CCBill routes (`app/api/ccbill/*`) are now dead/unused — kept but not wired.
- **Tokens & Wallet link** added to desktop account dropdown on homepage (`app/page.tsx`, coins icon, → `/tokens`). Mobile drawer already had "Buy Tokens" (`ndTokens`).
- **Verotel compliance fixes (2026-06-04)** — (1) **Verification gate re-enabled**: `/listings/create` now blocks unverified providers with a clear "verify first / pending / rejected" screen (checks `profiles.verified` then `identity_verifications.status`), plus a submit-handler guard. Real enforcement is a RESTRICTIVE RLS policy (migration `20260604_verification_gate.sql`, **pending apply**) so it can't be bypassed via direct API. (2) **Explicit consent checkbox** added to `/verify` — affirmative 18+/ownership/processing consent, required to submit; recorded as `consent_given`+`consent_at` on `identity_verifications` (submit API resilient if columns not yet migrated). Admin verification card shows "✓ Consent given · date".
- **Ad tier pricing + 2 new placements (2026-06-04)** — benchmarked vs Quartier-Rouge (BE): slider €25/wk, section €30/wk, homepage €140/mo. Repriced to undercut ~20%: Featured 50tok/€5 (entry hook, unchanged), Slider 75→200tok/€20, Premium 150→300tok/€30. Added **Section Premium** (240tok/7d/€24 — full-width banner on one category page) and **Homepage Premium** (1100tok/30d/€110 — full-width banner on homepage). New `PremiumBanner` component (`app/components/PremiumBanner/`) renders image-left/content-right banner; returns null when unsold so layouts stay clean. Mounted on homepage (portal → `#homepagePremiumMount`) + all 7 category pages scoped by category. Tier costs synced across `tokens/spend` route, `tokens` page, `listings/create`. **Migration `20260604_ad_tiers_section_homepage.sql` still needs applying** (see Pending).
- Mobile nav drawer scroll fix — body scroll lock on open + `overscroll-behavior:contain` so the drawer scrolls, not the page behind.
- Token system migrations applied (`token_packages`, `user_wallets`, `token_ledger`, `payment_orders`)
- Identity verification table + flow (`identity_verifications`)
- Auto-expire pg_cron job
- Supabase publishable key client helpers wired up; ALL pages/routes now use `PUBLISHABLE_KEY || ANON_KEY` fallback
- Favorites wired to DB (`favorites` table, `__favSet`, `toggleFavorite`)
- View tracking (`listing_views` table, fires on `openDetail`)
- Saved listings section in dashboard
- Dashboard bug fixes: `price_from/to` (not `price_min/max`), live unread message count, moderation status badges
- CategoryAnimations replaced with design-system handoff (GSAP-driven cards with category routes)
- Homepage JSON-LD fixed — URL is `secretxperience.eu`, Organization schema added alongside WebSite
- BreadcrumbList + Service JSON-LD on all 6 category pages (escorts, nightlife, creators, rentals, hotels, shop)
- `/api/newsletter` POST endpoint + footer signup form on homepage
- Search page: publishable key, sanitized q, subcategory scope, client-side relevance bump, **pagination** (24/page), **advanced filters** (verified-only, meet type, price range), **Available Now badge**
- Tier expiry: `expire_listing_tiers()` + hourly pg_cron sweep (migration pending)
- Search performance indexes: pg_trgm GIN (migration pending)
- CategoryAnimations: dangerouslySetInnerHTML split in two with `<CategoryAnimations />` direct JSX. No portal.
- Newsletter signup: working end-to-end
- Provider moderation: fixed column name, badges work
- Messages: search filter, unread count fixed, read receipts on open
- Listing detail: favorites toggle, duplicate CTA removed
- All API routes: `www.secretxperience.eu` fallback
- Bookings/messages migrations in version control
- Security: token spend blocking, PII logging removed, moderation auth hardened
- Price filter bug fixed in `/api/listings/search` (`price_to` not `price_from`)
- Webhook: sends `listing_boosted` email notification after boost
- **Dashboard improvements**: client vs provider bookings split, inline Confirm/Decline for providers, listing join for booking title, token balance stat card, profile completeness progress bar (auto-hides at 100%), listing view counts from `listing_views`, Discover quick-action
- **Escorts page**: Available Now badge (pulsing green), New badge (purple, <7 days), "Sort by availability" option, Discreet Mode toggle (blurs photos, persists localStorage), `isAvailableNow` helper
- **NEW: `/discover`** — GSAP Draggable swipe-to-save page ("Private Gallery"). Swipe right = save to favorites, left = skip. Category filter pills with tabler icons (incl. Verified only + Available tonight). Full portrait cards, styled counter "01 of N portraits", Pass/View/Save action labels, keyboard hints. Linked in homepage nav, drawer, escorts, search, dashboard. Added to sitemap.
- **NEW: `/partners`** — EU adult industry + lifestyle affiliate directory. 50+ curated real businesses across 13 categories. Each card has emoji, name, tagline, badge, description, visit link, affiliate network. Added to sitemap + homepage footer.
- **SliderAds redesign** — Full-height "Velvet Stage" (480px portrait cards), side-peek adjacent cards (72px peek), ambient glow per category, progress bar, category plate label, scrolling ticker rail, touch swipe, click to listing.
- **Login page redesign** — Split-panel layout: atmospheric left (gold orbs, floating particles, brand tagline "An evening that ends behind a closed door") + clean auth form right (Google OAuth with colored G SVG, role selector with tabler icons, shake animation on error, terms checkbox).
- **Tokens/Wallet page redesign** — Hero balance counter (Cormorant Garamond 72px gold), 4-stat row (spent/purchased/tips/balance), 5-tier package grid (Starter/Casual/Connoisseur/Patron/Platinum) with featured card glow + banner, transaction table (Date/Description/Type/Amount/Balance) with tabler icons.
- **Font stack fixed** — `globals.css` `--serif` now leads with `'Cormorant Garamond'` (was Playfair Display) — matches all page-level heading usage.
- **Redundant font imports removed** — Stripped `@import url(fonts.googleapis.com/...)` from all 27 page-level style tags; fonts load once in `layout.tsx`.
- **Mobile improvements** — Viewport export in layout.tsx, single-col breakpoints on search/escorts/tokens, sidebar flex on escorts, touch targets, nav collapse at 640px.
- **Mobile bottom nav** — Swapped Events → Discover (sparkles icon) in the 5-slot bottom nav on homepage.
- **Signup fixed** — New `/api/auth/signup` server route uses service role key to create user + upsert profile + ensure wallet; bypasses failing `auth.users` trigger. Login page now POSTs to this route instead of calling `supabase.auth.signUp()` directly.
- **Identity verification flow fixed (full end-to-end)**:
  - `create_wallet_for_new_user()` trigger: added `SET search_path = public` (was "relation user_wallets does not exist")
  - `identity_verifications` table: granted SELECT/INSERT/UPDATE/DELETE to `service_role` and `authenticated` (table was created without standard Supabase grants)
  - `identity_verifications` FK: added `user_id → public.profiles(id)` so PostgREST can resolve embedded join in admin panel (existing FK pointed to `auth.users`, invisible to PostgREST)
  - File upload: switched from FormData through Vercel (413 too large) to client→Supabase Storage direct upload; route now accepts JSON paths and creates signed URLs server-side
  - Login redirect: `/login?redirect=` → `/login?next=` to match login page's param reader
  - `.single()` → `.maybeSingle()` on `identity_verifications` in dashboard and listings/create
  - Admin panel verification tab now shows all pending submissions with profile data
- **Platform-wide audit fixes (2026-05-22)**:
  - `@supabase/ssr` cookie adapter: ALL routes now use `getAll/setAll` pattern (tokens/spend, featured-boost were still on old `get`-only)
  - `favorites` and `listing_views` tables: created with proper schema, RLS, FKs, grants via migration
  - service_role grants: every core table now has full SELECT/INSERT/UPDATE/DELETE for service_role
  - Wallet security: authenticated role CANNOT INSERT/UPDATE/DELETE user_wallets — only service_role (prevents balance manipulation)
  - Admin verification approval: added `admin update all verifications` RLS policy so admin can approve/reject from browser client
  - Admin notifications: added `admin insert notifications` RLS policy so approve/reject sends user notification
  - Duplicate RLS policies cleaned up (listings, profiles, messages had redundant duplicate policies)
  - Listing detail, tokens/spend: `.single()` → `.maybeSingle()` where row absence is possible
  - Upload size cap: 4MB (was 10MB, Vercel limit is 4.5MB — prevents silent 413)
  - Search query: special chars sanitized before embedding in PostgREST `.or()` filter
  - Admin client auth options: `{ autoRefreshToken: false, persistSession: false }` on all service_role clients
  - `app/api/tokens/spend/route.ts`: cookie adapter fixed + admin client hardened
  - `app/api/featured-boost/route.ts`: cookie adapter fixed
  - Next.js version confirmed as **13.5.1** — `cookies()` is synchronous (no `await`), important for all server code

## Pending
- **Apply `20260616_reports.sql`** — SAFETY/COMPLIANCE. Creates the `reports` table (was written by `app/report/page.tsx` but had NO migration — submissions were failing silently). Idempotent (`create table if not exists`), safe to run even if the table was created manually. Adds RLS: anon/authenticated can INSERT (file a report), admins can SELECT/UPDATE (triage). Until applied, the new Admin → Reports tab will read an empty/missing table and the report form shows a graceful error instead of a false "submitted". Run the file in the Supabase SQL editor.
- **Apply `20260616_events_table.sql`** — Backfills the `events` table schema into version control (the live project already has it; this is idempotent and a no-op there, but reproduces the schema on a fresh environment). Only needed if standing up a new Supabase project.
- **Apply `20260604_verification_gate.sql`** — COMPLIANCE (Verotel). Adds a RESTRICTIVE RLS policy so only `profiles.verified = true` (or admin) users can INSERT listings, and adds `consent_given`/`consent_at` columns to `identity_verifications`. Until applied: the client gate + consent checkbox still work and the submit API falls back gracefully (logs a warning, skips consent columns), but the **server-side publish gate is NOT enforced** and consent isn't recorded. Run in Supabase SQL editor:
  ```sql
  DROP POLICY IF EXISTS "Only verified providers can publish listings" ON public.listings;
  CREATE POLICY "Only verified providers can publish listings" ON public.listings
    AS RESTRICTIVE FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.verified = true OR p.role = 'admin')));
  ALTER TABLE public.identity_verifications
    ADD COLUMN IF NOT EXISTS consent_given boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS consent_at timestamptz;
  ```
- **Apply `20260604_ad_tiers_section_homepage.sql`** — widens `listings.tier` CHECK to allow `section` + `homepage`, adds partial indexes. **REQUIRED** before anyone can buy the two new ad tiers, or the token spend fails the constraint. Run in Supabase SQL editor:
  ```sql
  ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_tier_check;
  ALTER TABLE public.listings ADD CONSTRAINT listings_tier_check
    CHECK (tier IN ('basic','featured','slider','premium','section','homepage'));
  CREATE INDEX IF NOT EXISTS listings_section_tier_idx ON public.listings (category, tier_expires_at) WHERE tier = 'section' AND active = true;
  CREATE INDEX IF NOT EXISTS listings_homepage_tier_idx ON public.listings (tier_expires_at) WHERE tier = 'homepage' AND active = true;
  ```
- **Apply `20260601_signup_attribution.sql`** — creates `signup_sources` (service-role-only RLS) for the Admin → Acquisition tab. Without it, signups can't be attributed and the Acquisition tab errors.
- **Apply pending migrations in Supabase SQL editor** (run in order):
  - `20250521_newsletter.sql` ✓ already applied
  - `20250521_tier_auto_expire.sql` (requires pg_cron)
  - `20250521_search_indexes.sql` (requires pg_trgm)
  - `20250521_bookings.sql` (if bookings table doesn't exist yet)
  - `20250521_messages.sql` (if messages table doesn't exist yet)
- **CCBill integration** — ABANDONED. CCBill declined escorts entirely (2026-06). The dead `app/api/ccbill/*` routes can be removed whenever convenient.
- **Stripcash affiliate verification** — draft email response is ready (in chat history), waiting for user to send.
- **secretxperience.eu deployment visibility** — user has reported latest changes sometimes don't appear; could be browser cache (Ctrl+Shift+R) or Vercel domain alias issue.

## Nice-to-do (not yet requested but noted)
- Events page not in mobile bottom nav (swapped for Discover) — if user wants both, consider a 6th slot or a "More" overflow menu
- Consider a post-booking satisfaction survey flow in dashboard

## Critical patterns (don't break these)
- `cookies()` from `next/headers` is **synchronous** in Next.js 13.5.1 — NEVER `await cookies()`
- Supabase SSR cookie adapter MUST use `{ cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }` — never the old `{ cookies: { get: (n) => ... } }` pattern
- Admin client (service_role) MUST include `{ auth: { autoRefreshToken: false, persistSession: false } }` 
- `.single()` is fine when followed by a null/error check; use `.maybeSingle()` when you want to silently ignore missing rows
- Wallet balance mutations ONLY via service_role routes — never via authenticated browser client (RLS enforces this now)

## Constraints / things NOT to do
- Don't push to non-main branches without explicit permission
- Don't install local CLIs in this container — it's ephemeral, they won't survive
- CCBill declined escorts (2026-06) — it's a dead end, not a pending lead
- Don't claim a UI change works without verifying (user has called this out before)
- Don't add comments explaining "what" the code does — only "why" if non-obvious
- **Data-handling policy** (`docs/data-handling-policy.md`): PII (ID docs, real names, phone/WhatsApp, messages, meetup details) stays in Supabase. External connectors get aggregate/marketing/ops data ONLY — never customer/provider identity. Stripe = clean verticals only (rentals/hotels/events/shop), NEVER escort/companionship/massage. Read that file before connecting any new external service.

## Useful files
- `app/page.tsx` — homepage (huge, mixed JSX + dangerouslySetInnerHTML)
- `app/lib/supabase.ts` — browser client
- `middleware.ts` — uses publishable key
- `app/components/CategoryAnimations/` — animated category cards
- `app/components/SliderAds/SliderAds.tsx` — featured ad slider (Velvet Stage, 480px, side-peek)
- `app/globals.css` — global CSS variables (--serif, --sans, design tokens)
- `app/sitemap.ts`, `app/robots.ts` — SEO
- `app/api/newsletter/route.ts` — newsletter subscription
- `app/api/notify/route.ts` — booking notification emails (Resend)
- `app/api/bookings/request/route.ts` — meetup-only booking for escort categories (no payment)
- `app/api/checkout/route.ts` — Stripe checkout for payable categories (rentals, hotels, events, shop)
- `app/api/webhooks/stripe/route.ts` — Stripe webhook: confirms bookings, activates featured boosts
- `app/discover/page.tsx` — swipe-to-save discover page (GSAP Draggable, "Private Gallery")
- `app/partners/page.tsx` — EU adult industry + lifestyle affiliate directory
- `app/login/page.tsx` — split-panel auth page (atmospheric left, form right)
- `app/tokens/page.tsx` — wallet/tokens page (hero counter, packages, transaction ledger)
- `supabase/migrations/` — SQL migrations

## Payment category rules (IMPORTANT)
- **Meetup-request only** (no card payment): escorts, companionship, massage, domination, experiences, nightlife, creators
- **Card payable via Stripe**: rentals, hotels, events, shop
- Enforced at BOTH client and server level. Never allow card payment for escort/sexual services.

## Key env vars (must be set in Vercel)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — replaces ANON_KEY (or set both)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, admin operations
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — payment processing
- `INTERNAL_SECRET` AND `NEXT_PUBLIC_INTERNAL_SECRET` — must match, used for internal API calls (moderation, notify)
- `RESEND_API_KEY` — email sending (optional, logs to console if absent)
- `ANTHROPIC_API_KEY` — AI moderation (auto-approves listings if absent)
- `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` — crypto token rail. While either is unset, `/api/nowpayments/charge` returns `{configured:false}` and the "Pay with crypto" button falls back to the coming-soon modal. Register IPN callback `https://www.secretxperience.eu/api/nowpayments/webhook` in NOWPayments store settings.

## How to verify a change shipped
1. `git push -u origin main` (auto-deploys on Vercel)
2. Check deployment status via GitHub MCP or Vercel dashboard
3. User confirms in browser at secretxperience.eu (hard refresh if needed)
