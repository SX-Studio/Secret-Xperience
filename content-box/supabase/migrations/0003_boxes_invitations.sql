-- Content Box — Phase 2: Boxes, box members, invitations.
-- Idempotent. Depends on 0001 + 0002.
-- Invitation tokens are stored ONLY as a sha256 hash; the raw token is shown to
-- the inviter once and delivered by SMS. Single-use, time-boxed, revocable.

-- ---------------------------------------------------------------------------
-- Box public-code sequence
-- ---------------------------------------------------------------------------
create sequence if not exists box_code_seq start 1;

-- ---------------------------------------------------------------------------
-- boxes
-- ---------------------------------------------------------------------------
create table if not exists public.boxes (
  id             uuid primary key default gen_random_uuid(),
  public_code    text unique not null,
  name           text not null,
  status         account_status not null default 'active',
  commission_bps integer not null default 2000 check (commission_bps between 0 and 10000),
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function public.set_box_code()
returns trigger language plpgsql as $$
begin
  if new.public_code is null then
    new.public_code := 'BOX-' || lpad(nextval('box_code_seq')::text, 4, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_box_code on public.boxes;
create trigger trg_box_code before insert on public.boxes
  for each row execute function public.set_box_code();

drop trigger if exists trg_boxes_touch on public.boxes;
create trigger trg_boxes_touch before update on public.boxes
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- box_members — who is in a box and in what role (contextual, per box)
-- ---------------------------------------------------------------------------
create table if not exists public.box_members (
  id         bigint generated always as identity primary key,
  box_id     uuid not null references public.boxes(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role       app_role not null check (role in ('box_admin','creator','user')),
  status     account_status not null default 'active',
  invited_by uuid references public.profiles(id),
  joined_at  timestamptz not null default now(),
  unique (box_id, profile_id)
);
create index if not exists box_members_box_idx     on public.box_members(box_id);
create index if not exists box_members_profile_idx on public.box_members(profile_id);

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------
create table if not exists public.invitations (
  id           bigint generated always as identity primary key,
  box_id       uuid not null references public.boxes(id) on delete cascade,
  inviter_id   uuid references public.profiles(id),
  target_phone text not null,                 -- normalized digits
  role         app_role not null check (role in ('box_admin','creator','user')),
  token_hash   text not null unique,          -- sha256 hex of the raw token
  status       text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at   timestamptz not null,
  accepted_by  uuid references public.profiles(id),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists invitations_box_idx   on public.invitations(box_id);
create index if not exists invitations_hash_idx  on public.invitations(token_hash);

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_box_member(p_box uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.box_members m
    where m.box_id = p_box and m.profile_id = uid and m.status = 'active'
  );
$$;

create or replace function public.is_box_admin(p_box uuid, uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.box_members m
    where m.box_id = p_box and m.profile_id = uid
      and m.role = 'box_admin' and m.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.boxes        enable row level security;
alter table public.box_members  enable row level security;
alter table public.invitations  enable row level security;

-- boxes: members can see their box; platform admins see all. Writes: service role.
drop policy if exists "boxes member select" on public.boxes;
create policy "boxes member select" on public.boxes
  for select to authenticated
  using (public.is_platform_admin() or public.is_box_member(id));

-- box_members: you see your own memberships; box admins see their box's members;
-- platform admins see all.
drop policy if exists "box_members select" on public.box_members;
create policy "box_members select" on public.box_members
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_platform_admin()
    or public.is_box_admin(box_id)
  );

-- invitations: box admins of the box + platform admins may list them. Accepts
-- happen via a service-role route (token check), so no authenticated writes.
drop policy if exists "invitations admin select" on public.invitations;
create policy "invitations admin select" on public.invitations
  for select to authenticated
  using (public.is_platform_admin() or public.is_box_admin(box_id));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.boxes to authenticated;
grant select, insert, update, delete on public.boxes to service_role;

grant select on public.box_members to authenticated;
grant select, insert, update, delete on public.box_members to service_role;

grant select on public.invitations to authenticated;
grant select, insert, update, delete on public.invitations to service_role;
