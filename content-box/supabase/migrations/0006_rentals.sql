-- Content Box — Phase 5: rental engine (24h access, atomic split, expiry).
-- Idempotent. Depends on 0001–0005.
-- The heart of the product: each rental has its OWN timer. Access is decided by
-- the backend (status='active' AND now() < expires_at); the frontend countdown
-- is display-only. Purchase is one atomic transaction: debit user, credit
-- creator (net of commission), credit the platform wallet — all via apply_ledger.

-- ---------------------------------------------------------------------------
-- Platform wallet support: a single wallet with no personal owner.
-- ---------------------------------------------------------------------------
alter table public.wallets alter column owner_id drop not null;
alter table public.wallets add column if not exists is_platform boolean not null default false;
create unique index if not exists wallets_single_platform on public.wallets ((is_platform)) where is_platform;

create or replace function public.ensure_platform_wallet()
returns uuid language plpgsql security definer set search_path = public as $$
declare wid uuid;
begin
  select id into wid from public.wallets where is_platform limit 1;
  if wid is null then
    insert into public.wallets(kind, is_platform) values ('user', true) returning id into wid;
  end if;
  return wid;
end $$;

-- ---------------------------------------------------------------------------
-- rentals
-- ---------------------------------------------------------------------------
do $$ begin create type rental_status as enum ('active','expired','refunded');
exception when duplicate_object then null; end $$;

create table if not exists public.rentals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  box_id          uuid not null references public.boxes(id) on delete cascade,
  creator_id      uuid not null references public.profiles(id),
  price_tokens    bigint not null check (price_tokens >= 0),
  purchased_at    timestamptz not null default now(),
  expires_at      timestamptz not null,
  status          rental_status not null default 'active',
  idempotency_key text unique,
  created_at      timestamptz not null default now()
);
create index if not exists rentals_user_idx    on public.rentals(user_id, status, expires_at);
create index if not exists rentals_active_idx  on public.rentals(expires_at) where status = 'active';
create index if not exists rentals_content_idx on public.rentals(content_item_id);

-- ---------------------------------------------------------------------------
-- purchase_rental: one atomic, idempotent purchase with the commission split.
-- VAT (at redemption) is computed VAT-inclusive from price_tokens (1 token = 1
-- eurocent, i.e. 100 tokens = €1) and recorded on the user's debit entry.
-- ---------------------------------------------------------------------------
create or replace function public.purchase_rental(
  p_user uuid,
  p_content uuid,
  p_idem text,
  p_vat_bps integer default 0,
  p_vat_country text default null
) returns public.rentals
language plpgsql security definer set search_path = public as $$
declare
  c            public.content_items;
  bx           public.boxes;
  existing     public.rentals;
  r            public.rentals;
  uw uuid; cw uuid; pw uuid;
  creator_share bigint;
  platform_share bigint;
  vat_cents integer;
begin
  if p_idem is not null then
    select * into existing from public.rentals where idempotency_key = p_idem;
    if found then return existing; end if;
  end if;

  select * into c from public.content_items where id = p_content;
  if not found then raise exception 'content_not_found'; end if;
  if c.moderation_status <> 'approved' then raise exception 'content_not_available'; end if;

  if not exists (
    select 1 from public.box_members m
    where m.box_id = c.box_id and m.profile_id = p_user and m.status = 'active'
  ) then
    raise exception 'not_a_box_member';
  end if;

  select * into bx from public.boxes where id = c.box_id;

  creator_share  := floor(c.price_tokens::numeric * (10000 - bx.commission_bps) / 10000);
  platform_share := c.price_tokens - creator_share;
  vat_cents      := round(c.price_tokens::numeric * p_vat_bps / (10000 + p_vat_bps));

  uw := public.ensure_wallet(p_user, 'user');
  cw := public.ensure_wallet(c.creator_id, 'creator');
  pw := public.ensure_platform_wallet();

  insert into public.rentals (user_id, content_item_id, box_id, creator_id, price_tokens, expires_at, idempotency_key)
  values (p_user, p_content, c.box_id, c.creator_id, c.price_tokens,
          now() + make_interval(hours => c.duration_hours), p_idem)
  returning * into r;

  -- Debit the buyer first (fails here if insufficient → whole tx rolls back).
  perform public.apply_ledger(uw, -c.price_tokens, 'Rental ' || c.public_code,
          'rental', r.id::text, p_idem || ':u', vat_cents, p_vat_country);
  perform public.apply_ledger(cw, creator_share, 'Earnings ' || c.public_code,
          'rental', r.id::text, p_idem || ':c', null, null);
  if platform_share > 0 then
    perform public.apply_ledger(pw, platform_share, 'Commission ' || c.public_code,
            'rental', r.id::text, p_idem || ':p', null, null);
  end if;

  return r;
end $$;

-- Cart: purchase several items in ONE transaction (one wallet check overall —
-- if any item can't be afforded, the whole cart rolls back).
create or replace function public.purchase_cart(
  p_user uuid,
  p_content_ids uuid[],
  p_idem_prefix text,
  p_vat_bps integer default 0,
  p_vat_country text default null
) returns setof public.rentals
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  foreach cid in array p_content_ids loop
    return next public.purchase_rental(p_user, cid, p_idem_prefix || ':' || cid::text, p_vat_bps, p_vat_country);
  end loop;
end $$;

-- Scheduled sweep — flips expired rentals. Backend access checks also enforce
-- expiry lazily, so access is correct even if this hasn't run yet.
create or replace function public.expire_rentals()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.rentals set status = 'expired'
   where status = 'active' and expires_at <= now();
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.rentals enable row level security;

drop policy if exists "rentals owner select" on public.rentals;
create policy "rentals owner select" on public.rentals
  for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

grant select on public.rentals to authenticated;
grant select, insert, update, delete on public.rentals to service_role;

revoke all on function public.purchase_rental(uuid,uuid,text,integer,text) from public, anon, authenticated;
grant execute on function public.purchase_rental(uuid,uuid,text,integer,text) to service_role;
revoke all on function public.purchase_cart(uuid,uuid[],text,integer,text) from public, anon, authenticated;
grant execute on function public.purchase_cart(uuid,uuid[],text,integer,text) to service_role;
revoke all on function public.ensure_platform_wallet() from public, anon, authenticated;
grant execute on function public.ensure_platform_wallet() to service_role;
revoke all on function public.expire_rentals() from public, anon, authenticated;
grant execute on function public.expire_rentals() to service_role;
