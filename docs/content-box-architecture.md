# Content Box — Architecture Package (v1, pre-approval)

> Deliverable for master-prompt section 33. **No application code** — architecture only. Read alongside `content-box-concept.md`.
> Status 2026-08-22: **awaiting user approval before Phase 1.** Every section states the choice + why.

---

## 1. System architecture

### Shape
A **modular monolith** (single Next.js app on Vercel, backed by Supabase) with clearly separated internal domains, not microservices.

```
                 ┌──────────────────────────────────────────────┐
   Creator ─────▶│  Next.js (Vercel)  App Router                 │
   User    ─────▶│  ── public feed, box, wallet, rentals (SSR)   │
   Box Admin ───▶│  ── /api route handlers (server-only)         │
   Platform ────▶│  ── /admin moderation console                 │
                 └───────┬───────────────┬───────────────┬───────┘
                         │               │               │
              ┌──────────▼───┐   ┌───────▼────────┐  ┌───▼────────────┐
              │  Supabase    │   │ Background jobs │  │ External APIs  │
              │  Postgres+RLS│   │ (pg_cron +      │  │ Twilio / KYC / │
              │  Auth,Storage│   │  Edge Functions)│  │ CSAM / AI mod /│
              │              │   │                 │  │ Verotel/Paxum  │
              └──────────────┘   └─────────────────┘  └────────────────┘
```

### Internal domains (folders/modules, one bounded context each)
`auth` · `boxes` · `invitations` · `content` (upload/processing) · `feed` · `rentals` · `wallet` (ledger) · `payouts` · `moderation` · `trust-safety` (KYC/CSAM/AI) · `audit` · `admin`.

### Why this shape
- **Monolith, not microservices:** one small team, one deploy, transactional consistency across wallet↔rental↔content in a single Postgres. Microservices would add distributed-transaction pain (double-spend risk on the ledger) for zero benefit at MVP scale.
- **Reuse the SX stack (Vercel + Supabase + Resend):** proven in production here, no new ops burden, and it already gives private storage + signed URLs + pg_cron — three hard requirements for free.
- **Server-authoritative everything:** all money, access, and moderation decisions happen in `/api` route handlers or Edge Functions with the service-role key. The browser never decides access or balance. (Matches the SX critical patterns.)
- **Separate `/admin` surface:** moderation console is a physically separate route tree with its own authorization gate and audit logging, so operator power can't leak into user-facing code paths.

### Separate project from SX
Content Box is a **standalone Supabase project + standalone Vercel project** (its own domain, content24market.space), NOT tables inside the SX database. Rationale: different compliance boundary (UGC adult vs. listings), different processors, clean data-handling separation, and the concept requires it to run without SX. SX integration (later) is an **outbound API link**, not shared tables.

---

## 2. Database (ERD / description)

Postgres. All monetary values stored as **integer token counts** (never floats). All IDs are UUID PKs; human-facing codes (`USR-`, `CRT-`, `BOX-`, `CNT-`) are a separate generated column.

