# Content Box — Concept & Status

> Working memory for the **Content Box** platform. Read at the start of any Content Box session.
> Status as of 2026-08-22: **architecture/spec phase — NO code written yet.** Awaiting user approval of architecture before Phase 1.

## What it is (one line)
A **Temporary Multi-Creator Content Marketplace**: creators drop content into a shared, private "Content Box"; users browse one central feed, pay **Tokens** to **rent individual content for 24 hours**, then access **auto-expires**.

Product loop: **DROP → DISCOVER → RENT → EXPIRE.** Mobile-first. It is *not* Dropbox and *not* a per-creator subscription platform.

## Relationship to Secret Xperience
- Standalone product. Must work fully **without** SX.
- Later (optional): a creator can connect their Content Box to their SX creator profile and upload to it from the SX dashboard. Creators with no SX account must still be able to use Content Box independently.
- Provisional name: "Content Box." Associated domain the user set up: **content24market.space** (see separate domain-setup task).

## Core concept
- A Box (e.g. **"AFRICAN GIRLS"**) has one or more Box Admins.
- Admin invites multiple **Creators**; each Creator can invite their own **Users**.
- Multiple creators publish into the same Box → users see **one central feed** (no per-creator profile hopping).
- To a User it feels like one marketplace; to a Creator it feels like a personal space inside a shared Box.

## Roles
1. **Platform Admin / Operator** — full control (accounts, phone numbers, identities, content, transactions, wallets, boxes, invitations, moderation, reports, audit logs). Needed for Trust & Safety, fraud, legal. **The platform is NOT anonymous.**
2. **Box Admin** — invites/removes/suspends creators, manages Box settings, sees content status + operational info. Does **not** automatically get users'/creators' private data.
3. **Creator** — accepts invite, activates via phone/SMS OTP, uploads photos/videos, sets title/description/token price, publishes, sees sales + Creator Wallet + available balance, requests payout at threshold.
4. **User / Content Buyer** — activates via phone/SMS OTP, opens Box, browses multi-creator feed, sees blurred previews, buys Tokens, rents content (one or many items across creators), has a temporary Rental Library with per-rental expiry.

## Privacy model — privacy-by-design, NOT platform anonymity
- Participants are **pseudonymous to each other**; the **platform has full moderation/admin control**.
- **No phone numbers** exposed between any participant pair (creator↔creator, creator↔user, user↔user). Box Admin sees only what the Box function needs.
- Phone numbers are **auth/verification + controlled platform admin only** — never a public identifier.
- Public identifiers are internal IDs: `USR-xxxxx`, `CRT-xxxxx`, `BOX-xxxxx`, `CNT-xxxxx`.
- All staff access to sensitive data / original files must be **audit-logged**.

## Phone/SMS activation & invitations
- Flow: Admin enters creator's phone → creator gets SMS invite with a **unique, temporary, single-use invitation token/link** → phone verify → SMS OTP → activate account → accept invite → linked to Box. Same pattern for Creator→User invites.
- Invitation links: unique, time-limited, bound to intended recipient, single-use, invalidated after use, revocable by platform.

## Content upload & processing
- Upload must be dead simple from phone/tablet (gallery picker) or computer (file select + drag-drop). Fields: Title, Description, Price (Tokens), Duration (24h), then Post.
- Pipeline: receive → validate → store securely (**private**) → generate thumbnail → generate **blurred preview** → store metadata → make available in feed.
- Original file stays **PRIVATE**. Users never get a permanent public storage URL. Use private storage + signed URLs + temporary access tokens + server-side authorization + secure streaming where needed.
- New content shows as **blurred preview** by default (creator, blurred image, title, N photos/videos, price, "RENT FOR 24H").

## Rental engine (the heart)
- User rents **24h access**, not permanent ownership. **Each rental has its own timer** — never a shared Box timer.
- Per-rental fields: `purchased_at`, `expires_at`, `status`. **Backend always decides access validity**; frontend countdown is visual only.
- Users can rent content from **multiple creators at once**; optional **Rental Cart** (select items → total tokens → one wallet check → activate all).
- **My Rentals** library shows each active rental + its own countdown. On expiry: access revoked, content hidden, status → `EXPIRED`, temporary access removed.
- **Storage rule:** distinguish **Creator Master Content** (private original, retained per retention policy) from **User Rental Access** (temporary, expires at 24h). Expiry revokes access; it does not necessarily delete the master file.

