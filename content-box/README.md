# Content Box (Content Drop 24)

Temporary multi-creator content marketplace. **Standalone** app — separate Supabase + Vercel projects from Secret Xperience. Domain: `content24market.space`.

See the design & architecture docs in the repo root `docs/`:
- `content-box-concept.md` — concept + providers + status
- `content-box-architecture.md` — full architecture (system, DB, wallet, rentals, T&S, security, roadmap, tax/VAT)
- `content-box-frontend.md` — UI design system + screens (from the approved prototype)

## Phase 0 — Foundations (this scaffold)
- Next.js 15 + TypeScript app
- Supabase clients: browser / server (async cookies) / hardened service-role admin
- `supabase/migrations/0001_foundations.sql` — profiles, roles, append-only audit log, RLS, privilege-escalation guard, auto-profile trigger
- Roles, audit-log writer, session/role helpers

Not built yet (later phases): auth UI/OTP, boxes & invitations, upload + T&S, wallet/tokens, rental engine, payouts, moderation console.

## Local dev
```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run typecheck            # tsc --noEmit
npm run dev                  # http://localhost:3000
```

## Provisioning (owner steps — cannot be automated here)
1. **Create a new Supabase project** (dedicated to Content Box — do NOT reuse the SX project).
2. In the SQL editor, run `supabase/migrations/0001_foundations.sql`.
3. Copy the project URL, the **publishable** key, and the **service role** key.
4. **Create a new Vercel project** from this directory; point `content24market.space` at it.
5. Set env vars (local `.env.local` and Vercel) per `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `NEXT_PUBLIC_SITE_URL`
6. In Supabase Auth, enable **Phone** provider (SMS/OTP) — provider wiring lands in Phase 1.

## Security notes
- Service-role key is server-only (`lib/supabase/admin.ts`); never import it into client code.
- Phone numbers live in Supabase Auth (`auth.users.phone`), read only via the service role — not duplicated into `profiles`.
- `audit_log` is append-only (DB triggers block UPDATE/DELETE).
- Authorization is enforced by Postgres RLS; the app layer is defense-in-depth.