### Core entities
```
profiles (1)───(∞) box_members ─────(∞)───(1) boxes
   │                                          │
   │                                          └──(∞) content_items ──(∞) content_files
   │                                                     │
   └──(1)──(1) wallets ──(∞) ledger_entries              │
   │                                                     │
   └──(∞) rentals ──────────────────────────────────────┘
   │
   └──(1)──(1) kyc_verifications
invitations, moderation_events, audit_log, payout_requests, token_orders (satellites)
```

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | id (=auth.uid), public_code `USR-/CRT-`, role, phone (encrypted), status | 1:1 with Supabase auth user. Phone never exposed to non-platform roles. |
| `boxes` | id, public_code `BOX-`, name, status, commission_bps | `commission_bps` = platform cut in basis points (configurable per box). |
| `box_members` | box_id, profile_id, role (`box_admin`/`creator`/`user`), status | Join table = who's in which box and as what. A person can be creator in one box, user in another. |
| `invitations` | id, box_id, inviter_id, target_phone (hashed), role, token (hashed), expires_at, used_at, revoked_at | Single-use, time-boxed, revocable. Store only a **hash** of the token. |
| `content_items` | id, public_code `CNT-`, box_id, creator_id, title, description, price_tokens, duration_hours (default 24), moderation_status, published_at | The sellable unit. |
| `content_files` | id, content_item_id, kind (image/video), storage_path (private), blur_path, thumb_path, checksum, csam_scan_status | Individual media. Original stays private forever. |
| `rentals` | id, user_id, content_item_id, price_tokens, purchased_at, expires_at, status (`active`/`expired`/`refunded`) | **The heart.** Per-row timer. Backend checks `now() < expires_at AND status='active'`. |
| `wallets` | id, owner_id, kind (`user`/`creator`), balance_tokens, pending_tokens, lifetime_tokens | Balance is a cache; ledger is the source of truth (see §6). |
| `ledger_entries` | id, wallet_id, delta_tokens, reason, ref_type, ref_id, balance_after, created_at, idempotency_key | **Append-only, immutable.** Every movement. |
| `token_orders` | id, user_id, provider, provider_ref, tokens, fiat_amount, status | Token purchases (Verotel/crypto). |
| `payout_requests` | id, creator_id, amount_tokens, fiat_amount, provider (Paxum), status, requested_at | Gated at €50 available. |
| `kyc_verifications` | id, profile_id, provider, provider_ref, status, verified_at, consent_given, consent_at | Card-network mandate. Creator can't publish until `status='verified'`. |
| `moderation_events` | id, content_item_id, actor_id, action, from_status, to_status, reason, created_at | Every review action. |
| `audit_log` | id, actor_id, action, target_type, target_id, reason, result, created_at | All sensitive/staff actions (append-only). |

### Why
- **Ledger + cached balance** (not balance-only): auditable, reconcilable, refund/chargeback-safe. Matches your SX rule "never a naive frontend balance."
- **`rentals` as its own table with per-row `expires_at`:** the concept's non-negotiable — no shared box timer. Indexed on `(user_id, status, expires_at)` for the library and on `expires_at WHERE status='active'` for the expiry sweep.
- **`content_files` split from `content_items`:** one sellable item = many photos/videos, each independently CSAM-scanned and blur-processed.
- **Hashed invitation tokens & hashed/encrypted phones:** phone is auth-only, never a public identifier (privacy-by-design).

---

## 3. User roles

| Role | Scope | Can | Cannot |
|---|---|---|---|
| **Platform Operator** | Global | Everything: view phones/identities/originals (audit-logged), moderate, block, refund, manage boxes | — (but every sensitive read/write is logged) |
| **Box Admin** | One box | Invite/suspend creators, box settings, see content status + operational metrics | See users'/creators' phones or private PII; see platform-wide data |
| **Creator** | Boxes they're in | Upload, price, publish (post-KYC), see own sales/wallet, request payout | See any phone numbers; see other creators' earnings; moderate |
| **User** | Boxes they're in | Browse feed, blurred previews, buy tokens, rent, view own rental library | See any phone numbers; see originals without an active rental; see other users |

Enforced at **three layers**: Postgres RLS (row visibility), API route authorization (action gate), and UI (affordance hiding — cosmetic only). RLS is the real boundary.

### Why
Least privilege + privacy-by-design. Box Admin deliberately does **not** inherit platform PII access — the concept is explicit that Box Admin ≠ platform operator. Role is contextual (`box_members.role`), not global, so the same person can be a creator in one box and a user in another.

---

## 4. Screens

**Auth / onboarding:** Landing · Enter phone · OTP verify · Accept invitation · Role activation.
**User:** Box feed (blurred grid) · Content detail (blurred + rent CTA) · Rental cart · Buy tokens · Wallet/ledger · **My Rentals** (per-item countdown) · Unlocked content viewer.
**Creator:** Creator dashboard · **Drop Content** (mobile picker / desktop drag-drop) · Content detail + moderation status · Sales · Creator wallet (pending/available/lifetime) · Request payout · KYC/verification flow.
**Box Admin:** Box dashboard (creators, users, content, rentals today, revenue today) · Manage creators (invite/suspend) · Box settings · Content status list.
**Platform / Moderation Console (`/admin`):** Moderation queue (PENDING_REVIEW) · Content review (view original if authorized) · Creator/user management · Reports triage · Audit log viewer · KYC review.