## Wallets & money (ledger-based, never a naive frontend balance)
- **User Wallet** — buy Tokens (e.g. €10 → 1,000 Tokens), spend on rentals. Every movement recorded in an **immutable transaction ledger** (e.g. `+1000 purchase`, `-250 Rental CNT-001`).
- **Creator Wallet** — on rental, platform splits revenue by **configurable commission** (example: user −250 → creator +200, platform +50). Track **Pending / Available / Lifetime** earnings.
- **Payout threshold:** creator can request payout only when **Available ≥ €50**. Distinguish pending vs available vs withdrawn (for refunds, chargebacks, fraud, accounting).
- **Payments:** Tokens bought via supported methods (bank/card/local/possibly crypto). Payment provider, crypto flow, and token model need separate **legal/compliance** analysis — do not treat Tokens as real currency without it.

## Trust & Safety (fundamental)
- Platform must verify who a creator is, which phone is linked, what content is uploaded, transactions, account linkages, reports.
- **Hard protection against:** minor/CSAM content, non-consensual content, illegal content, stolen content, impersonation, fraud, malware, prohibited files, anything against platform rules or law.
- AI can auto-screen but **must not be the sole final safety decision** — uncertain/high-risk goes to human review.
- **Moderation statuses:** `DRAFT`, `PROCESSING`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `SUSPENDED`, `DELETED`. Flow: upload → auto safety check → LOW=approve / UNCERTAIN=human review / HIGH=block.
- **Moderation Console** (separate, secured): view creator/content records, view original file if authorized; actions: Approve / Reject / Suspend / Delete / Restrict account / Request additional verification. Every sensitive action → Audit Log.
- **Audit Log** entries: actor ID, action, target ID, timestamp, reason (if needed), result.

## Box Admin dashboard
Metrics like creators, users, content count, rentals today, revenue today. Can invite/remove/suspend creators, manage Box settings, view content status + operational info. Platform-sensitive personal data stays under platform control.

## MVP scope
**In:** Auth (phone, SMS OTP, login/logout, roles) · Box (create, box admin, creator + user invitations) · Creator (join, upload, title/desc/price, publish) · User (join, browse feed, blurred previews, wallet, rent) · Rental (24h access, per-item expiry, rental library, auto revocation) · Wallet (user + creator wallets, ledger, platform commission, €50 payout threshold) · Moderation (content review, user/creator management, reports, audit logs).

**Out (not first MVP):** chat, social network, likes/comments, livestreaming, advanced recommendation AI, complex subscriptions, many box types, NFTs, extensive affiliate marketing, deep SX integration. Prove the core workflow first.

## Technical principles
Secure auth · role-based authorization · private media storage · signed URLs · server-side rental validation · immutable transaction ledger · idempotent financial transactions · audit logging · rate limiting · invitation-token security · upload validation · secure API · DB transactions · background/expiration jobs · monitoring · backups · disaster recovery. Production-ready & scalable.

## How to work on this (user's explicit rule)
Do **not** build the whole app at once. Work **in phases**. For each phase: analyze needs → review existing code → present proposed architecture → list files/tables/APIs added or changed → build only that phase → write tests → check security → check regressions → report what was actually built → only then move on. Never break existing functionality without explicit permission; no temporary hacks that create later financial/security problems.

## The pending first deliverable (section 33 of the master prompt) — NOT yet produced
Before any code, the user asked for an architecture package: (1) system architecture, (2) DB ERD/description, (3) all user roles, (4) all screens, (5) API architecture, (6) wallet architecture, (7) rental engine architecture, (8) media storage architecture, (9) Trust & Safety architecture, (10) security architecture, (11) MVP roadmap, (12) tech stack proposal — each with rationale. **Then wait for approval before Phase 1.**

## Providers (external services the platform needs)
> Researched & verified via web search 2026-08-22. Accuracy rule applied: "what the source said" is separated from "our interpretation." Processor policies change — re-verify directly with each vendor before signing.

### Core infrastructure (reuse SX stack)
| Function | Pick | Why |
|---|---|---|
| Hosting / compute | **Vercel** | Existing stack; Next.js-native; content24market.space already points here. |
| DB + Auth + Storage + cron | **Supabase** | Postgres (ledger), RLS (per-rental access), private buckets + signed URLs, pg_cron (24h expiry sweep) — four hard requirements in one vendor. |
| Transactional email | **Resend** | Already wired in SX (invites, receipts, payout notices). |
| Error/uptime monitoring | Sentry (or Vercel built-in) | Financial + moderation flows need alerting. |

