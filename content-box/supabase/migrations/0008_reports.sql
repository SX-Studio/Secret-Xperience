-- Content Box — Phase 7: reports + moderation console support.
-- Idempotent. Depends on 0001–0007.
-- Users report content/profiles/boxes. Card-network mandate: illegal/
-- nonconsensual content must be actionable within 7 business days — we track a
-- due_at (7 calendar days as a conservative proxy) and flag urgent reasons.

do $$ begin create type report_status as enum ('open','reviewing','actioned','dismissed');
exception when duplicate_object then null; end $$;

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('content','profile','box')),
  target_id   text not null,
  reason      text not null check (reason in
                ('csam','nonconsensual','illegal','stolen','impersonation','spam','other')),
  details     text,
  urgent      boolean not null default false,
  status      report_status not null default 'open',
  resolution  text,
  created_at  timestamptz not null default now(),
  due_at      timestamptz not null default (now() + interval '7 days'),
  decided_at  timestamptz,
  decided_by  uuid references public.profiles(id)
);
create index if not exists reports_status_idx on public.reports(status, due_at);
create index if not exists reports_target_idx on public.reports(target_type, target_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.reports enable row level security;

-- Reporters see their own reports; platform admins see all. Writes go through
-- the service role (report API / admin triage).
drop policy if exists "reports select" on public.reports;
create policy "reports select" on public.reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_platform_admin());

grant select on public.reports to authenticated;
grant select, insert, update, delete on public.reports to service_role;
