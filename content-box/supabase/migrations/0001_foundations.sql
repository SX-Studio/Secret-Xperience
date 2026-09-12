-- Content Box — Phase 0: Foundations
-- profiles, roles, audit log, RLS, privilege-escalation guard, auto-profile trigger.
-- Idempotent: safe to re-run. Phone numbers are NOT stored here — they live in
-- auth.users.phone (Supabase Auth) and are readable only via the service role.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type app_role as enum ('user','creator','box_admin','platform_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('active','suspended','pending');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Public-code sequences (human-facing IDs; UUID stays the real PK)
-- ---------------------------------------------------------------------------
create sequence if not exists usr_code_seq start 1000;
create sequence if not exists crt_code_seq start 1000;
create sequence if not exists adm_code_seq start 100;
create sequence if not exists ops_code_seq start 10;

create or replace function public.next_public_code(p_role app_role)
returns text
language plpgsql
as $$
begin
  return case p_role
    when 'user'           then 'USR-' || lpad(nextval('usr_code_seq')::text, 5, '0')
    when 'creator'        then 'CRT-' || lpad(nextval('crt_code_seq')::text, 5, '0')
    when 'box_admin'      then 'ADM-' || lpad(nextval('adm_code_seq')::text, 4, '0')
    when 'platform_admin' then 'OPS-' || lpad(nextval('ops_code_seq')::text, 3, '0')
  end;
end $$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  public_code  text unique not null,
  role         app_role not null default 'user',
  status       account_status not null default 'active',
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- audit_log (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_code  text,
  action      text not null,
  target_type text,
  target_id   text,
  reason      text,
  result      text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_actor_idx  on public.audit_log(actor_id);
create index if not exists audit_log_target_idx on public.audit_log(target_type, target_id);
create index if not exists audit_log_created_idx on public.audit_log(created_at);

-- Enforce append-only at the DB level: block UPDATE/DELETE for everyone
-- except the table owner (migrations). service_role gets INSERT+SELECT only.
create or replace function public.deny_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end $$;

drop trigger if exists trg_audit_no_update on public.audit_log;
create trigger trg_audit_no_update before update on public.audit_log
  for each row execute function public.deny_mutation();

drop trigger if exists trg_audit_no_delete on public.audit_log;
create trigger trg_audit_no_delete before delete on public.audit_log
  for each row execute function public.deny_mutation();

-- ---------------------------------------------------------------------------
-- Authorization helper
-- ---------------------------------------------------------------------------
create or replace function public.is_platform_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'platform_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Auto-create a profile when an auth user is created.
-- Role + display_name come from signup metadata; default role = 'user'.
-- SECURITY DEFINER + explicit search_path (SX lesson: avoids "relation ... does
-- not exist" and search_path hijacking).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
begin
  begin
    v_role := coalesce((new.raw_user_meta_data ->> 'role')::app_role, 'user');
  exception when others then
    v_role := 'user';
  end;
  -- Self-service signup may never mint an admin account.
  if v_role in ('platform_admin','box_admin') then
    v_role := 'user';
  end if;

  insert into public.profiles (id, public_code, role, display_name)
  values (
    new.id,
    public.next_public_code(v_role),
    v_role,
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Prevent privilege escalation: a non-admin may not change their own
-- role / status / public_code via the authenticated client.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Trusted server paths (service role) have no end-user JWT, so auth.uid()
  -- is null; RLS already restricts who can reach an UPDATE, so a null uid here
  -- means the service role. Platform admins are allowed too.
  if auth.uid() is null or public.is_platform_admin(auth.uid()) then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.public_code is distinct from old.public_code then
    raise exception 'not allowed to modify role/status/public_code';
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.audit_log enable row level security;

-- profiles: a user sees & edits their own row; platform admins see/edit all.
drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_platform_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_platform_admin())
  with check (id = auth.uid() or public.is_platform_admin());

-- audit_log: only platform admins may read; no authenticated writes
-- (writes happen through the service role, which bypasses RLS).
drop policy if exists "audit admin select" on public.audit_log;
create policy "audit admin select" on public.audit_log
  for select to authenticated
  using (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Grants (SX lesson: set these explicitly; don't rely on defaults)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated, service_role, anon;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

grant select on public.audit_log to authenticated;      -- gated by RLS to admins
grant select, insert on public.audit_log to service_role; -- append-only (no update/delete)