Mobile-first throughout (concept requirement). User happy path = **Open box → see blurred → select → rent → unlocked**, ≤ 4 taps.

### Why
Screen list maps 1:1 to the MVP scope in the concept. The **DROP → DISCOVER → RENT → EXPIRE** loop drives the two hero screens (Drop Content, Box feed) — those get the most design investment; admin screens are functional/dense.

---

## 5. API architecture

REST-style route handlers under `/api`, all server-only, all returning the backend as the single source of truth. Grouped by domain:

| Group | Endpoints (illustrative) |
|---|---|
| auth | `POST /auth/phone/start`, `POST /auth/phone/verify`, `POST /auth/logout` |
| invitations | `POST /invitations` (create), `POST /invitations/accept`, `POST /invitations/revoke` |
| boxes | `POST /boxes`, `GET /boxes/:id`, `PATCH /boxes/:id`, `GET /boxes/:id/dashboard` |
| content | `POST /content` (create+get upload URL), `POST /content/:id/finalize`, `PATCH /content/:id`, `POST /content/:id/publish` |
| feed | `GET /boxes/:id/feed` (blurred previews only) |
| rentals | `POST /rentals` (single), `POST /rentals/cart` (multi, one wallet check), `GET /rentals/mine`, `GET /rentals/:id/access` (issues short-lived signed URL if valid) |
| wallet | `GET /wallet`, `GET /wallet/ledger`, `POST /tokens/order` (→ Verotel/crypto), `POST /webhooks/verotel`, `POST /webhooks/nowpayments` |
| payouts | `POST /payouts/request`, `GET /payouts/mine` |
| moderation | `GET /admin/moderation/queue`, `POST /admin/moderation/:id/decision`, `GET /admin/content/:id/original` (authorized+audited) |
| reports | `POST /reports`, `GET /admin/reports` |

### Cross-cutting rules
- **Idempotency keys** on all money-moving POSTs (`/rentals`, `/tokens/order`, webhooks, `/payouts`).
- **Webhook signature verification** before any wallet mutation (learned from SX Verotel integration).
- **Rate limiting** on auth, invitations, uploads.
- Access to originals only via **short-lived signed URLs minted server-side** after a rental/authorization check — never a stored public URL.

### Why
Matches SX's proven `/api` + webhook pattern. Idempotency + signed webhooks are the two things that prevent double-crediting and replay — the highest-risk failure modes for a token economy.

---

## 6. Wallet architecture

**Double-entry-inspired, ledger-first.**

- `wallets.balance_tokens` is a **cache**; `ledger_entries` is the truth. Balance is recomputed/verified from the ledger.
- Every mutation = one **append-only** ledger row with `delta`, `reason`, `ref`, `balance_after`, and an **idempotency_key** (unique index → duplicate webhook or double-click is a no-op).
- A **rental purchase is one DB transaction**: check balance → insert `rentals` row → debit user ledger → credit creator ledger (net of commission) → credit platform. All-or-nothing.
- Commission from `boxes.commission_bps` (configurable). Example at 20%: user −250, creator +200, platform +50.
- Creator wallet tracks **pending → available → withdrawn** (hold window for refund/chargeback protection before funds become withdrawable).

```
Token purchase:  user_wallet  +1000   (reason=purchase, ref=token_order)
Rental CNT-001:  user_wallet  -250    (ref=rental)   ─┐ one
                 creator_wallet +200  (pending)        ├ atomic
                 platform_wallet +50                  ─┘ tx
```

### Why
- Immutable ledger + idempotency = the SX rule and the only safe way to handle money you'll later reconcile against Verotel/Paxum statements.
- Integer tokens avoid float rounding.
- Pending/available split is required for the €50 payout gate and for clawing back on chargebacks without going negative.