### Platform-specific
| Function | Pick | Notes |
|---|---|---|
| SMS / OTP ⚠️ | **Twilio Verify** (alt: Bird/MessageBird, Vonage) | Phone activation + single-use invite tokens are core. Per-SMS cost + invite-spam is an attack surface — rate-limit hard. |
| Video transcode + signed playback | **Cloudflare Stream** (cheaper) or **Mux** (stronger signed-token control) | Needed so video never has a permanent public URL. Images can stay on Supabase Storage + signed URLs. Not MVP-blocking if launching images-first. |
| Object storage (later, at scale) | Cloudflare R2 / AWS S3 | Only if media volume outgrows Supabase; R2 has no egress fees. Not needed for MVP. |

### ⚠️ Trust & Safety — non-negotiable for this content type
| Function | Pick | Notes |
|---|---|---|
| CSAM detection | **Cloudflare CSAM Scanning Tool** (free), Thorn Safer, MS PhotoDNA | Legally mandatory. Hash-match every upload BEFORE it's viewable. |
| AI content moderation | **Hive** or **AWS Rekognition** (image/video); **Anthropic API** (text) | Auto-screen → route UNCERTAIN/HIGH to human review. AI never the sole final decision (per spec). |
| Creator age/ID verification (KYC) ⚠️ | **Veriff / Onfido / Persona / Yoti** | Gov-ID capture + liveness/selfie match for every uploader before first publish. This is a **card-network requirement**, not just best practice (see below). |

### ⚠️ Money — payments IN and payouts OUT (the make-or-break)

**Token purchase (money in) — VERIFIED:**
- **Verotel / CardBilling (FlexPay)** — *Source:* Verotel/CardBilling accepts online adult entertainment, digital-goods sellers, and **"cam sites and other token-based systems to sell pre-paid credit."** *Interpretation:* Content Box IS a token/prepaid-credit adult-content model, so **Verotel fits here** — unlike the escorts-only constraint that blocks the multi-vertical SX site. We already have a live Verotel integration (SX website #136440) to build on. *Cost (source):* Premium FlexPay ≈ **13–14% fees**, **10% rolling reserve (6 mo)**, €1,000/wk processing req or €25/mo minimum.
- **CCBill** — *Source:* "purpose-built for adult subscriptions, memberships, digital content, recurring billing." Prohibits extreme violence, incest, snuff, scat, mutilation, rape, and non-consensual/deepfake content. *Interpretation:* CCBill declined SX **escorts**, but a **content marketplace is squarely in its lane** — worth a parallel application. (Do NOT reuse the "CCBill = dead end" conclusion from SX; that was escort-specific.)
- **Segpay** — *Source:* adult/cam/fan/dating processor; 24–72h approval post-KYC; weekly payouts. UGC merchants must submit a **detailed UGC procedure doc** (age/ID verification, pre-publish content review, real-time monitoring, anti-trafficking). *Interpretation:* viable alternative to Verotel/CCBill; the required UGC procedure doc aligns with what we're building anyway.
- **Crypto (backup rail)** — **NOWPayments**. *Source:* legal adult content permitted (porn/cam/studios), 350+ coins, no mandatory verification; **BUT explicitly NO prostitution/escort services and no US residents.** *Interpretation:* good decline-proof backup for token purchase; the escort exclusion doesn't affect Content Box (it's content, not escort booking), but keep US users off crypto or geofence.

**Creator payouts (money out) — VERIFIED, this is the harder half:**
- **Paxum** — *Source:* specialized adult-content payout provider; 100+ countries, instant Paxum-to-Paxum, bulk payouts to performers, no signup/monthly/minimum-balance fees; faster + cheaper than international wire. *Interpretation:* **this solves the payout problem** — mainstream rails (Stripe Connect, PayPal, Wise) prohibit adult, so Paxum (or Cosmo Payment / crypto payout) is the realistic €50-threshold payout rail. Likely primary.
- Alternatives: Verotel/CCBill/Segpay in-house pay-to-model programs, SEPA bank transfer, crypto payout.
- **Still needs its own legal/compliance analysis before building** (money-transmission questions; tokens ≠ real currency without legal review).

