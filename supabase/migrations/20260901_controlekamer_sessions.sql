-- Controlekamer (admin control room) — QR / GSM → Desktop device-authorization sessions.
-- A desktop that wants into the control room creates a pending session and shows a QR.
-- The admin opens that QR on their (already-logged-in) phone and approves it, which is
-- what unlocks the desktop. All reads/writes happen through service-role server routes,
-- so this table is locked down: RLS on, no anon/authenticated policies.

create extension if not exists "pgcrypto";

create table if not exists public.control_room_sessions (
  id           uuid primary key default gen_random_uuid(),
  token        text not null unique,                 -- opaque desktop poll token (in the QR URL)
  code         text not null,                         -- short human code shown on desktop + phone to compare
  status       text not null default 'pending'
                 check (status in ('pending','approved','denied','consumed','expired')),
  device       text,                                  -- desktop label / user-agent summary
  ip           text,
  approved_by  uuid references public.profiles(id),   -- admin who approved from their phone
  created_at   timestamptz not null default now(),
  approved_at  timestamptz,
  expires_at   timestamptz not null default (now() + interval '5 minutes')
);

create index if not exists control_room_sessions_token_idx  on public.control_room_sessions (token);
create index if not exists control_room_sessions_status_idx on public.control_room_sessions (status, expires_at);

alter table public.control_room_sessions enable row level security;

-- Service role bypasses RLS; make its grants explicit and give NOTHING to anon/authenticated.
grant select, insert, update, delete on public.control_room_sessions to service_role;
revoke all on public.control_room_sessions from anon, authenticated;

-- Housekeeping: expire stale pending rows. Safe to call from pg_cron if available.
create or replace function public.expire_control_room_sessions()
returns void
language sql
security definer
set search_path = public
as $$
  update public.control_room_sessions
     set status = 'expired'
   where status = 'pending'
     and expires_at < now();
$$;
