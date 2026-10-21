-- Content Box — Phase 1: phone-OTP auth support, admin allowlist, WebAuthn (fingerprint) passkeys.
-- Idempotent. Depends on 0001_foundations.sql.

-- ---------------------------------------------------------------------------
-- Phone helpers
-- ---------------------------------------------------------------------------
-- Digits only, then drop a leading '00' international access prefix so both
-- '+32...' and '0032...' normalize to the same E.164 subscriber form.
create or replace function public.normalize_phone(p text)
returns text language sql immutable as $$
  select regexp_replace(regexp_replace(coalesce(p, ''), '\D', '', 'g'), '^00', '')
$$;

-- ---------------------------------------------------------------------------
-- Admin phone allowlist — ONLY these numbers may become platform_admin.
-- Stored normalized (digits only, E.164 without '+').
-- ---------------------------------------------------------------------------
create table if not exists public.admin_phone_allowlist (
  phone      text primary key,
  label      text,
  created_at timestamptz not null default now()
);

insert into public.admin_phone_allowlist (phone, label) values
  ('32477704740', 'Admin 1'),
  ('32467685669', 'Admin 2')
on conflict (phone) do nothing;

create or replace function public.is_admin_phone(p text)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.admin_phone_allowlist a
    where a.phone = public.normalize_phone(p)
  )
$$;

-- ---------------------------------------------------------------------------
-- Auto-promote allowlisted phones to platform_admin on signup.
-- Rebuilds handle_new_user() from 0001 with the allowlist check appended.
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
  if v_role in ('platform_admin','box_admin') then
    v_role := 'user';   -- self-service signup may never mint admin
  end if;

  -- Allowlisted phone numbers ARE the platform admins.
  if public.is_admin_phone(new.phone) then
    v_role := 'platform_admin';
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

-- One-off: promote any already-existing account whose phone is allowlisted.
create or replace function public.sync_admin_roles()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles p
     set role = 'platform_admin'
    from auth.users u
   where u.id = p.id
     and public.is_admin_phone(u.phone)
     and p.role <> 'platform_admin';
end $$;

select public.sync_admin_roles();

-- ---------------------------------------------------------------------------
-- WebAuthn credentials (passkeys) — the fingerprint gate for /admin
-- ---------------------------------------------------------------------------
create table if not exists public.webauthn_credentials (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,          -- base64url
  public_key    text not null,                 -- base64
  counter       bigint not null default 0,
  transports    text[] not null default '{}',
  device_label  text,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);
create index if not exists webauthn_credentials_user_idx on public.webauthn_credentials(user_id);

create table if not exists public.webauthn_challenges (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  challenge  text not null,
  kind       text not null check (kind in ('register','authenticate')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists webauthn_challenges_user_idx on public.webauthn_challenges(user_id, kind);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admin_phone_allowlist  enable row level security;
alter table public.webauthn_credentials    enable row level security;
alter table public.webauthn_challenges      enable row level security;

drop policy if exists "allowlist admin select" on public.admin_phone_allowlist;
create policy "allowlist admin select" on public.admin_phone_allowlist
  for select to authenticated using (public.is_platform_admin());

-- Admins may see (list/label) their OWN registered devices; writes are service-role only.
drop policy if exists "creds owner select" on public.webauthn_credentials;
create policy "creds owner select" on public.webauthn_credentials
  for select to authenticated using (user_id = auth.uid());

-- challenges: no authenticated access at all (service role only, which bypasses RLS).

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.admin_phone_allowlist to authenticated;
grant select, insert, update, delete on public.admin_phone_allowlist to service_role;

grant select on public.webauthn_credentials to authenticated;   -- RLS: own rows
grant select, insert, update, delete on public.webauthn_credentials to service_role;

grant select, insert, update, delete on public.webauthn_challenges to service_role;