---

## 7. Rental engine architecture

- **Purchase** writes `rentals(purchased_at=now, expires_at=now + interval '24h', status='active')` inside the wallet transaction.
- **Access check is always server-side:** `GET /rentals/:id/access` returns a fresh short-lived signed media URL **only if** `status='active' AND now() < expires_at`. Frontend countdown is display-only and never gates access.
- **Expiry** handled two ways (defense in depth):
  1. **Lazy:** every access check re-validates `expires_at`; an expired rental is denied even if the sweep hasn't run.
  2. **Scheduled sweep:** `pg_cron` job flips `status='active'→'expired'` past `expires_at` and revokes any cached access. (Same pattern as SX tier auto-expire.)
- **Rental cart:** collect selected items → **single** wallet balance check → create all rentals in one transaction (partial failure rolls back all).
- **Master vs. access separation:** expiry revokes *access*, never deletes the creator's master file (retention policy governs deletion).

### Why
Backend-authoritative + lazy check means access is correct **even if cron is late or fails** — the timer can never be bypassed by a stale frontend or a paused job. This is the concept's single most important correctness property.

---

## 8. Media storage architecture

```
Upload ──▶ client uploads DIRECT to private bucket (signed upload URL)
        ──▶ /content/:id/finalize  (server records path, checksum)
        ──▶ background pipeline:  validate ▸ CSAM hash-scan ▸ AI screen
                                  ▸ generate thumbnail ▸ generate BLUR preview
                                  ▸ set moderation_status
        ──▶ APPROVED  ──▶ appears in feed (blurred)
Viewing ──▶ rental valid?  ──▶ server mints short-lived signed URL to original
```

- **Private buckets only.** No public URLs, ever. Originals reachable solely via short-lived signed URLs after an access check.
- **Direct-to-storage upload** (client → Supabase Storage with a signed upload URL), bypassing the Vercel 4.5 MB body limit — the exact fix already learned in SX.
- **Blur preview + thumbnail generated server-side** and stored as separate derived files; the feed only ever serves blur/thumb.
- **Video (in MVP, Phase 2):** route to **Cloudflare Stream / Mux** for transcode + signed playback (no permanent URL). Video files never hit Supabase Storage as originals — they go straight to the streaming provider, which mints short-lived signed playback tokens after a rental check.
- Checksums for dedup + tamper detection; CSAM scan status stored per file. **Video is CSAM/AI-screened too** (Hive/Rekognition support video) before it's viewable.

### Why
Private-by-default + signed-URL-on-demand is the only model that satisfies "user never gets a permanent public URL." Direct upload avoids the 413 that bit SX. Video is in the MVP per your decision; its signed-playback complexity is isolated to the streaming provider so it doesn't leak into the rest of the stack.

---

## 9. Trust & Safety architecture

