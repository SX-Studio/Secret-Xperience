-- Content Box — Phase 4: wallets, immutable ledger, token orders (Verotel).
-- Idempotent. Depends on 0001–0004.
-- Money rules: balance is a cache; ledger_entries is the source of truth
-- (append-only + idempotency-keyed). All mutations go through apply_ledger()
-- in a single locked transaction. Authenticated clients can READ their own
-- wallet/ledger but NEVER write — only the service role (via these functions).
-- Tokens are multi-purpose vouchers: NO VAT at purchase; VAT is recorded at
-- redemption (rental) via apply_ledger's vat_* args — the hook is here, ready.

do $$ begin create type wallet_kind as enum ('user','creator');
exception when duplicate_object then null; end $$;

do $$ begin create type order_status as enum ('pending','paid','failed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- wallets
-- ---------------------------------------------------------------------------
create table if not exists public.wallets (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  kind            wallet_kind not null default 'user',
  balance_tokens  bigint not null default 0 check (balance_tokens >= 0),
  pending_tokens  bigint not null default 0 check (pending_tokens >= 0),
  lifetime_tokens bigint not null default 0 check (lifetime_tokens >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (owner_id, kind)
);

drop trigger if exists trg_wallets_touch on public.wallets;
create trigger trg_wallets_touch before update on public.wallets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- ledger_entries — append-only, idempotency-keyed
-- ---------------------------------------------------------------------------
create table if not exists public.ledger_entries (
  id              bigint generated always as identity primary key,
  wallet_id       uuid not null references public.wallets(id) on delete cascade,
  delta_tokens    bigint not null,
  reason          text not null,
  ref_type        text,
  ref_id          text,
  balance_after   bigint not null,
  idempotency_key text unique,
  vat_cents       integer,       -- VAT at redemption (null for token purchase / MPV)
  vat_country     text,
  created_at      timestamptz not null default now()
);
create index if not exists ledger_wallet_idx on public.ledger_entries(wallet_id, id desc);

drop trigger if exists trg_ledger_no_update on public.ledger_entries;
create trigger trg_ledger_no_update before update on public.ledger_entries
  for each row execute function public.deny_mutation();
drop trigger if exists trg_ledger_no_delete on public.ledger_entries;
create trigger trg_ledger_no_delete before delete on public.ledger_entries
  for each row execute function public.deny_mutation();

-- ---------------------------------------------------------------------------
-- token_orders — a fiat purchase of tokens (Verotel / crypto later)
-- ---------------------------------------------------------------------------
create table if not exists public.token_orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  package_id   text,
  tokens       bigint not null check (tokens > 0),
  fiat_cents   integer not null check (fiat_cents >= 0),
  currency     text not null default 'EUR',
  provider     text not null default 'verotel',
  provider_ref text,
  status       order_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists token_orders_user_idx on public.token_orders(user_id);

drop trigger if exists trg_token_orders_touch on public.token_orders;
create trigger trg_token_orders_touch before update on public.token_orders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- ensure_wallet: get-or-create a wallet, return its id
-- ---------------------------------------------------------------------------
create or replace function public.ensure_wallet(p_owner uuid, p_kind wallet_kind default 'user')
returns uuid language plpgsql security definer set search_path = public as $$
declare wid uuid;
begin
  insert into public.wallets(owner_id, kind) values (p_owner, p_kind)
    on conflict (owner_id, kind) do nothing;
  select id into wid from public.wallets where owner_id = p_owner and kind = p_kind;
  return wid;
end $$;

-- ---------------------------------------------------------------------------
-- apply_ledger: the ONLY way money moves. Atomic, locked, idempotent.
-- Locks the wallet row FIRST so concurrent same-key calls serialize and the
-- idempotency check cannot double-credit.
-- ---------------------------------------------------------------------------
create or replace function public.apply_ledger(
  p_wallet uuid,
  p_delta bigint,
  p_reason text,
  p_ref_type text default null,
  p_ref_id text default null,
  p_idem text default null,
  p_vat_cents integer default null,
  p_vat_country text default null
) returns public.ledger_entries
language plpgsql security definer set search_path = public as $$
declare
  w public.wallets;
  existing public.ledger_entries;
  new_balance bigint;
  entry public.ledger_entries;
begin
  select * into w from public.wallets where id = p_wallet for update;
  if not found then raise exception 'wallet_not_found'; end if;

  if p_idem is not null then
    select * into existing from public.ledger_entries where idempotency_key = p_idem;
    if found then return existing; end if;   -- idempotent no-op
  end if;

  new_balance := w.balance_tokens + p_delta;
  if new_balance < 0 then raise exception 'insufficient_balance'; end if;

  update public.wallets
     set balance_tokens  = new_balance,
         lifetime_tokens = lifetime_tokens + (case when p_delta > 0 then p_delta else 0 end),
         updated_at      = now()
   where id = p_wallet;

  insert into public.ledger_entries
    (wallet_id, delta_tokens, reason, ref_type, ref_id, balance_after, idempotency_key, vat_cents, vat_country)
  values
    (p_wallet, p_delta, p_reason, p_ref_type, p_ref_id, new_balance, p_idem, p_vat_cents, p_vat_country)
  returning * into entry;

  return entry;
end $$;

-- ---------------------------------------------------------------------------
-- RLS — read-your-own only; writes exclusively via service role / functions
-- ---------------------------------------------------------------------------
alter table public.wallets       enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.token_orders  enable row level security;

drop policy if exists "wallets owner select" on public.wallets;
create policy "wallets owner select" on public.wallets
  for select to authenticated using (owner_id = auth.uid() or public.is_platform_admin());

drop policy if exists "ledger owner select" on public.ledger_entries;
create policy "ledger owner select" on public.ledger_entries
  for select to authenticated using (
    public.is_platform_admin()
    or exists (select 1 from public.wallets w where w.id = wallet_id and w.owner_id = auth.uid())
  );

drop policy if exists "orders owner select" on public.token_orders;
create policy "orders owner select" on public.token_orders
  for select to authenticated using (user_id = auth.uid() or public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select on public.wallets        to authenticated;   -- RLS: own row
grant select on public.ledger_entries to authenticated;   -- RLS: own entries
grant select on public.token_orders   to authenticated;   -- RLS: own orders
grant select, insert, update, delete on public.wallets        to service_role;
grant select, insert                  on public.ledger_entries to service_role;
grant select, insert, update, delete on public.token_orders   to service_role;

-- Money functions are callable only by the service role (server routes).
revoke all on function public.apply_ledger(uuid,bigint,text,text,text,text,integer,text) from public, anon, authenticated;
grant execute on function public.apply_ledger(uuid,bigint,text,text,text,text,integer,text) to service_role;
revoke all on function public.ensure_wallet(uuid, wallet_kind) from public, anon, authenticated;
grant execute on function public.ensure_wallet(uuid, wallet_kind) to service_role;
