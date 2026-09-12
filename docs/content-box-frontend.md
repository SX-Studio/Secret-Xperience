# Content Box — Frontend Architecture & Design Reference

> **Source of truth for the UI**: the interactive prototype "Content Box Prototype"
> (Artifact `1b69c5da-0515-40b6-b5d2-6b45739cf8ee`, owned by the user).
> This doc extracts its design system, components, screens, and interaction model so production build matches it. Read with `content-box-concept.md` + `content-box-architecture.md`.
> Status 2026-08-22: adopted as the frontend spec for the Content Drop 24 app. Prototype = mock data, no backend; production wires the same UI to the architecture doc's APIs.

---

## 1. What the prototype is
A single-file, mobile-first, vanilla-JS/CSS prototype rendered as a **394×812 phone frame**. It demonstrates the full core loop with mock state (no network): **Discover → Rent → Expire**, plus **Drop** (creator post → pending review → approved). Placeholders are abstract CSS gradients — production swaps them for real blurred previews. Language in-UI is **Dutch** (nl) with mono IDs in English format.

**Adopt exactly:** the design tokens, typography, component structure, screen layouts, nav, and interaction patterns below. **Replace for production:** mock `state` → real APIs; CSS-blur gradients → server-generated blur previews; client timers → backend-authoritative access checks; `setTimeout` moderation → real T&S pipeline.

---

## 2. Design system (adopt verbatim)

### Typography
- **Fraunces** (serif) — display & headings (`.nm`, `h1/h2`, balance number, empty-state titles). Weights 500/600, tight letter-spacing (−.02em).
- **IBM Plex Sans** — body/UI default. Weights 400/500/600.
- **IBM Plex Mono** — all IDs (`CNT-`,`CRT-`,`USR-`,`BOX-`,`RNT-`), timers, prices, token amounts, ledger amounts, eyebrow labels. This mono-for-machine-values rule is a core part of the look.
- Loaded from Google Fonts (allowed in artifacts); give real fallbacks in production (`system-ui`, `monospace`).

### Color tokens (CSS variables, theme-aware)
Light (`:root`) → Dark (`@media prefers-color-scheme:dark` + `[data-theme="dark"]`). Full parallel set.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#e9eaef` | `#08090d` | app background (+ radial ember glow top-left) |
| `--app` | `#ffffff` | `#111319` | phone surface |
| `--surf` / `--surf2` | `#f4f5f8` / `#eceef3` | `#171a22` / `#1e222c` | cards / insets |
| `--ink` / `--ink2` / `--ink3` | `#171a21` / `#525a68` / `#8a92a1` | `#eceef3` / `#a7afbd` / `#727b8b` | text primary/secondary/tertiary |
| `--line` / `--line2` | `#e2e5ec` / `#d3d8e2` | `#242a34` / `#2f3542` | borders |
| **`--ember`** | `#d94e2f` | `#f0764f` | **primary brand + CTAs + active nav** |
| `--teal` | `#0f867a` | `#3cb6a7` | **active rental timer** |
| `--gold` | `#a9762a` | `#d3a24e` | **tokens / prices / currency** |
| `--ok` / `--warn` / `--bad` | `#2c8a57` / `#b8811c` / `#c23a2b` | `#54b581` / `#d6a53f` / `#e46a58` | ledger credit / pending review / expired-error |

**Semantic rule:** ember = brand/action, gold = money, teal = live time remaining, warn = PENDING REVIEW, bad = expired/insufficient. `--shadow` token (soft, layered). Rounded geometry: cards 18px, media 210px tall, buttons 11px, phone frame 40px, pills 999px.

### Motion
Transitions ~.15s on interactive states; blur reveal .5s; cart slide-up .28s cubic-bezier; `prefers-reduced-motion` disables all. Buttons `:active{scale(.97)}`.

---

## 3. App shell / layout
```
.phone (394×812, radius 40, --app, --shadow)
 ├─ .status         status bar — "9:41" · "BOX-0007 · AFRICAN GIRLS" (mono, ink3)
 ├─ .top            box badge (✦ gradient) + name (Fraunces) + sub + .walletchip (gold pill, ◈ balance)
 ├─ .view           scrollable content region (renders active tab)
 ├─ .cart           slide-up rent bar (dark), shows on selection: total tokens + count + "Rent 24u"
 ├─ .toast          transient center-bottom message
 └─ .nav            bottom tab bar (4 tabs, blur backdrop)
```
Desktop: an `.aside` caption panel sits left of the phone (hidden < 820px). Production web app = the phone column full-bleed responsive; the aside is prototype chrome only.

### Bottom nav (4 tabs, each SVG icon + label)
`Discover` (grid) · `My Rentals` (clock, **red badge = active rental count**) · `Drop` (upload) · `Wallet` (card). Active tab = ember.

---

## 4. Screens (components to build)

### 4.1 Discover / Feed (`renderFeed`)
Vertical list of **content cards**:
- **Media block** (210px): gradient placeholder under `.ph.blur` (blur 26px + scale 1.18 + saturate), centered photo-icon face, gradient lock-row at bottom → `🔒 Blurred preview · huur om te bekijken`.
- **Overlays:** top-left tag = `CNT-###` (mono chip); `PENDING REVIEW` chip (warn) when in review. Top-right = circular **select button** (✓ when selected; ember fill).
- **Body:** creator row = colored avatar (initial) + `Creator X` + `CRT-…92` (mono, right); **title** (600); meta = `N foto's · N video's · 24u toegang`; buy row = **price** `◈ 250` (gold mono) + **Rent 24u** (ember) — or disabled "In review…" when pending.
- **Interactions:** tap media or select button → toggle selection → cart bar appears; "Rent 24u" → immediate single rent; pending items can't be selected/rented.

