-- Content Box — Phase 3: content, media files, KYC, moderation, Trust & Safety gate.
-- Idempotent. Depends on 0001–0003.
-- Compliance core: (a) only KYC-verified creators may create content (DB trigger,
-- enforced even for service-role inserts), (b) content is never auto-approved
-- without a passing scan — the pipeline fails CLOSED to human review.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin create type content_status as enum
  ('draft','processing','pending_review','approved','rejected','suspended','deleted');
exception when duplicate_object then null; end $$;

do $$ begin create type file_kind as enum ('image','video');
exception when duplicate_object then null; end $$;

do $$ begin create type scan_status as enum ('pending','clear','flagged','error','unconfigured');
exception when duplicate_object then null; end $$;

do $$ begin create type kyc_status as enum ('pending','verified','rejected');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- KYC (creator age/ID verification) — card-network mandate
-- ---------------------------------------------------------------------------
create table if not exists public.kyc_verifications (
  id            bigint generated always as identity primary key,
  profile_id    uuid not null unique references public.profiles(id) on delete cascade,
  provider      text,
  provider_ref  text,
  status        kyc_status not null default 'pending',
  consent_given boolean not null default false,
  consent_at    timestamptz,
  verified_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_kyc_touch on public.kyc_verifications;
create trigger trg_kyc_touch before update on public.kyc_verifications
  for each row execute function public.touch_updated_at();

create or replace function public.is_kyc_verified(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.kyc_verifications k
    where k.profile_id = uid and k.status = 'verified'
  );
$$;

-- ---------------------------------------------------------------------------
-- content_items — the sellable unit
-- ---------------------------------------------------------------------------
create sequence if not exists cnt_code_seq start 1000;

create table if not exists public.content_items (
  id                uuid primary key default gen_random_uuid(),
  public_code       text unique not null,
  box_id            uuid not null references public.boxes(id) on delete cascade,
  creator_id        uuid not null references public.profiles(id),
  title             text not null,
  description       text,
  price_tokens      integer not null check (price_tokens >= 0),
  duration_hours    integer not null default 24 check (duration_hours > 0),
  moderation_status content_status not null default 'draft',
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists content_box_idx    on public.content_items(box_id, moderation_status);
create index if not exists content_creator_idx on public.content_items(creator_id);

create or replace function public.set_content_code()
returns trigger language plpgsql as $$
begin
  if new.public_code is null then
    new.public_code := 'CNT-' || lpad(nextval('cnt_code_seq')::text, 5, '0');
  end if;
  return new;
end $$;

drop trigger if exists trg_content_code on public.content_items;
create trigger trg_content_code before insert on public.content_items
  for each row execute function public.set_content_code();

drop trigger if exists trg_content_touch on public.content_items;
create trigger trg_content_touch before update on public.content_items
  for each row execute function public.touch_updated_at();

-- Trust & Safety gate: enforced even for service-role inserts (triggers are not
-- bypassed by RLS). A creator must be KYC-verified and an active creator/box_admin
-- of the target box. Platform admins are exempt (seeding/ops).
create or replace function public.content_publish_gate()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_platform_admin(new.creator_id) then
    return new;
  end if;
  if not public.is_kyc_verified(new.creator_id) then
    raise exception 'creator % is not KYC-verified', new.creator_id;
  end if;
  if not exists (
    select 1 from public.box_members m
    where m.box_id = new.box_id and m.profile_id = new.creator_id
      and m.role in ('creator','box_admin') and m.status = 'active'
  ) then
    raise exception 'creator % is not an active creator in box %', new.creator_id, new.box_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_content_gate on public.content_items;
create trigger trg_content_gate before insert on public.content_items
  for each row execute function public.content_publish_gate();

-- ---------------------------------------------------------------------------
-- content_files — private originals + derived blur/thumb + scan status
-- ---------------------------------------------------------------------------
create table if not exists public.content_files (
  id               bigint generated always as identity primary key,
  content_item_id  uuid not null references public.content_items(id) on delete cascade,
  kind             file_kind not null,
  storage_path     text not null,     -- PRIVATE bucket path (original)
  blur_path        text,              -- derived blurred preview
  thumb_path       text,              -- derived thumbnail
  checksum         text,
  bytes            bigint,
  csam_scan        scan_status not null default 'pending',
  ai_scan          scan_status not null default 'pending',
  created_at       timestamptz not null default now()
);
create index if not exists content_files_item_idx on public.content_files(content_item_id);

-- ---------------------------------------------------------------------------
-- moderation_events — audit of every moderation decision
-- ---------------------------------------------------------------------------
create table if not exists public.moderation_events (
  id              bigint generated always as identity primary key,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  actor_id        uuid references public.profiles(id),
  action          text not null,
  from_status     content_status,
  to_status       content_status,
  reason          text,
  created_at      timestamptz not null default now()
);
create index if not exists moderation_events_item_idx on public.moderation_events(content_item_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.kyc_verifications enable row level security;
alter table public.content_items     enable row level security;
alter table public.content_files     enable row level security;
alter table public.moderation_events enable row level security;

drop policy if exists "kyc owner select" on public.kyc_verifications;
create policy "kyc owner select" on public.kyc_verifications
  for select to authenticated
  using (profile_id = auth.uid() or public.is_platform_admin());

-- content: creator sees own; box admins/platform see all in box; box members see
-- only APPROVED content in their boxes.
drop policy if exists "content select" on public.content_items;
create policy "content select" on public.content_items
  for select to authenticated
  using (
    creator_id = auth.uid()
    or public.is_platform_admin()
    or public.is_box_admin(box_id)
    or (moderation_status = 'approved' and public.is_box_member(box_id))
  );

-- files: creator (owner of the item), box admin, platform. End users receive
-- media only via short-lived signed URLs minted server-side (never direct reads).
drop policy if exists "files select" on public.content_files;
create policy "files select" on public.content_files
  for select to authenticated
  using (
    exists (
      select 1 from public.content_items c
      where c.id = content_item_id
        and (c.creator_id = auth.uid() or public.is_platform_admin() or public.is_box_admin(c.box_id))
    )
  );

drop policy if exists "moderation events admin select" on public.moderation_events;
create policy "moderation events admin select" on public.moderation_events
  for select to authenticated
  using (
    public.is_platform_admin()
    or exists (
      select 1 from public.content_items c
      where c.id = content_item_id and public.is_box_admin(c.box_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.kyc_verifications to authenticated;
grant select, insert, update, delete on public.kyc_verifications to service_role;

grant select on public.content_items to authenticated;
grant select, insert, update, delete on public.content_items to service_role;

grant select on public.content_files to authenticated;
grant select, insert, update, delete on public.content_files to service_role;

grant select on public.moderation_events to authenticated;
grant select, insert on public.moderation_events to service_role;