### ⚠️ Card-network compliance driver (Visa/Mastercard, 2026) — shapes the whole architecture
This is a **requirement from Visa/Mastercard for UGC adult platforms**, not optional (any card processor we use enforces it):
- **Every uploader** verified 18+ with **gov ID + liveness/selfie** BEFORE first publish (self-declaration not accepted in UK/FR/DE/IT).
- **All content reviewed BEFORE publication** (matches our PENDING_REVIEW → APPROVED flow).
- **Written consent** from everyone depicted in the content (uploaded, generated, or live).
- **Written agreement** with every content provider (creator) prohibiting illegal activity + requiring consent records.
- Process to **remove illegal/nonconsensual content within 7 business days**.
*Architecture impact:* KYC provider + pre-publish moderation + a consent-record/creator-agreement store are **gating**, not nice-to-haves.

### MVP minimum provider set
**Have:** Vercel + Supabase + Resend. **Add:** Twilio (SMS/OTP) · Cloudflare CSAM (free) · Hive or Rekognition (AI mod) · Veriff/Onfido (creator KYC) · Verotel (token purchase) · Paxum (payouts). Crypto (NOWPayments) as backup rail.

### De-risk FIRST, before any code (can kill the project)
1. **Payout rail** (Paxum acceptance + legal/money-transmission review)
2. **Creator age/ID verification** (card-network mandate)
3. **CSAM scanning** (legal mandate)
Payments-in and moderation are solvable; those three are gating.

### Sources
- Verotel/CardBilling: https://merchantmachine.co.uk/verotel/ · https://www.billing.creditcard/
- CCBill / adult processors overview: https://medium.com/coinmonks/adult-content-payment-processing-in-2026-how-creators-and-platforms-accept-card-payments-after-03a57a86f595 · https://tripleminds.co/blogs/compliance/nsfw-adult-payment-processor/
- Segpay UGC: https://segpay.com/verticals/high-risk/ · https://gethelp.segpay.com/docs/Content/ComplianceDocs/UserGeneratedContent.htm · https://automatehorizon.com/adult-creator-payment-processor-setup/
- Paxum payouts: https://www.paxum.com/case-studies/webcam-studios/ · https://onlygemsmanagement.com/blog/payout-methods-every-platform-compared-2026/
- NOWPayments crypto policy: https://makeanapplike.com/blogs/fintech/adult-content-businesses-and-nowpayments/ · https://nowpayments.io/all-solutions/adult
- Visa/Mastercard UGC rules & age verification: https://www.austreme.com/en/mastercard-new-rules-adult-content/ · https://mobiuspay.com/blog/mastercard-adult-content-rules · https://adent.io/blog/age-verification-for-onlyfans-like-platforms/

