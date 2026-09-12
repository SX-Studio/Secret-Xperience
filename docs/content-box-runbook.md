# Content Box — Provisioning Runbook (go-live)

Exact steps to take the code in `content-box/` from repo → live on **content24market.space**.
Everything here is owner action (dashboards + accounts); the code is done and on branch
`claude/custom-domain-vercel-setup-pc5fbu`. Do the steps in order. ⏱️ ≈ 60–90 min (excl. DNS/provider approvals).

Legend: 🔴 = blocks launch · 🟡 = needed for full function · 🟢 = optional/later.

---

## 0. Prerequisites
- GitHub access to `SX-Studio/Secret-Xperience` (the code lives in `content-box/`).
- Accounts you'll create/use: **Supabase**, **Vercel**, **Twilio**, **Verotel** (existing), **Paxum** (later).
- The branch merged to `main` OR deploy the branch directly (Vercel can deploy any branch).

---

## 1. 🔴 Supabase project (database + auth + storage)
1. supabase.com → **New project** → name `content-box` (a NEW project, **not** the SX one).
   Pick region **EU (Frankfurt `eu-central-1`)**. Set a strong DB password (save it).
2. Wait for provisioning (~2 min).
3. **Run the migrations, in order.** Dashboard → **SQL Editor** → New query → paste each file's
   contents and Run, one at a time, `0001` → `0009`:
   ```
   content-box/supabase/migrations/0001_foundations.sql
   0002_auth_admin.sql   0003_boxes_invitations.sql   0004_content_moderation.sql
   0005_wallet.sql       0006_rentals.sql             0007_payouts.sql
   0008_reports.sql      0009_rate_limits.sql
   ```
   Each must finish with **Success**. (They're idempotent — safe to re-run if unsure.)
   `0002` seeds the two admin phone numbers (`+32477704740`, `+32467685669`) into
   `admin_phone_allowlist` — verify with: `select * from admin_phone_allowlist;` → 2 rows.
4. **Keys** — Dashboard → Project Settings → **API**. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - **publishable** key (anon/publishable) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **service_role** key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### 1b. 🔴 Storage buckets (PRIVATE)
Dashboard → **Storage** → New bucket, create **two**, both **Private** (public toggle OFF):
- `content-originals`
- `content-previews`

No extra policies needed — the app reads/writes them only via the service role.

### 1c. 🔴 Phone auth (OTP)
Dashboard → **Authentication → Providers → Phone** → Enable.
Set **SMS provider = Twilio** (see step 2), enter Twilio Account SID, Auth Token, and
Message Service SID / from-number. Save.
(Authentication → Providers → Email can stay off; the app is phone-only.)

---

## 2. 🔴 Twilio (SMS for OTP + invitations)
1. twilio.com → create/verify account, add billing.
2. Buy an SMS-capable number (or create a **Messaging Service**) that can send to BE/NL/DE/FR.
3. Copy **Account SID** + **Auth Token** → paste into Supabase Phone provider (step 1c).
4. (Invitation SMS is currently logged, not sent — wiring Twilio for that is a small follow-up;
   OTP works fully via Supabase↔Twilio once 1c is done.)

---

## 3. 🔴 Vercel project + deploy
1. vercel.com → **Add New → Project** → import `SX-Studio/Secret-Xperience`.
2. **Root Directory** → set to `content-box` (important — the app is in a subfolder).
3. Framework preset: **Next.js** (auto). Build command / output: defaults.
4. **Production branch**: set to `claude/custom-domain-vercel-setup-pc5fbu` (or merge to `main`
   first and use `main`).
5. **Environment Variables** (Project → Settings → Environment Variables), add for
   **Production** (and Preview if you want):

   | Key | Value | 🔴/🟡 |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from 1.4 | 🔴 |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | from 1.4 | 🔴 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from 1.4 (secret) | 🔴 |
   | `NEXT_PUBLIC_SITE_URL` | `https://content24market.space` | 🔴 |
   | `NEXT_PUBLIC_RP_ID` | `content24market.space` | 🔴 (WebAuthn/fingerprint) |
   | `ADMIN_STEPUP_SECRET` | `openssl rand -base64 32` output | 🔴 |
   | `CRON_SECRET` | `openssl rand -base64 32` output | 🟡 (expiry sweep) |
   | `VEROTEL_SHOP_ID` | Verotel website ID | 🟡 (payments) |
   | `VEROTEL_SIGNATURE_KEY` | Verotel FlexPay key | 🟡 |
   | `VAT_BPS` | `0` until accountant confirms (e.g. `2100`) | 🟡 |
   | `CSAM_PROVIDER` | leave empty (fail-closed to human review) | 🟢 |
   | `AI_MODERATION_PROVIDER` | leave empty | 🟢 |

6. **Deploy.** First build should succeed (verified locally: typecheck + `next build` green).

---

## 4. 🔴 Domain → Vercel
1. Vercel → Project → **Settings → Domains** → add `content24market.space` (and `www`).
2. Point DNS at Vercel (this is the earlier domain task):
   - **Simplest:** at Hostinger, set nameservers to `ns1.vercel-dns.com` / `ns2.vercel-dns.com`.
   - **Or** keep Hostinger DNS and add the A record `76.76.21.21` (apex) + `CNAME cname.vercel-dns.com` (www) exactly as Vercel shows.
3. Wait for propagation → Vercel shows **Valid Configuration** + auto-issues SSL.
   `NEXT_PUBLIC_RP_ID` must equal the final apex domain or WebAuthn will refuse.

---

## 5. 🔴 Admin bootstrap (fingerprint access)
For **each** of the two admin phones (`+32477704740`, `+32467685669`):
1. Go to `https://content24market.space/login` → enter the phone in international format → **Send code**.
2. Enter the SMS OTP → you're now signed in. (The DB trigger auto-promotes these numbers to
   `platform_admin`.)