### 4.2 My Rentals (`renderRentals`)
Temporary library. Per **rental card**: thumb, title, `Creator X · CNT-###`, `purchased → expires` clock (mono), and either:
- **Active:** live timer `◷ HH:MM:SS resterend` (teal; turns **bad/red < 1h**) + `▸ demo: expire now`.
- **Expired:** blurred-grayscale thumb, opacity .6, `🔒 Toegang verlopen`.

Empty state (clock icon + "Nog niets gehuurd"). Header shows active count; nav badge mirrors it. **Timers are display-only** — code comment explicitly notes `purchased_at` is set server-side in production and access is backend-decided.

### 4.3 Wallet (`renderWallet`)
- **Balance card** (ember gradient): `USR-4471` label, big Fraunces token count + "tokens", `≈ €X · 100 tokens = €1`.
- **Token packages** (3-up grid): `◈500/€5`, `◈1000/€10`, `◈2500/€25` (gold), tap to buy (→ ledger credit).
- **Ledger** ("onveranderlijk / immutable"): rows = description + mono sub-detail + signed amount (credit green `--ok`, debit ink). Rent rows already show the split: *"Creator X +200 · platform +50"* — i.e. **80/20**, matching the locked 20% commission.

### 4.4 Drop (`renderDrop`) — creator post
- Intro: "Content gaat eerst naar moderatie."
- **Gallery picker** (4-col grid, tap to ✓ select; two preselected).
- Fields: **Titel**, **Beschrijving**, **Prijs (tokens)** (number, min 10), **Duur** = "24 uur" (disabled/fixed).
- **Post naar Box** (ember block) → toast `Gepost → PROCESSING → PENDING REVIEW`, card appears in feed with PENDING badge → (prototype simulates) `✓ CNT-### goedgekeurd door moderatie`.
- Note: "Standaard blurred & niet-gepubliceerd tot screening klaar is."

---

## 5. Interaction / state model (mock → production mapping)

Prototype `state`: `{ tab, tokens, selected{}, content[], rentals[], ledger[] }`.

| Entity (prototype) | Fields | Maps to (architecture doc) |
|---|---|---|
| `content` item | `id CNT-, creator, title, photos, videos, price, grad, status(approved/pending)` | `content_items` + `content_files`; `grad`→ real blur/thumb; `status`→ moderation_status |
| `rental` | `id RNT-, contentId, creator, title, grad, purchasedAt, expiresAt, expired` | `rentals` table (`purchased_at`/`expires_at`/`status`) — §7 rental engine |
| `ledger` entry | `d desc, t detail, a amount(±)` | `ledger_entries` (immutable, idempotent) — §6 wallet |
| `tokens` | integer balance | `wallets.balance_tokens` (cache; ledger is truth) |

**Core action `rentItems(ids)`** (prototype): sum prices → check `total ≤ tokens` → deduct → push ledger (with 80/20 split) → create rentals with `purchasedAt=now, expiresAt=now+24h` → badge → go to Rentals. **Production:** this becomes `POST /rentals` / `POST /rentals/cart` — one atomic server transaction (balance check + rentals insert + user debit + creator/platform credit), idempotency-keyed, backend sets timestamps. `RENT_SECONDS = 24*3600`.

### What changes for production (do NOT ship the mock behaviors)
1. **Blur is real, server-side.** Prototype blurs a gradient with CSS. Production serves a **separate blurred preview file**; the original is never sent to the browser until a rental is valid (signed URL on demand). §8.
2. **Timers are cosmetic.** Access is decided by the backend on every media request (`now < expires_at AND status=active`) + pg_cron sweep. §7.
3. **Moderation is real.** The `setTimeout` auto-approve becomes CSAM hash-scan → AI screen → human review; KYC-before-publish gate. §9.
4. **Wallet mutations server-only.** No client-side balance math in production — service-role routes + immutable ledger. §6/§10.
5. **Video in MVP.** Drop is images-only in the prototype; production adds video upload + signed playback (Cloudflare Stream/Mux), still shown blurred pre-rental. Phase 2.
6. **IDs/PII.** Keep the mono `USR-/CRT-/CNT-/BOX-/RNT-` identifiers as the only public identifiers; never surface phone numbers (privacy-by-design).

---

## 6. Production tech mapping
- Rebuild these screens as **Next.js (App Router) + TypeScript** components (per stack decision), preserving the exact tokens/typography/layout above. The prototype is framework-agnostic HTML/CSS/JS — port the CSS variables into the app's global stylesheet 1:1 and the components into React.
- Screen ↔ route sketch: Discover `/box/[code]`, My Rentals `/rentals`, Drop `/drop`, Wallet `/wallet` (+ auth/onboarding, box-admin, and `/admin` moderation console from the architecture doc, which the prototype doesn't cover yet).
- Theme-aware already (light/dark parity) — carry the `prefers-color-scheme` + `[data-theme]` structure into production.

## 7. Not yet in the prototype (still to design)
Auth / phone-OTP / invitation-accept screens · Box Admin dashboard · Platform Moderation Console · Creator KYC flow · payout request UI · consent checkbox on Drop. These come from `content-box-architecture.md` §4 and need design in the same system before their phases.

---
*Prototype reference: Artifact `1b69c5da-0515-40b6-b5d2-6b45739cf8ee`. If it's updated, re-read and reconcile this doc.*
