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

## Next step when we resume
Produce the section-33 architecture package (no code), then stop for approval.
