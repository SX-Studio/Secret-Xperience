# SecretXperience — Project Memory

Read this at the start of every session. Update as state changes.

## ⚠️ Payment processor compliance — VERIFIED FACTS (do NOT paraphrase from memory; these are quoted from actual vendor emails, 2026-06)
- **Verotel** — WILL process escort sites, but ONLY if escorts is the sole vertical. Verbatim (email from Mathilda, Yoursafe/Verotel CES, 2026-06): *"We unfortunately do not process for websites that combine escorts with any other services. Websites with escort listings may be the only service offered on such websites."* Also explicitly refuses these categories entirely: **Massage, Nightlife, Rentals, Hotels, Events**. Physical goods (Shop) capped at 30% (rest must be digital), and goods must be hosted on own site — third-party links only allowed to own social (X, Instagram). Acceptable single-vertical shapes they listed: escort listings / content creation / pics & clips / dating & AI companionship. **NET: Verotel = YES for an escorts-only site, NO for the current multi-vertical site.**
- **CCBill** — FLAT NO for escorts, regardless of site structure. Verbatim (email from Mili Torres, Sales Development, CCBill, milit@ccbill.com): *"Unfortunately, we do not provide payment services for any escort sites."* **NET: CCBill = dead end for escorts. Do not pursue for this site.**
- **🔴 Verotel account CANCELLED (verified 2026-09-27)** — Mathilda (Verotel CES, ticket #11894813, reply to our 2026-09-14 email): *"your merchant account with ID 9804000001383305 and website #136440 was canceled on August 10th. Please register for a new account with the new URL"*. **NET: the SX Verotel FlexPay rail is dead.** `VEROTEL_SHOP_ID=136440` in Vercel is stale; keep `NEXT_PUBLIC_CARD_PAYMENTS_LIVE` unset (crypto stays the buy button). Any future Verotel path for SX means a **fresh registration**, and their escorts-only rule still applies. The "Testing mode / click Request authorization" notes below are historical.
- **Verotel terms for content24market.space (content creation / pics & clips) — quoted from the same email**: own shop ID + signature key (*"Yes"*); *"15.5% (+1.5% for rebills). Daily payouts with 8 day lag to a Yoursafe Business account in the name of your company"*; rolling reserve *"10% for 26 weeks"*; creator revenue share paid *"Outside the platform"* via Yoursafe mass payouts (CSV/API); document list comes with the Yoursafe business application form after registering. **Review requires**: new account for the new URL, *"premium test credentials to browse around with as a paid user (with sufficient tokens)"*, and *"at least 10 complete demo profiles with content for sale"* looking as intended. Working file: `content-box/docs/verotel-review.md`.
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
- **Three domains, ONE deployment** — `secretxperience.eu` (marketplace, canonical), `secretxperience.nl` (full mirror → canonical .eu), `secretxperience.shop` (**storefront only**, canonical for shop content). `middleware.ts` reads `Host:` and gates per domain; `app/lib/domains.ts` is the single source of truth (`isOwnHost` / `isMirrorHost` / `isShopHost`).
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

## ⚡ Next Session — Resume Here (2026-11-12) — "Best deals" slider on secretxperience.store
Branch `claude/beautiful-dirac-izob2r` (restarted from `main` after PR #28 merged). Owner asked (Dutch, with a marked screenshot) for a full-width "BEST DEAL / % promo / hot sell" slider of discounted products from several shops/brands, placed **between the store header and the hero**.
- **DB (migration `20261112_product_deals.sql`, APPLIED live):** `products.deal`, `compare_at_cents` (old price; CHECK > `price_cents`), `deal_label`, `promo_code`, `deal_ends_at`. Additive only.
- **`app/shop/DealsSlider.tsx`** (client): rendered in `app/shop/page.tsx` right after `<ShopHeader>`. Shows live products with `deal = true` and not expired, biggest discount first; -NN% badge computed from `compare_at_cents`, label pill, "Ends in …" when ≤7 days, promo code chip. Auto-advances every 3.8s (pauses on hover/touch, off for reduced-motion), arrows on desktop, scroll-snap swipe on phones. **Renders nothing when there are no deals** — so it is invisible until the owner marks items as deals in Admin → Shop → item → Edit → "🔥 Show in the Best deals slider" (needs current price + old price). Cards open the product page; the click out stays counted via `/go/p/<id>`.
- Product page shows the struck-through old price, -% and a copy-to-clipboard promo code; grid cards show the old price struck through.
- **Mobile store header fixed** (`ShopChrome.tsx` `.sxh*` classes): on ≤640px the "Boutique" suffix, Shipping/Returns links and the signed-in email hide, so the logo is no longer clipped ("Xperience") and the nav no longer runs off-screen. Shipping/Returns stay in the footer.
- **10 real deals loaded 2026-11-12** (owner asked for real ones instead of samples): read from the public sale pages of **EasyToys, Christine le Duc and Pabo** (all one EDC platform; brands `easytoys` + `pabo` added, `christineleduc` existed), rendered in a headless browser like a shopper — prices, links (`external_url` = the shop's product page) and photos (`eqomcdn.com`) are the shops' own. ⚠️ Pulling their product search API directly was **refused by the auto-mode classifier** as access circumvention — do not retry that route; render the public page instead. ⚠️ These shops compare against the **adviesprijs (RRP)**, not an earlier own price → new column `compare_is_rrp` (migration `20261112b_deal_compare_rrp.sql`, APPLIED) and the card/product page/grid print "RRP" before the struck price. Only the Vibrating Egg has a real end time (FLASH DEAL); the others have `deal_ends_at` null, so **prices go stale — re-check against the shops weekly** and untick deals that ended. No affiliate links yet (EasyToys/EDC runs an affiliate programme — `/affiliate` on easytoys.nl); until then clicks go to the plain product page and earn nothing.
- **Partner products link straight to the shop (owner request 2026-11-12):** slider cards (`s=deals`) and grid cards on the store home (`s=home`) and brand pages (`s=brand`) for `fulfillment='affiliate'` items are `<a href="/go/p/<id>" target=_blank rel="sponsored noopener">` — no stop on our `/p/<id>` page. House items still open `/p/<id>` (our checkout). All 18 product links checked live (Tom of Finland fixed to `tomoffinland.com/shop/`, System JO → `shopjo.com`); the 7 product-only brands got `website_url` so their brand pages show a Visit button.
- **45 bestsellers added 2026-11-12** (owner: "15 products per brand" → chose EasyToys, Christine le Duc, Pabo; regular products, not deals): 15 per shop from their public top-10/bestseller pages (rendered like a shopper), no product duplicated across the three shops or with the deals, every product page checked (HTTP 200) with its `og:image`. Names translated to English; `compare_at_cents` = adviesprijs with `compare_is_rrp=true`, `deal=false` so they are not in the slider. Store home limit raised 60 → 240, brand page 24 → 60. Same staleness caveat as the deals: prices are a snapshot.
- **Per-country shop order (owner 2026-11-12: "we start with BE, NL, LU")** — `app/lib/storeMarkets.ts`: market from Vercel's `x-vercel-ip-country` (fallback: Accept-Language region; anything else → BE, the home market). BE + LU lead with **Willie**, NL leads with **EasyToys**, then all other shops in their usual order. Applied in `app/shop/page.tsx` to the deals slider (lead shop first, then biggest discount), the product grid and the brand row (stable sort). Verified locally with forced country headers: NL grid starts with all 20 EasyToys items + EasyToys first in the brand row; BE brand row starts with Willie. Brand pages are per brand and unaffected.
- **Willie (`willie.be`) added as brand `willie` — no products yet.** willie.be sits behind a Cloudflare bot challenge (403 to curl and WebFetch); do NOT try to get past it. Only second-hand prices exist (bol.com/Kieskeurig, other sellers, possibly stale) — not used. Products need Willie's affiliate product feed or URLs/data the owner supplies. The brand link is the clean `https://www.willie.be/` — the owner pasted a Google Ads URL with `gclid`/`utm` params; never store those.
- **Two brand rows (owner 2026-11-14: the old row is lingerie only; Willie + sex toy brands need their own):** `brands.kind` ('lingerie' | 'toys', migration `20261114_brand_kind.sql`, APPLIED). Toys (11): willie, easytoys, pabo, christineleduc, sinful, lovehoney, lelo, meo, bijoux-indiscrets, system-jo, superlove (moved by the owner 2026-11-14; landscape cover `/brands/superlove-wide.jpg`) — classified from each shop's own site description. Everything else = lingerie & fashion (DeMask latex, Fräulein Kink, Tom of Finland included). Store home renders `<BrandRow>` twice: "Sex Toys & Erotic Shops" first, then "Lingerie Brands"; market lead order applies inside each row. Brand page eyebrow follows kind. Admin → Shop brand form has a "Row on the store" select.
- **Brand names are marked `translate="no"` + `notranslate`** (brand row, deals slider, product grid, brand page h1, product page) — the owner's browser translated "Sinful" to "Zondig". Keep that on any new place a brand name renders.
- **Willie cover** `public/brands/willie.jpg` (2026-11-14, same treatment, from the owner's Willie wordmark + Satisfyer advent promo photo; 600×780 portrait crop). **Sinful cover** `public/brands/sinful.jpg` (2026-11-14): made from two images the owner supplied (Sinful's red toys promo photo + the Sinful wordmark) — a new white 14-point star drawn over the old "3 voor €39" badge with the wordmark centred; DB `brands.cover_url` for `sinful` set to `/brands/sinful.jpg` only after the deploy that ships the file. Brand covers made for the store go in `public/brands/`.
- **Toys row uses landscape cards** (owner 2026-11-14 chose "full photo as given" for Willie): `<BrandRow wide>` → `.brw-wide` 340×167 (phone 260×128, tagline hidden). Covers for that row must be ~2:1 landscape: `public/brands/willie.jpg` = the owner's photo untouched + wordmark in a centred white star; `public/brands/sinful.jpg` = landscape crop of the red promo, old badge filled from the surrounding red (only red-background pixels sampled — sampling everything smeared toys into the fill), smaller star. Lingerie row stays portrait 200×260.
- **Owner 2026-11-14: the white star is ONLY for Willie and Sinful.** The other covers show the logo straight on the background (EasyToys/Pabo: logo on a frosted band over their product collage; LELO white logo on charcoal; Lovehoney, Superlove on soft pink; Bluebella logo in white on dark; MEO name in white on dark red) or the brand's own share image untouched (Bijoux Indiscrets, System JO — the card already prints the brand name). Generator: scratchpad `covers2.cjs`. Logos with a white box (Bluebella, Superlove) are made transparent first.
- **Covers for the other 12 brands (2026-11-14, owner: "do this for all other brands")** in `public/brands/<slug>.jpg`, rendered from an HTML template (white 14-point star, centred): toys row landscape 1040×512 (easytoys, pabo — collage of 4 of their own product photos; bijoux-indiscrets, system-jo — their own `og:image`; lelo, lovehoney — their logo on a brand-colour gradient; meo — name in text, its site exposes no usable logo), lingerie row portrait 600×780 (bluebella, superlove — logo). **Removed from the site by the owner 2026-11-14: Elyna Force, Agent Provocateur, Tom of Finland** — brands + their products set `active=false` (not deleted: keeps click history), Elyna Force dropped from `app/data/shops.ts`, Agent Provocateur from `app/data/partners.ts`. Do not re-add them. Generator: session scratchpad `covers.cjs` (not in repo). `brands.cover_url` set only after the deploy that ships the files.
- The owner's phone shows the store in Dutch via **browser translation** — there is no i18n in the code; write English copy.
- Verified locally against a proxy that injected sample deal fields into the Supabase response (live DB untouched): slider at 92px from top on 412px and 1366px, no horizontal overflow, header overflow 0. ⚠️ Local gotcha: `pkill -f "next start"` does not stop the server — the process is `next-router-worker`; a stale one keeps port 3310 and serves mismatched chunks.

## ⚡ Next Session — Resume Here (2026-11-08) — brands on secretxperience.store (commission-only)
Branch `claude/beautiful-dirac-izob2r`. Owner's model for now: **commission only** — brands are listed free; we earn through their affiliate links. No paid brand placement yet, and **tokens are not involved** (still live-show tips only).
- **DB (migration `20261108_shop_brands.sql`, APPLIED live):** `brands` (slug, name, tagline, description, logo/cover, `website_url`, `affiliate_url`, `affiliate_network`, `commission_note`, `is_house`, featured, sort, active; public read of active rows), `products.brand_id` + `products.sort`, `affiliate_clicks` (brand_id, product_id, source, clicked_at — **no user id, no IP**; service_role only). Seeded: the 23 boutiques from `app/data/shops.ts` + 7 brands named on products (all 8 products linked) + the house brand `secretxperience` (`is_house`, **inactive until its first item goes live** — the admin API switches it on).
- **Outbound links always go through `/go/b/<slug>` or `/go/p/<id>`** (`app/go/[kind]/[id]/route.ts`): counts the click (crawlers skipped), then 302s to `affiliate_url` → else `website_url` (product: its own `external_url` first). Never render a raw affiliate URL as an href — the count is our only record of the traffic we sent a brand. `/go/` is robots-disallowed and passed through on .store.
- **Pages:** `.store/b/<slug>` (→ `app/shop/brand/[slug]`; `.eu/shop/brand/<slug>` redirects there), brand row "Shop the Brands" on the store home (DB-driven, replaces `ShopShowcase` there; the homepage's `ShopShowcase` still reads the static `app/data/shops.ts` — two sources until that is migrated), "The SecretXperience Collection" section appears only once house items exist. Commission disclosure lines on home, brand and product pages. Partner product pages no longer promise our "discreet EU shipping".
- **Admin → Shop** (`app/admin/ShopTab.tsx`, `app/api/admin/shop/route.ts`): add/edit brands (affiliate link, network, commission note), add/edit/delete items, 7d/30d click counts per brand and item. **Fulfilment is derived from the brand, never chosen:** partner items are always link-out (`affiliate`), only house items use our card checkout (`stripe`) — we never take payment for a partner's goods. Brands are deactivated, not deleted (would cascade their click history). Images are URLs (https or `/public` path) — no upload yet.
- **Verified on the PR preview (real key):** `/go/b/honeybirdette` → 302 `eu.honeybirdette.com` + 1 click row; `/go/p/<lelo item>` → 302 `lelo.com` + 1 row (brand + product); brand with no link → store home, not counted; Googlebot UA → redirected, not counted. Test rows deleted.
- **Owner decision 2026-11-08: the Dorcel Club affiliate banner STAYS on secretxperience.store** (`<DorcelBanner />` in `app/shop/page.tsx`, re-added in `65777d0`). This overrides the older note below that it is hidden on the standalone storefront — do not remove it.

## ⚡ Next Session — Resume Here (2026-11-03) — shop + tokens moved to secretxperience.store
Branch `claude/fervent-clarke-dd299j` (draft PR). Owner's rule: **payments are taken only for (1) tokens, spent only on live-show tips, and (2) the adult shop — both on `secretxperience.store`.**
- **Domains:** `.store` replaces `.shop` as the storefront (`app/lib/domains.ts`: `SHOP_HOST = 'www.secretxperience.store'`, `isShopHost` = .store, new `isLegacyShopHost` = .shop → middleware 308s every path to the same path on .store). `.store` serves `/` boutique, `/p/<id>`, legal docs, **`/tokens`** (session-gated on .store, signed-out → `.store/login?next=/tokens`), `/login`, `/auth/*`, `/sso/*`; everything else 307 → `/`.
- **Marketplace redirects** (`storeDestination()` in middleware): `/tokens`, `/shop`, `/shop/<id>`, `/shop/legal/<doc>` on .eu/.nl → .store. With an `sb-*auth-token` cookie it goes via `/sso/start?return=…` so the user lands signed in; without, straight to .store. `/tokens` dropped from `PROTECTED_ROUTES`. Same Supabase DB → **no wallet sync needed**.
- **Payment APIs are host-locked to .store:** `/api/nowpayments/charge`, `/api/verotel/charge`, `/api/shop/checkout` return 403 elsewhere. NOWPayments `success_url`/`cancel_url`/`ipn_callback_url` now use `SHOP_ORIGIN` (old `siteUrl()` guard removed — constant https origin).
- **Tokens = live-show tips only.** New `tip_live_stream()` (SECURITY DEFINER, service_role only; conditional UPDATE is the overspend guard; ledger `spend` 'Live show tip' ref=stream id; earning row in new `live_tips` table; chat line `is_tip=true`), route `POST /api/live/tip` (amounts 10/25/50/100/250), tip buttons in `app/livestreams/[id]/page.tsx`. Migration `20261103_live_tips.sql` **APPLIED live** (+ errcode fix) and verified in a rolled-back txn: 50000→49990, overspend/self-tip/ended all refused, anon/authenticated cannot EXECUTE. ⚠️ Raise plain `raise exception 'msg'` — custom errcodes P0002–P0004 collide with Postgres built-ins (P0004 = assert_failure, uncatchable by WHEN OTHERS). Also fixed: `live_chat insert own` policy now forbids client-side `is_tip`/`tip_amount` (fake tips were possible).
- **Disabled (410, old code in git history):** `/api/tokens/spend` (ad tiers), `/api/listings/flash-boost`, `/api/creators/subscribe`, `/api/creators/gift`, `/api/featured-boost` (Stripe card payment for escort-listing boosts — Stripe-prohibited). UI: tier picker removed from `/listings/create`, "✦ Feature" removed from dashboard, `/boost` → 307 `/advertise`, advertise Featured/Slider CTAs → `/contact`, creator memberships/gifts hidden (`TOKEN_EXTRAS_ENABLED=false` in `PublicProfile.tsx`).
- **Performer payouts for tips are NOT built** — `live_tips` is the earnings record to pay from.
- ⚠️ The old "tokens = B2B advertising credits" framing (processor-outreach docs, decision memo) is now **wrong** — tokens pay for live-show tips. Never send that framing to a processor.
- **Owner TODO before merge:** add `www.secretxperience.store` (primary) + apex (308 → www) to the Vercel project (this connector gets 403); at Hostinger replace the parked `A 2.57.91.91` with Vercel's records; add `https://www.secretxperience.store/**` to Supabase Auth Redirect URLs (and Google OAuth if used); register `.store` as the Stripe business URL. Merging before DNS works sends /shop and /tokens to a dead domain.
- Still open from earlier: Stripe Connect onboarding (`/api/connect/*`) and `/api/checkout` (rentals/hotels/events bookings) still use Stripe on .eu; gift coins (`/api/gifts/purchase`) still on the cancelled Verotel account.

## ⚡ Next Session — Resume Here (2026-10-01)
Branch **`claude/dashboard-creators-studio-msillx`** (NOT merged; user chose feature-branch + PR this session). Work done this session, all pushed:
- **Admin mobile swipe fix** — every boxed table has `className="adm-table-wrap"` (`overflow-x:auto`, touch scrolling, global rule — the user's phone renders admin at desktop width so a mobile-only media query never fired) + `minWidth:640px` on the `<table>`. New tables MUST reuse both.
- **Admin bugs fixed**: Contacts category filter listed only lead categories (never matched the listing tables) → optgroups for Listings + B2B leads; Reports card guarded `r.url`; Bookings cancel asks to confirm; `ADMIN_CATEGORIES` gained `photo`.
- **Category/type alignment**: `hotels` added to create form, search filter, `/[category]` CAT_NAV (Hotels page + Stripe checkout already expected it; nothing could create one). Sitemap lists massage/domination/experiences. Create form now writes the `type:` tag (same as dashboard editor) from the Gender field; `tagMatchesType` accepts `Gender:` prefix; escorts page falls back to subcategory for trans/non-binary. **Live DB categories: escorts 478, companionship 9, massage 4, domination 1, photo 1** — `events` ("Event Spaces") is creatable + Stripe-bookable but has NO index page (`/events` reads the `events` table). Open question for the user.
- **Private Reception fix**: `/private-reception` was dropping 269 escorts (filtered on category instead of `subcategory ilike 'private reception%'`). City pages for rentals/nightlife had wrong `.in('category')` values — fixed.
- **Bird SMS consent campaign (built, needs owner config)** — `app/admin/CampaignsTab.tsx`, `app/lib/bird.ts`, `app/lib/adminAuth.ts`, `app/api/admin/sms-campaign/{route,send,test}`, `app/api/bird/webhook/route.ts`; migration `20261001_sms_consent_campaign.sql` APPLIED live (tables `sms_campaigns`, `sms_campaign_messages`, `sms_optouts`; listings `consent_status/consent_at/consent_campaign_id`; service_role-only RLS). Reply KEEP → `consented`; REMOVE/STOP → opt-out + listing deactivated; no reply after N days → `unpublish_unanswered_consent()` cron (`20261001_consent_no_reply_sweep.sql`, applied). **To activate:** set `BIRD_API_KEY`, `BIRD_SMS_FROM`, `BIRD_WEBHOOK_SECRET` in Vercel; subscribe `https://www.secretxperience.eu/api/bird/webhook` to `sms.received` + delivery events in Bird; sign Bird DPA; approve copy (`DEFAULT_BODY` in CampaignsTab) and no-reply window; test-send first. Listings were scraped from **redlights.be** — the campaign IS the accuracy mechanism; do not re-scrape.
- **Events auto-expiry** — `expire_past_events()` + daily cron (`20261001_expire_past_events.sql`, applied); `/events` query hides past non-recurring events.
- **Events discovery agent (built 2026-10-01, PR #20 follow-up)** — `app/lib/eventsDiscovery.ts` (12 `DISCOVERY_TARGETS` cities BE/NL/DE/FR/UK/ES/CH; Claude `claude-opus-5-5` + `web_search_20260209`, adaptive thinking, effort medium, ≤6 searches; rows normalised to the `events` shape; slug = title+city+date is the dedupe key), `app/api/cron/events-discover` (bearer `CRON_SECRET` || `INTERNAL_SECRET`; one least-recently-scanned city per call; `maxDuration 60`), `app/api/admin/events` (GET queue/published/runs, PATCH approve|reject|unpublish|feature, POST {city} manual scan), `app/admin/EventsTab.tsx` (Admin → Events). Discovered rows: `source='discovery'`, `status='pending'`, `active=false` until approved; rejected rows stay (slug blocks rediscovery). Migration `20261002_events_discovery.sql` APPLIED (events columns `source/source_url/discovered_at/status/reviewed_*`, `event_discovery_runs`, `app_settings`, `pg_net`, pg_cron job `events-discover-hourly` at :20 calling the route via `net.http_post` with url+secret from `app_settings`). `vercel.json` adds a daily 03:40 Vercel cron as fallback. **Supabase side is fully seeded (url + secret in `app_settings`).** **Vercel side needs the owner:** add env `CRON_SECRET` = the value in `app_settings.events_discover_secret` (this connector gets 403 on env writes), and `ANTHROPIC_API_KEY` must be set or the route returns 503 / tab says "Discovery is off". ⚠️ Supabase's `postgres` role cannot `alter database … set app.*` — use the `app_settings` table pattern for any future cron secret.
- **Headless audit results (30 routes × mobile/desktop, live site)**: zero horizontal overflow anywhere; no 5xx. Fixed: 17 client pages carried the homepage `<title>` (no metadata possible from `'use client'`) → per-route `layout.tsx` with title/description (`login`, `refer` noindex); `creator_posts` had a public-read policy but no `anon` SELECT grant → logged-out `/creators` feed 401'd → `grant select … to anon` (applied live, `20261001_creator_posts_anon_select.sql`); redundant tabler `@import` removed from login/discover/partners. Known-harmless: `/promos/shannafrancaise.jpg` + `/destinations/*.jpg` 404 (both have onerror fallbacks — drop the files in `public/` to light them up); a stray `/&` request on login/discover/partners (not in served HTML, runtime-generated, no visible effect, source not found).
- **Headless audit note**: Chromium in the cloud container can't trust the proxy CA (NSS store empty, no certutil). Working pattern: Playwright `context.route('**/*', route.fetch → fulfill)` with `proxy: {server: HTTPS_PROXY}` so requests go through Node (NODE_EXTRA_CA_CERTS). Script in session scratchpad `audit.mjs`.
- Pre-existing `tsc` errors in `app/page.tsx` (inline-script typing), `app/layout.tsx` (`Viewport` import) and `.next/types` — build has `ignoreBuildErrors: true`; not regressions.

---

## ⚡ Previous — Resume (2026-09-10)
Last thing completed: **Multi-domain rollout** — PR #15 merged to `main` as `7acbfc2` (merge commit; 3 commits `d855fb3` `.nl` mirror, `acc74cf` `.shop` storefront, `60aa8d1` cross-domain session bridge). LIVE VERIFICATION: **VERIFIED LIVE 2026-09-10 (post-deploy `7acbfc2`, real domains, real status codes via `curl -w`):** `www.secretxperience.shop/` 200 = boutique, canonical `https://secretxperience.shop/`, **no `<a>` into the marketplace**; `/escorts` `/nightlife` `/discover` `/tokens` `/dashboard` `/partners` all **307 → `/`**; `/p/<id>` 200 with product `<title>` + `/p/<id>` canonical; `/terms` = shop Terms of Sale; own robots + sitemap (13 URLs, 8 products, 0 `.eu`); `/sso/land` 200; `/sso/start?return=evil` 400; no-session bridge → `/login?next=…` on the shop domain. `.nl` `/` `/terms` `/partners` `/discover` `/escorts` all carry `.eu` canonicals (the ~60-page gap is closed). `.eu/shop` canonical → `.shop`, Dorcel banner still on `.eu/shop`, `.eu` sitemap has 0 `/shop`, `.eu/dashboard` 307 → `/login`. Cosmetic leftover: storefront `twitter:image` inherits `https://www.secretxperience.eu/og-image.jpg` from root `metadataBase` (image asset, not a link) — shop page sets `openGraph` but not `twitter`/`openGraph.images`, so share previews use the marketplace artwork. **Apex `secretxperience.shop` still DNS-split** (4 tries: Vercel, hcdn, hcdn, Vercel) — user must delete the Hostinger `A` record.

**How `.shop` serves only the shop (no separate deploy):** on the `.shop` host middleware rewrites `/`→`/shop`, `/p/<id>`→`/shop/<id>`, `/terms|privacy|shipping|returns`→`/shop/legal/<doc>`, passes `/login` `/reset-password` `/auth/*` `/sso/*`, and **307s every other path to `/`** — the escort marketplace is unreachable on that hostname by design. `ShopChrome` `standalone` mode carries no link into the marketplace (no `/`-home, Events, Advertise, vendor CTA; Dorcel Club affiliate banner was hidden on `.shop` — ⚠️ superseded 2026-11-08: owner wants it shown on `.store`). This is the compliance boundary from `docs/data-handling-policy.md`: a processor reviewing `.shop` must see e-commerce, not one click of an escort directory. **Do not add a marketplace link to the standalone chrome, and any NEW page that should exist on `.shop` must be allow-listed in `middleware.ts` `shopRewrite`/`shopPassthrough` or it will bounce to `/`.**

**Payments stay separate — card vs tokens:** `.shop` is card-only (Stripe `mode:'payment'`, `payment_method_types:['card']`); zero wallet/token references in shop or checkout code; `/tokens` on `.shop` bounces to `/`. Tokens = advertising credits, marketplace only. The shared account shares *identity*, never *payment method*. Do not make tokens spendable in the shop — it re-entangles the domains exactly where a processor looks.

**Cross-domain session bridge** (`app/sso/start/route.ts`, `app/sso/land/page.tsx`): cookies don't cross registrable domains and `/api/shop/checkout` is 401 without a session. `/sso/start?return=<https own-host URL>` verifies the caller via `getUser()`, mints a single-use magic-link token via `admin.generateLink`, 302s to `<origin>/sso/land#th=…&r=<path>`; `/sso/land` redeems via `verifyOtp({token_hash,type:'magiclink'})` → cookies on that domain. Token rides in the URL fragment. `return` must be https on an own host; resume paths relative-only, `//` refused. Uses existing `SUPABASE_SERVICE_ROLE_KEY` — **no new env var, no migration.** Happy-path redeem is human-only to test (needs a real session): sign in on `.eu`, open `https://www.secretxperience.eu/sso/start?return=https://secretxperience.shop/`.

**Canonicals (all via `Link:` HTTP header in middleware — ~60/68 pages have no metadata):** `.nl/*` → `.eu` twin; `.eu|.nl /shop` → `https://secretxperience.shop/`; `/shop/<id>` → `…/p/<id>`; `.shop` self-canonical on the **apex** (`SHOP_ORIGIN`). `/shop` removed from `.eu` sitemap; `.shop` has its own host-aware robots + sitemap.

**STILL TO DO (user-side):**
- **Hostinger DNS: delete the leftover apex `A` record `2.57.91.91`** for `secretxperience.shop` — apex currently round-robins Hostinger parked page ↔ Vercel and blocks the apex cert. `www` is clean (Vercel only). Then in Vercel set the **apex as primary**, `www` → redirect.
- **Trader identity: 9 × `[TO COMPLETE]`** in `app/shop/legal/[doc]/page.tsx` (legal name, address, registration, VAT, billing descriptor, governing law, support email). Required under 2011/83/EU Art. 6 before taking an order. Not recorded anywhere in the repo — never guess it.
- Human-only bridge test (above).
- Follow-ups (not built): shop-skinned `/login` on `.shop`; shop "my orders" page; "Open the Boutique" button on the `.eu` dashboard as the bridge trigger.

**Correction — do not re-propagate:** an old `middleware.ts` comment claimed the Supabase publishable key is "origin-restricted" (`Host not in allowlist`). **Tested false** against the live REST API with the real key: an unrelated `Origin` is served identically. No allowlist exists; the comment has been rewritten. Supabase Auth **Redirect URLs** (Dashboard → Auth → URL Configuration) DO matter — `.nl` and `.shop` entries added by user 2026-09-10.

---

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
- **🔴 Token purchases were dead for 3 months — `payment_orders.advertiser` (2026-09-15)** —
  every token purchase on SX, Verotel **and** NOWPayments, had been failing since
  **2026-06-05**. Proof: the last row ever written to `payment_orders` is the Verotel
  test of `2026-06-04 13:11`; zero rows since.
  - **Root cause:** the live column is **`provider`** (default `'ccbill'`) and
    **`provider_order_id`**. The 2026-06-05 *"provider" → "advertiser"* terminology
    rename (the one that also did admin role labels and "View listing" → "View
    advertisement") swept the **DB column keys** along with the UI copy. PostgREST
    rejects an insert naming a column that doesn't exist → `orderErr` → HTTP 500.
    The Verotel test on 06-04 passed because it predated the rename by one day.
  - ⚠️ **`payment_orders` columns are `provider` / `provider_order_id`. Never
    `advertiser`.** The product calls that role an *advertiser*; the database does
    not. Do not let a global rename touch `.insert({...})` / `.update({...})` keys.
    Note `verotel/webhook` line 113 was already correct and line 195 was not — the
    rename hit some lines and not others, so grep, don't assume.
  - **Why nobody noticed:** `handlePurchase` and `payWithCrypto` in
    `app/tokens/page.tsx` showed the "Payment coming soon" modal on *any* non-`url`
    response, so a 500 was indistinguishable from "not configured yet". Both now
    show the real error and reserve the coming-soon copy for `configured === false`.
    Same lesson as the Bird/OTP debugging rounds: **the provider's reason existed and
    was simply unreachable.** Also added: `console.error` on the failing
    `payment_orders` insert in both charge routes, and NOWPayments' own status + body
    logged in `createInvoice` (never the API key).
  - **Not fixed here:** `app/api/ccbill/*` carries the same `advertiser` /
    `advertiser_order_id` bug. Those routes are dead and unwired — left alone rather
    than widening the diff. Fix them if CCBill is ever revived; better, delete them.
- **Tokens page steers to crypto while Verotel is in test mode (2026-09-15; ⚠️ 2026-09-27: the Verotel account was cancelled on 2026-08-10, see top — the flag stays unset)** —
  Verotel website #136440 is still "New — Testing mode", so a real buyer's real card
  cannot complete a purchase there. Leaving **Buy now** as the primary CTA sent people
  to a payment page that could not take their money.
  - **One switch: `NEXT_PUBLIC_CARD_PAYMENTS_LIVE`** (`app/tokens/page.tsx`, top of file
    as `CARDS_LIVE`). Unset/false → **crypto becomes the buy button** on every package,
    the card button becomes a muted `Card · coming soon` that opens the modal, and a
    notice sits above the package grid. Set it to `true` in Vercel **and redeploy** to
    put cards back exactly as they were — the CTA pair, the notice and the modal copy all
    read the same constant. ⚠️ `NEXT_PUBLIC_*` is resolved at build time, so changing the
    var alone does nothing without a redeploy.
  - The card button does **not** call `/api/verotel/charge` while cards are off — there is
    no point redirecting to a test-mode page. It opens the modal, whose copy now points
    at crypto instead of only offering "contact us".
  - ⚠️ **When Verotel authorises, flip the flag — do not re-edit the JSX.** Both CTA
    arrangements are in the file behind the one ternary.

- **Email senders centralised (2026-09-13)** — `app/lib/mail-from.ts` is now the single
  source of truth. Three addresses had drifted across 9 send sites (`hello@`,
  `noreply@`, `no-reply@`), so the platform reached people under three identities.
  All now use `MAIL_FROM` (default `SecretXperience <no-reply@secretxperience.eu>`,
  overridable with `EMAIL_FROM`) plus `reply_to: MAIL_REPLY_TO` (default
  `support@secretxperience.eu`, overridable with `EMAIL_REPLY_TO`) — people reply to
  no-reply addresses anyway, so those replies now land in a mailbox that is read.
  ⚠️ `app/api/contact/route.ts` deliberately KEEPS `reply_to: email` (the visitor's
  address) so support can reply to the sender — only its `from` changed. Verified:
  `secretxperience.eu` already has Resend DKIM + SPF records live, so no domain setup
  was needed. Add a new sender by changing the env var, not the routes.
- **Multi-domain (2026-09-10, PR #15 → `7acbfc2`)** — `.nl` mirror with canonical headers; `.shop` standalone storefront (`app/shop/ShopChrome.tsx`, `app/shop/legal/[doc]`, host-aware `robots.ts`/`sitemap.ts`, product page split into server wrapper + `ProductDetail.tsx`); cross-domain session bridge (`app/sso/*`); `next` survives Google OAuth; pre-existing `//evil.com` open redirect in both `next` readers fixed; Stripe checkout return URLs follow the host (Verotel's stay pinned to `.eu` in `lib/site.ts` — its signature covers them). See the 2026-09-10 resume section.
- **Crypto token rail — NOWPayments (ON `main`, env set 2026-09-15)** — parallel payment rail to Verotel for buying tokens (advertising credits; compliant — tokens ≠ escort booking). Mirrors the Verotel flow exactly. Files: `app/lib/nowpayments.ts` (config → `configured:false` until both env vars set, `createInvoice` via `api.nowpayments.io/v1/invoice`, `verifyIpn` = HMAC-SHA512 of key-sorted JSON vs `x-nowpayments-sig`), `app/api/nowpayments/charge/route.ts` (auth → pending `payment_orders` row with `provider:'nowpayments'` → hosted invoice → `{ url }`; graceful `{configured:false}` HTTP 200 → tokens page shows the "coming soon" modal), `app/api/nowpayments/webhook/route.ts` (verify IPN sig → credit only on `payment_status:'finished'`, ledger-based idempotency identical to the Verotel webhook). UI: `app/tokens/page.tsx` gained a `payWithCrypto()` handler + a subtle "◎ Pay with crypto" button under each package's "Buy now". The code is **on `main`** (an earlier note here claiming it sat unmerged on `claude/investment-plan-sx-content24-i3z6i0` was wrong). Env vars set in Vercel 2026-09-15.
  **2026-09-23 — two money bugs found in the live rail and fixed:**
  (1) ⚠️ **Double-credit race.** Both this webhook and Verotel's guarded with a
  SELECT-then-INSERT on `token_ledger`. That is a read-then-write race: two overlapping
  IPN retries both saw no row and both credited, and a ledger insert that failed *after*
  the wallet credit was re-credited on every retry. Migration
  `20260915_token_ledger_purchase_idempotency.sql` (**APPLIED LIVE**) adds a unique index
  on `(reference_id) where type='purchase'` — scoped to purchases because a `spend` row
  legitimately repeats a reference_id (boosting one listing twice). The webhook now takes
  the ledger row as an atomic **lock before the money moves**, treats `23505` as
  "already credited → OK", and deletes the row if the wallet update then fails so the
  retry is clean. ⚠️ **`app/api/verotel/webhook/route.ts` still has the old shape** — the
  index protects the table, but that route should be moved to the same pattern.
  (2) **`createInvoice` swallowed every provider error** (`return null`). It now returns
  `{ok:false, reason}` carrying NOWPayments' status and body to the route log, never the
  API key, and refuses outright if `siteUrl()` is not a public https origin.
  `siteUrl()` is already safe (falls back to the canonical `.eu`, rejects `vercel.app`),
  so SX never had Content Box's localhost-callback bug.
  **Verified:** zero new `tsc` errors (244 before, 244 after — SX's baseline is not
  clean), and `next build` compiles. ⚠️ `next build` fails in a bare container because
  `app/api/community/route.ts` builds a Supabase client at module scope with `!`
  assertions — supply dummy env vars to build locally.
- **Controlekamer QR login — root cause found + fixed (2026-11-11, PR #12, still NOT on main)** — "the QR sends me to SecretXperience, not the control panel" was **not** the QR (it always encoded `/controlekamer/approve?t=…`; verified by regenerating the SVG byte-for-byte). The site-wide `WelcomeChoice` modal rendered over `/controlekamer/*`; on a phone it covers the approve screen and its Creator button does `location.href='/advertise#pricing'` — where the owner landed. Fixed: `/controlekamer` added to `WelcomeChoice` `SKIP`; cookie banner, Pride toggle and floating language picker suppressed there; `app/controlekamer/layout.tsx` gives the segment its title + noindex. ⚠️ **Any new global overlay mounted in `app/layout.tsx` must skip `/controlekamer`** (and `/admin`). Also fixed: `/admin?tab=<Tab>` deep links now work (hub shortcuts all landed on Listings); link registry rewritten to verified targets (Content24 = `content24market.space` + Supabase `jpnnzxnvubrosjjcbkmn`; `content24.eu` and `secretxperience.com` never existed); session start returns 503 `not_configured` if `INTERNAL_SECRET` is missing instead of looping. **Verified on the PR preview in a real browser:** gate shows QR with no overlays → session row approved → page unlocks itself → hub renders 9 groups / 55 links with live counters; replayed token = `consumed`; stats without grant = 401; approve API without admin login = 401. The approval write was simulated in SQL (needs a human admin login) — the real phone tap is the one step still to be done by the owner. Second, separate obstacle on previews only: Vercel Deployment Protection blocks a phone that is not signed in to Vercel — production has none. **To go live: merge PR #12.**
- **Controlekamer — admin command centre (2026-09-01, branch `claude/admin-controlekamer-qr-beny49`, NOT on main)** — `/controlekamer`: a separate locked-down admin hub unlocked by a phone→desktop QR device-authorization, then a one-screen backend launchpad for SX.eu + Content24. Flow: desktop POSTs `/api/controlekamer/session` → gets pending row + QR + 6-char code; admin scans on phone, opens `/controlekamer/approve?t=` (admin-gated), compares the code, taps Goedkeuren → `/api/controlekamer/approve` sets the row approved; desktop poll (`GET /api/controlekamer/session`) then mints an **HMAC-signed httpOnly grant cookie** (`sx_ck_grant`, 12h, signed with existing `INTERNAL_SECRET`) and the server page renders `<ControlRoom/>`. Sessions expire 5 min, single-use (`consumed`). Files: `app/controlekamer/{page,Gate,ControlRoom,styles,approve/page}.tsx`, `app/api/controlekamer/{session,approve,stats,lock}/route.ts`, `app/lib/controlekamer.ts` (grant HMAC), `app/data/controlekamer.ts` (editable link registry). QR is generated **server-side** with the `qrcode` npm pkg (added to package.json) — no external calls, no PII leaves the site. Link groups: SX admin, Content24, Infra (Hostinger, Supabase deep links, Vercel, GitHub), Google (Search Console/Analytics/Workspace), Payments (Verotel/Stripe/NOWPayments), Resend; links flagged `configure:true` have a guessed deep-URL to confirm. Live counters via grant-gated `/api/controlekamer/stats` (aggregate counts only). Migration `20260901_controlekamer_sessions.sql` — **APPLIED to prod** (table `control_room_sessions`, RLS on, service-role only). Discoverable link added to `/admin` nav; noindex + robots disallow. Requires `INTERNAL_SECRET` set in Vercel (already required). Design mirrors `public/architecture.html` (Cormorant + IBM Plex, gold/teal/purple). **Twilio SMS-OTP 2FA added (2026-09-01)**: after the phone approves, the server sends a Twilio Verify OTP to `CONTROLEKAMER_OTP_PHONE`; the poll returns `awaiting_otp` (with a masked phone hint) instead of granting, the desktop shows an OTP input, and only `/api/controlekamer/otp` (verifies the code via Twilio Verify) mints the grant. Files: `app/lib/twilio.ts` (REST Verify helper — no SDK), `app/api/controlekamer/otp/route.ts`; approve/session routes + Gate updated. Columns `otp_required`/`otp_verified` added via migration `20260901_controlekamer_otp.sql` (**APPLIED to prod**). **Graceful fallback**: if Twilio env is absent, approval grants directly (no lock-out); if the OTP send fails it also falls through (admin already passed the phone-approval factor). Env vars to set in Vercel to enable: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`, `CONTROLEKAMER_OTP_PHONE` (E.164 owner mobile). **Secret bypass link (2026-09-03)**: `GET /controlekamer/enter?key=<secret>` mints the grant cookie directly (no QR, no login) and redirects to `/controlekamer` — a convenience backdoor at the owner's request. Route: `app/controlekamer/enter/route.ts`. DISABLED unless `CONTROLEKAMER_BYPASS_SECRET` is set in Vercel; wrong/blank key or unset secret silently falls back to the QR gate (303). Constant-time compare; grant sub is `bypass-link`. Rotate/disable by changing/clearing the env var. Security note: the key rides in the URL (browser history, referrer, logs) — anyone with the link is in; it's the weakest of the access options (QR-only is strongest).
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
- **`.shop` apex DNS split** — remove Hostinger `A` `2.57.91.91`; set apex primary in Vercel. (User-side; see 2026-09-10 resume.)
- **`.shop` trader identity** — fill 9 × `[TO COMPLETE]` in `app/shop/legal/[doc]/page.tsx` before accepting orders.
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
- **Domain gate lives in `middleware.ts`.** New page meant for `.shop` → add to `shopRewrite`/`shopPassthrough` or it 307s to `/`. Never render a marketplace link in `ShopChrome` when `standalone`. Shop content is canonical on the `.shop` **apex**.
- **`.shop` is card-only.** No wallet/token code in `app/shop` or `app/api/shop`.
- **`/sso/start` `return` must stay https + own-host (`isOwnHost`)**, resume paths relative-only and `//` refused — that check is the only thing between the bridge and an open-redirect/account-takeover.
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
- `app/lib/domains.ts` — the three domains; `isOwnHost` / `isMirrorHost` / `isShopHost` / `SHOP_ORIGIN`
- `middleware.ts` — per-host routing gate + canonical `Link:` headers + auth gate
- `app/shop/ShopChrome.tsx` — host-aware shop header/footer (`standalone` = `.shop`)
- `app/shop/legal/[doc]/page.tsx` — shop Terms/Privacy/Shipping/Returns (trader identity `[TO COMPLETE]`)
- `app/sso/start/route.ts`, `app/sso/land/page.tsx` — cross-domain session bridge
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
- `BIRD_API_KEY`, `BIRD_SMS_FROM`, `BIRD_WEBHOOK_SECRET` — Bird SMS consent campaign (Admin → Campaigns). Unset = tab shows "Bird not configured", send routes return 503, webhook 401s. Never paste keys in chat.
- `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` — crypto token rail. While either is unset, `/api/nowpayments/charge` returns `{configured:false}` and the "Pay with crypto" button falls back to the coming-soon modal. **Nothing to register in the NOWPayments dashboard** — `ipn_callback_url` is sent on every invoice, built from `siteUrl()` (pinned to `https://www.secretxperience.eu`, so there is no `APP_ORIGIN`-style localhost hazard here). For the **card** on-ramp (buyer pays by card, Guardarian converts, we receive crypto): NOWPayments → Settings → Coins Settings → enable EUR. No code change; EUR then appears in the invoice's "Pay currency" selector.

## How to verify a change shipped
1. `git push -u origin main` (auto-deploys on Vercel)
2. Check deployment status via GitHub MCP or Vercel dashboard
3. User confirms in browser at secretxperience.eu (hard refresh if needed)
