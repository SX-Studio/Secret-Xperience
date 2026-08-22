-- Content Box — Phase 6: creator payouts.
-- Idempotent. Depends on 0001–0006.
-- Creator earnings live in their creator wallet's balance_tokens (available) +
-- lifetime_tokens (lifetime). A payout request LOCKS funds by debiting the
-- wallet immediately (so they can't be double-requested); admin then pays
-- (Paxum) or rejects (refund). Threshold: €50 = 5000 tokens (100 tokens = €1).
-- NOTE: a refund/chargeback HOLD window before earnings become available is a
-- documented future refinement; for MVP earnings are available immediately.

do $$ begin create type payout_status as enum ('requested','paid','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.payout_requests (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references public.profiles(id) on delete cascade,
  wallet_id    uuid not null references public.wallets(id),
  amount_tokens bigint not null check (amount_tokens > 0),
  fiat_cents   integer not null,
  currency     text not null default 'EUR',
  provider     text not null default 'paxum',
  provider_ref text,
  status       payout_status not null default 'requested',
  reason       text,
  requested_at timestamptz not null default now(),
  decided_at   timestamptz,
  decided_by   uuid references public.profiles(id),
  idempotency_key text unique
);
create index if not exists payout_creator_idx on public.payout_requests(creator_id, status);

-- ---------------------------------------------------------------------------
-- request_payout: lock the whole available creator balance into a payout.
-- ---------------------------------------------------------------------------
create or replace function public.request_payout(p_creator uuid, p_idem text default null)
returns public.payout_requests
language plpgsql security definer set search_path = public as $$
declare
  cw uuid;
  avail bigint;
  pr public.payout_requests;
  min_tokens constant bigint := 5000; -- €50
begin
  if p_idem is not null then
    select * into pr from public.payout_requests where idempotency_key = p_idem;
    if found then return pr; end if;
  end if;

  cw := public.ensure_wallet(p_creator, 'creator');
  select balance_tokens into avail from public.wallets where id = cw for update;
  if avail is null then raise exception 'wallet_not_found'; end if;
  if avail < min_tokens then raise exception 'below_threshold'; end if;

  insert into public.payout_requests (creator_id, wallet_id, amount_tokens, fiat_cents, idempotency_key)
  values (p_creator, cw, avail, avail, p_idem)
  returning * into pr;

  -- Lock the funds by debiting now; refunded on rejection.
  perform public.apply_ledger(cw, -avail, 'Payout requested', 'payout', pr.id::text,
          coalesce(p_idem, pr.id::text) || ':req');

  return pr;
end $$;

-- ---------------------------------------------------------------------------
-- decide_payout: admin pays (Paxum) or rejects (refund).
-- ---------------------------------------------------------------------------
create or replace function public.decide_payout(
  p_payout uuid, p_decision text, p_admin uuid,
  p_provider_ref text default null, p_reason text default null
) returns public.payout_requests
language plpgsql security definer set search_path = public as $$
declare pr public.payout_requests;
begin
  select * into pr from public.payout_requests where id = p_payout for update;
  if not found then raise exception 'payout_not_found'; end if;
  if pr.status <> 'requested' then raise exception 'payout_not_open'; end if;

  if p_decision = 'pay' then
    update public.payout_requests
       set status='paid', decided_at=now(), decided_by=p_admin, provider_ref=p_provider_ref
     where id=pr.id returning * into pr;
  elsif p_decision = 'reject' then
    perform public.apply_ledger(pr.wallet_id, pr.amount_tokens, 'Payout rejected — refund',
            'payout', pr.id::text, pr.id::text || ':refund');
    update public.payout_requests
       set status='rejected', decided_at=now(), decided_by=p_admin, reason=p_reason
     where id=pr.id returning * into pr;
  else
    raise exception 'bad_decision';
  end if;

  return pr;
end $$;

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
alter table public.payout_requests enable row level security;

drop policy if exists "payouts creator select" on public.payout_requests;
create policy "payouts creator select" on public.payout_requests
  for select to authenticated
  using (creator_id = auth.uid() or public.is_platform_admin());

grant select on public.payout_requests to authenticated;
grant select, insert, update, delete on public.payout_requests to service_role;

revoke all on function public.request_payout(uuid,text) from public, anon, authenticated;
grant execute on function public.request_payout(uuid,text) to service_role;
revoke all on function public.decide_payout(uuid,text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.decide_payout(uuid,text,uuid,text,text) to service_role;