3. Visit `https://content24market.space/admin` → it redirects to `/admin/unlock`.
4. Tap **Register a new fingerprint on this device** → complete the device biometric prompt.
5. You land on the admin dashboard. Next time, `/admin` → unlock with fingerprint (30-min step-up).

Verify (SQL editor): `select public_code, role from profiles where role='platform_admin';` → 2 rows (`OPS-…`).

---

## 6. 🟡 Scheduled expiry sweep
`content-box/vercel.json` already declares an hourly cron on `/api/cron/expire`.
- Ensure `CRON_SECRET` is set (step 3.5). Vercel Cron sends it automatically as
  `Authorization: Bearer $CRON_SECRET`.
- Vercel → Project → **Settings → Cron Jobs** → confirm the job is listed after deploy.
- (Rental access is also enforced lazily at read time, so this is defense-in-depth.)

---

## 7. 🟡 Verotel (token purchases)
1. Verotel control panel → your FlexPay website → copy **Website/Shop ID** + **Signature key**
   → set `VEROTEL_SHOP_ID` / `VEROTEL_SIGNATURE_KEY` in Vercel (step 3.5) → redeploy.
2. In the Verotel panel → FlexPay options:
   - **Success URL**: `https://content24market.space/wallet?status=success`
   - **Decline URL**: `https://content24market.space/wallet?status=cancel`
   - **Postback URL**: `https://content24market.space/api/verotel/webhook`
   (Do NOT pass success/decline as request params — it breaks the signature. The app already omits them.)
3. Test in Verotel test mode: buy a package on `/wallet` → complete test payment → wallet balance
   increases (webhook credits once via `verotel:{saleID}`). Then request live authorization.

---

## 8. 🟢 Later providers (full compliance)
- **Paxum** (creator payouts): open an account; for now admins mark payouts "paid" with the Paxum
  reference in the admin **Payout requests** panel. Wire the API when ready.
- **CSAM scanning** (Cloudflare CSAM tool / PhotoDNA / Thorn) → set `CSAM_PROVIDER` + integrate in
  `lib/moderation/providers.ts`. Until then every upload routes to **human review** (fail-closed).
- **AI moderation** (Hive / Rekognition) → `AI_MODERATION_PROVIDER` + same file.
- **KYC** (Veriff/Onfido) → replace manual admin KYC approval; until then admins verify creators in
  the dashboard **KYC review** panel.
- **Invitation SMS** via Twilio (currently the invite link is logged; send it by SMS in `app/api/invitations/route.ts`).

---

## 9. 🔴 Compliance / legal (gating for real launch, non-code)
- **Belgian accountant** (digital/adult, cross-border VAT): confirm deemed-supplier VAT + OSS
  registration, the multi-purpose-voucher (VAT-at-redemption) treatment, DAC7 scope, and set
  `VAT_BPS` + the commission base. See the tax section in `docs/content-box-architecture.md`.
- **Lawyer**: creator agreement + consent-record model (card-network mandate), token/voucher terms,
  payout/money-transmission review.

---

## 10. Smoke test (end-to-end, ~10 min)
Do this once everything 🔴 is set:
1. **Admin**: log in on both admin phones + register fingerprints (step 5).
2. **Create a box**: `/admin` → Boxes → create "African Girls".
3. **Invite a creator**: in the box card, enter a phone + role `creator` → copy the invite link.
4. **Creator joins**: open the link on that phone → sign in via OTP → accept.
5. **KYC**: creator opens `/drop` → checks consent → submit. Admin `/admin` → KYC review → Verify.
6. **Drop**: creator `/drop` → pick image(s), title, price → Post. Admin `/admin` → Moderation queue
   → Approve (or it auto-holds to review since scanners are unconfigured).
7. **Invite a user**: box card → invite phone + role `user` → accept on that phone.
8. **Buy tokens**: user `/wallet` → buy a package (Verotel test) → balance rises.
9. **Rent**: user `/box/AFRICAN-GIRLS-code` → Rent 24h (or cart) → `/rentals` shows a live countdown;
   **View** opens the media via a signed URL.
10. **Earnings/payout**: creator `/earnings` shows 80% of the rental; at ≥€50, Request payout →
    admin Payout requests → Mark paid.
11. **Report**: `/report?type=content&id=CNT-xxxxx` → file → admin Reports panel → Take down.

If all 11 pass, the DROP → DISCOVER → RENT → EXPIRE loop is live end-to-end.

---

## Quick reference — what each env var gates
| Missing var | Effect |
|---|---|
| Supabase URL/keys | App can't start / no data |
| `ADMIN_STEPUP_SECRET` | `/admin` unlock throws (fingerprint gate can't sign) |
| `NEXT_PUBLIC_RP_ID` | fingerprint registration/auth refused by browser |
| `VEROTEL_*` | `/wallet` shows "payments coming soon" (graceful) |
| `CRON_SECRET` | expiry sweep disabled (lazy expiry still works) |
| `CSAM/AI_PROVIDER` | all uploads → human review (fail-closed, safe) |
| `VAT_BPS` | VAT recorded as 0 at redemption |