**Pipeline (every upload, before it's ever viewable):**
```
Upload → CSAM hash-match (Cloudflare CSAM tool / PhotoDNA)
       → AI screen (Hive / Rekognition image+video; Anthropic for text)
       → risk routing:
            LOW risk       → (optional) APPROVED
            UNCERTAIN      → PENDING_REVIEW  (human)
            HIGH risk / CSAM hit → BLOCKED + escalation
```
- **Moderation statuses:** `DRAFT → PROCESSING → PENDING_REVIEW → APPROVED / REJECTED / SUSPENDED / DELETED`.
- **AI is never the final safety authority** — it routes; humans decide the uncertain/high cases (concept requirement).
- **Creator KYC gate:** no publish until `kyc_verifications.status='verified'` (gov-ID + liveness via Veriff/Onfido). Enforced by a RESTRICTIVE RLS policy (same technique as SX verification gate), not just UI.
- **Consent + creator agreement records** stored (card-network mandate: written consent from everyone depicted; written agreement per creator).
- **7-business-day takedown** workflow for illegal/nonconsensual reports (card-network mandate).
- **Moderation Console** shows creator/content records and (if authorized) the original file; actions Approve/Reject/Suspend/Delete/Restrict/Request-more-verification, each writing `moderation_events` + `audit_log`.

### Why
Directly implements the concept's T&S section **and** the verified Visa/Mastercard 2026 UGC rules (from the Providers research). CSAM scanning and KYC-before-publish are legal/network mandates, so they're gating for Phase 1, not later polish.

---

## 10. Security architecture

- **AuthN:** phone + SMS OTP (Twilio Verify) via Supabase Auth. Single-use, hashed, expiring invitation tokens.
- **AuthZ:** Postgres **RLS as the real boundary** on every table; API route guards; service-role key used only server-side with `{autoRefreshToken:false, persistSession:false}` (SX pattern). Wallet mutations **only** via service-role routes — authenticated browser role has no INSERT/UPDATE on wallets/ledger.
- **PII protection:** phone encrypted/hashed; never exposed cross-role; internal codes (`USR-`/`CRT-`/…) as public identifiers.
- **Money integrity:** idempotency keys, signed webhooks, atomic transactions, append-only ledger.
- **Media:** private buckets, short-lived signed URLs, server-side access checks, upload validation + size caps.
- **Auditability:** append-only `audit_log` for every sensitive staff action and every original-file view.
- **Operational:** rate limiting (auth/invite/upload), secrets in env vars only, CSP, backups + PITR (Supabase), least-privilege service accounts.
- **Data-handling policy:** PII stays in the Content Box Supabase project; external connectors get aggregate/ops data only (mirrors SX `docs/data-handling-policy.md`).

### Why
Every item is either a concept requirement, a verified compliance mandate, or a hard-won SX lesson (RLS-as-boundary, service-role hardening, signed webhooks, direct upload). Defense in depth: UI hides, API guards, **RLS enforces**.

---

## 11. MVP roadmap (phased — build one phase, test, security-check, report, then next)

| Phase | Delivers | Exit criteria |
|---|---|---|
| **0. Foundations** | New Supabase + Vercel project, schema + RLS, auth (phone/OTP), roles, audit log skeleton | A user can sign up via OTP; RLS blocks cross-role reads |
| **1. Boxes & invitations** | Create box, box admin, single-use SMS invitations (creator + user), join flow | Admin invites a creator who joins via SMS link |
| **2. Creator upload + T&S gate (images + video)** | Direct upload for photos **and video** (Cloudflare Stream/Mux transcode + signed playback), processing pipeline, **CSAM scan + AI screen + KYC-before-publish**, blur/thumb, moderation statuses | Unverified creator cannot publish; CSAM/HIGH content is blocked; approved image+video shows blurred; video has no permanent URL |
| **3. Wallet + token purchase** | Ledger, user wallet, **Verotel** token purchase + webhook, idempotency, **VAT-at-redemption accounting hooks** | User buys tokens; balance = ledger; duplicate webhook is a no-op; VAT captured on rental |
| **4. Rental engine** | Single + cart rental, per-item 24h timer, My Rentals, lazy check + pg_cron sweep, signed-URL access | Rented content unlocks; access denied at expiry even if cron is late |
| **5. Creator earnings + payouts** | Creator wallet (pending/available/lifetime), commission split (20% baseline), **€50 Paxum payout** request | Rental credits creator net of commission; payout blocked under €50 |
| **6. Moderation console + reports** | Admin queue, decisions, reports triage, audit viewer, 7-day takedown | Operator reviews original (audited), approves/rejects; report → takedown works |
| **7. Hardening + launch** | Rate limits, monitoring, backups/DR test, security review, load check, **OSS/VAT + DAC7 reporting export** | Security review passes; DR restore verified; VAT + creator-earnings reports exportable |
| **Later (not MVP)** | Crypto rail (NOWPayments), SX integration, chat/social/likes | — |

### Why
Ordered by dependency and risk: T&S/KYC lands **before** any content is buyable (Phase 2 before 3–4), so we never have unmoderated content or an unverified creator earning money. **Video is in the MVP (Phase 2)** per your decision — the signed-playback provider is isolated so it doesn't leak complexity into other phases. Money phases (3–5) come as a block so the ledger is proven before payouts.

---

## 12. Tech stack proposal

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Same as SX — reuse expertise; SSR for feed/SEO; route handlers for server-authoritative APIs. (Fresh project → can start on Next 14/15; note SX's Next 13.5 cookie quirks don't carry over.) |
| Hosting | **Vercel** | Existing stack; domain already pointed; auto-deploy. |
| DB / Auth / Storage / cron | **Supabase (dedicated project)** | Postgres for the ledger, RLS for authz, private Storage + signed URLs, pg_cron for expiry — four requirements, one vendor. |
| SMS/OTP | **Twilio Verify** | Turnkey OTP + fraud throttling. |
| KYC | **Veriff or Onfido** | Gov-ID + liveness (card-network mandate). |
| CSAM | **Cloudflare CSAM tool (free)** + PhotoDNA/Thorn | Legal mandate. |
| AI moderation | **Hive** (media) + **Anthropic API** (text) | Screening; humans decide. |
| Video (**in MVP, Phase 2**) | **Cloudflare Stream** or **Mux** | Signed playback, no public URL. In MVP per user decision. |
| Payments in | **Verotel FlexPay** first; **CCBill + Segpay applications in parallel** (+ NOWPayments crypto backup later) | Verified to accept token/prepaid-credit adult-content model; parallel apps for redundancy/leverage per user decision. |
| Payouts | **Paxum** (+ crypto) | Verified adult-creator payout rail; mainstream rails prohibit adult. |
| Email | **Resend** | Existing. |
| Monitoring | **Sentry** + Vercel analytics | Money/mod flows need alerting. |

### Why
Maximum reuse of the SX stack (lowest ops risk, fastest to ship) plus the specialized adult-compliant providers the Providers research verified. No exotic tech — the risk in this product is compliance and money-correctness, not the framework.

---

## 13. Tax, VAT & fee economics
> Researched/verified 2026-08-22. **Not tax advice** — the platform must engage a Belgian accountant experienced in digital/adult + cross-border VAT before launch. This is gating, non-code. "What the source said" vs "our interpretation" separated per the accuracy rule.

### VAT — the platform is likely the "deemed supplier"
*Source (CJEU C-695/20 Fenix/OnlyFans, 2023 + Art. 9a Reg. 282/2011):* where a platform authorises the supply, sets the T&Cs, and invoices the end user, the **platform is the deemed supplier of the electronically supplied service**, and **VAT liability extends to the total consideration paid by the user, not just the retained commission.**
*Interpretation:* Content Box (we set terms, authorise publishing, invoice users) is almost certainly the deemed supplier → **Content Box charges and remits VAT on the full rental price.** Register for **VAT OSS in Belgium** to remit each EU country's rate via one return.

### Tokens = multi-purpose vouchers → VAT at redemption
*Source (EU Voucher Directive 2016/1065, in force 2019):* a **multi-purpose voucher** (VAT regime unknown at issue — usable across creators/prices/countries) is **not subject to VAT on transfer; VAT is due only on redemption** of the actual service.
*Interpretation:* our tokens are MPVs → **selling tokens is not a VAT event; VAT accrues when content is rented.** Ledger must capture VAT at the rental, by the buyer's country rate. (Design hook added to Phase 3.)

### VAT rate = buyer's country (destination)
Belgian buyer 21%; other EU buyers their local rate (17–27%); non-EU different rules. OSS handles remittance.

### Creator income tax + DAC7 reporting
- Creators are independent contractors: **platform pays net share, does NOT withhold** their income tax. Each creator declares income in their own country.
- *Source (DAC7 / Dir. (EU) 2021/514, enforced in Belgium 2026; FPS Finance DPI-DAC7):* platforms must run due diligence and **report reportable sellers'** identity + income to tax authorities (EU threshold €2,000 or 30 transactions/yr).
- *Interpretation / open nuance:* DAC7's "relevant activities" are goods/immovable-property/transport/**personal services**. Whether selling one's **own pre-made content** is a "personal service" is genuinely debatable (custom-request content is more clearly in scope than passive sales) — **the accountant must confirm scope.** Regardless, **collect creator tax IDs + address at KYC** (near-zero cost, needed for DAC7 and/or the creator agreement).

### Fee waterfall & the commission-base decision
Illustrative only (Belgian user, 21% VAT, 250-token / €2.50 rental):

| Step | Amount |
|---|---|
| User pays (VAT-inclusive) | €2.50 |
| − VAT 21% (remitted via OSS) | −€0.43 → **€2.07 net** |
| − Payment processing (Verotel ~13–14% + 10% rolling reserve) | ~−€0.35 |
| **Pool to split** | **~€1.72** |
| Creator / platform split (base = **decision below**) | — |

**Unresolved design decision — what base does the 20% apply to?**
- (a) 20% of **net-of-VAT**, processing fees **shared or passed to creator** → platform keeps a viable margin.
- (b) Creator 80% of **gross**, platform absorbs VAT + fees from its 20% → platform nets **~6% or less** after Verotel — likely **too thin** to cover CSAM/KYC/AI-mod/hosting/support.
- (c) Fees off the top **before** split (recommended to model first); or route volume to crypto (much lower fees) to protect margin.

*Recommendation:* treat **20% as the platform floor**, take **processing fees off the top before the split**, and run a proper unit-economics model with the accountant before committing pricing. Commission is stored per-box in `boxes.commission_bps` so it's configurable.

### Belgium corporate tax
Platform profit subject to **Belgian corporate income tax (~25%)** — normal, budget for it.

### Sources
- Deemed supplier / OnlyFans: https://www.bdo.global/en-gb/insights/tax/indirect-tax/european-union-cjeu-holds-online-platform-operator-liable-for-vat-collected-from-customers · https://vatabout.com/cjeu-clarifies-vat-liability-of-digital-platforms-fenix-international-onlyfans-case-analysis
- Voucher VAT (SPV vs MPV): https://cms.law/en/int/publication/vat-entry-in-force-of-the-directive-regarding-the-treatment-of-vouchers-for-vat-purposes · https://www.grantthornton.nl/en/insights-en/topics/tax/vat/ecj-clarifies-vat-rules-applicable-to-vouchers/
- DAC7 (Belgium): https://finance.belgium.be/en/E-services/dac7 · https://www.ey.com/en_be/technical/financial-services/financial-services-alerts/belgian-tax-administration-publishes-dac7-guidelines

---

## Decisions locked (2026-08-22)
1. **Infra:** standalone Supabase + Vercel project (not shared with SX). ✓
2. **Video:** **in the MVP** (Phase 2), via Cloudflare Stream/Mux signed playback. ✓
3. **Processors:** **Verotel first, CCBill + Segpay applications in parallel**; crypto (NOWPayments) later. ✓
4. **Commission:** **20% baseline**, per-box configurable — *but* treat as platform floor and finalise the fee/VAT waterfall & commission base with the accountant. ✓ (with follow-up)

## Still open (before/around Phase 1 — mostly non-code, gating)
- **Next.js version** for the fresh project (recommend latest stable, not 13.5).
- **Tax/VAT engagement:** appoint a Belgian accountant (digital/adult, cross-border VAT + OSS + DAC7). Confirm deemed-supplier stance, MPV treatment, DAC7 scope, and the commission/fee waterfall & base.
- **Legal:** creator agreement template + consent-record model (card-network mandate), token/voucher terms, payout/money-transmission review.
- **Commission base** final call (options a/b/c in §13) once unit economics are modelled.

**Next step:** on your approval, begin **Phase 0 — Foundations**, following the phased build rule (analyze → show plan → build → test → security → report → stop). The tax/legal items are gating for launch but do **not** block Phase 0–2 engineering (schema, auth, boxes, upload, T&S) — we can build those in parallel with the accountant/lawyer conversations, and wire the exact VAT/commission math in Phase 3.