## Build progress
- **Phase 0 — Foundations ✅** (`content-box/`): Next.js 15 + TS scaffold, Supabase clients (browser/server/hardened admin), `0001_foundations.sql` (profiles, roles, append-only audit_log, RLS, privilege-escalation guard, auto-profile trigger), roles/audit/session helpers, design tokens ported from prototype. Validated vs real Postgres + typecheck + build.
- **Phase 1 — Auth + Admin fingerprint gate ✅** (`0002_auth_admin.sql` + app): phone-OTP login (`/login`); **admin allowlist seeded with +32477704740 & +32467685669** → auto `platform_admin` on login; **WebAuthn passkey (fingerprint)** register/authenticate; step-up cookie; `/admin` gated (404 for non-admins, fingerprint step-up required) with dashboard (role counts + audit log). Validated vs Postgres + typecheck + build + step-up unit tests. **Live WebAuthn needs post-deploy verification on the HTTPS domain + a real device.**
- **Phase 2 — Boxes & invitations ✅** (`0003_boxes_invitations.sql` + app): `boxes` (BOX- code, `commission_bps` default 2000=20%), `box_members` (per-box role), `invitations` (sha256-hashed, single-use, 7-day, revocable token, bound to recipient phone). API routes: create box (platform_admin), create/accept/inspect/revoke invitation. Admin dashboard gains a Boxes panel (create box + invite → one-time link). `/invite/[token]` accept flow (must log in with the invited phone). SMS delivery is logged for now (real SMS provider = later phase). Validated vs Postgres (lifecycle + RLS + constraints) + token-hash unit tests + typecheck + build.
- **Phase 3 — Creator upload + Trust & Safety gate ✅** (`0004_content_moderation.sql` + app): `content_items` (CNT- code, moderation-status enum), `content_files` (private original + blur/thumb + per-file csam/ai scan status), `kyc_verifications` (consent-required), `moderation_events`. **KYC-before-publish gate as a DB trigger** (blocks unverified creators AND non-members even on service-role inserts). **Fail-closed pipeline** (`lib/moderation/*`): CSAM + AI providers are pluggable; unconfigured/uncertain/error ⇒ human review, never auto-approve; only clear+low auto-approves. Image blur+thumbnail via sharp (`lib/media.ts`). API: KYC submit, admin KYC decision, content create, finalize (runs pipeline + best-effort derivatives), admin moderation decision. Admin dashboard gains **Moderation queue** + **KYC review** panels. Validated vs Postgres (gate + RLS + statuses), pipeline + sharp unit tests, typecheck, build.
- **Phase 4 — Wallet + token purchase ✅** (`0005_wallet.sql` + app): `wallets` (user/creator kinds, balance cache), **immutable idempotency-keyed `ledger_entries`**, `token_orders`. `apply_ledger()` DB function = the only way money moves (wallet row locked first → idempotent, no double-credit, rejects negative balance); `ensure_wallet()`. **VAT-at-redemption hook** built in (`vat_cents`/`vat_country` on ledger + apply_ledger args; tokens are MPV so NO VAT at purchase). Verotel FlexPay: signed `charge` (creates pending order → signed startorder URL; graceful `configured:false` when env missing) + `webhook` (verifies signature + shopID, credits wallet once via `verotel:{saleID}` idempotency key). `/wallet` page (balance card + packages + immutable ledger). `apply_ledger` execute revoked from authenticated (service-role only). Validated vs Postgres (idempotent credit, VAT record, insufficient-balance, immutability, RLS, exec-guard) + Verotel signature unit tests + typecheck + build.
- **Phase 5 — Rental engine ✅** (`0006_rentals.sql` + app): `rentals` (per-item `purchased_at`/`expires_at`/`status`, own timer), singleton **platform wallet** for commission. `purchase_rental()` = one atomic idempotent tx: debit buyer, credit creator (net of `commission_bps`, default 80%), credit platform (20%), **VAT-inclusive VAT recorded at redemption** (1 token = 1 eurocent). `purchase_cart()` = several items in ONE tx (all-or-nothing). Backend-authoritative access: `GET /api/rentals/[id]/access` mints short-lived signed URLs only while valid + **lazy expiry**; `expire_rentals()` sweep + secret-gated `/api/cron/expire`. `/rentals` page with per-item live countdown (teal→red <1h). `POST /api/rentals` (single/cart). Validated vs Postgres (80/20 split, VAT €0.43 on 250tok@21%, idempotent no-double, insufficient-balance rollback, cart atomicity, not-approved blocked, expiry, RLS) + typecheck + build.
- **Deferred to next phases:** payouts (roadmap Phase 5 — creator pending→available→withdrawn, €50 threshold, Paxum), full moderation console + reports (6), plus the creator Drop UI with **live signed-URL upload** (needs private Supabase buckets) and real CSAM/AI/KYC providers. Design note: `profiles.role`/`public_code` stay the signup default; box capabilities come from `box_members.role`. SMS provider (Twilio) still to wire for OTP + invitations.

### New provisioning for Phase 5 (owner)
Set `VAT_BPS` once the per-buyer-country VAT model is confirmed with the accountant (0 until then). Set `CRON_SECRET` and schedule `/api/cron/expire` (e.g. Vercel Cron, hourly) to sweep expired rentals — access is also enforced lazily so this is defense-in-depth.

### New provisioning for Phase 4 (owner)
Set `VEROTEL_SHOP_ID` + `VEROTEL_SIGNATURE_KEY` (from the Verotel panel). Configure success/decline URLs in the Verotel panel (NOT as request params); set Postback URL to `https://content24market.space/api/verotel/webhook`. Until set, checkout shows a graceful "coming soon".

### New provisioning for Phase 3 (owner)
Create two **private** Supabase Storage buckets: `content-originals`, `content-previews`. Optionally set `CSAM_PROVIDER` / `AI_MODERATION_PROVIDER` (until then everything routes to human review). Wire a real KYC provider (Veriff/Onfido) — for now platform admins verify KYC manually in the dashboard.

### Owner provisioning still required before this runs live
Standalone Supabase project + run `0001`/`0002`; standalone Vercel project on content24market.space; set env (see `content-box/.env.example`) incl. `NEXT_PUBLIC_RP_ID`, `ADMIN_STEPUP_SECRET`; enable Supabase **Phone** auth provider (+ an SMS provider). Then each admin: log in via OTP once, register a fingerprint on their device.
