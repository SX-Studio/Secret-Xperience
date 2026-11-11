-- Live-show tips: the one thing tokens are spent on.
--
-- Tokens are bought on secretxperience.store and spent on secretxperience.eu,
-- but both read the same user_wallets row, so a purchase there shows up here
-- with nothing to sync.
--
-- tip_live_stream() moves the money in one transaction: a conditional UPDATE
-- (balance >= amount) is the overspend guard, so two tips racing each other can
-- never take a wallet below zero. EXECUTE is service_role only; the route that
-- calls it authenticates the viewer.

create table if not exists public.live_tips (
  id           uuid primary key default gen_random_uuid(),
  stream_id    uuid not null references public.live_streams(id) on delete cascade,
  viewer_id    uuid not null references auth.users(id) on delete cascade,
  performer_id uuid not null references public.profiles(id) on delete cascade,
  amount       integer not null check (amount > 0),
  created_at   timestamptz not null default now()
);
create index if not exists live_tips_performer_idx on public.live_tips (performer_id, created_at desc);
create index if not exists live_tips_stream_idx on public.live_tips (stream_id);

alter table public.live_tips enable row level security;
grant select, insert, update, delete on public.live_tips to service_role;
grant select on public.live_tips to authenticated;
drop policy if exists "live_tips read own" on public.live_tips;
create policy "live_tips read own" on public.live_tips
  for select to authenticated
  using (viewer_id = auth.uid() or performer_id = auth.uid());

-- Viewers insert their own chat lines directly, so without this a viewer could
-- post a message flagged as a tip of any size without spending anything.
drop policy if exists "live_chat insert own" on public.live_chat_messages;
create policy "live_chat insert own" on public.live_chat_messages
  for insert to authenticated
  with check (user_id = auth.uid() and coalesce(is_tip, false) = false and tip_amount is null);

create or replace function public.tip_live_stream(
  p_viewer   uuid,
  p_stream   uuid,
  p_amount   integer,
  p_username text,
  p_message  text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_performer uuid;
  v_status    text;
  v_balance   integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;

  select provider_id, status into v_performer, v_status
    from live_streams where id = p_stream;
  if v_performer is null then
    raise exception 'stream_not_found';
  end if;
  if v_status <> 'live' then
    raise exception 'stream_ended';
  end if;
  if v_performer = p_viewer then
    raise exception 'self_tip';
  end if;

  update user_wallets
     set balance = balance - p_amount,
         total_spent = total_spent + p_amount,
         updated_at = now()
   where user_id = p_viewer and balance >= p_amount
  returning balance into v_balance;
  if v_balance is null then
    raise exception 'insufficient_tokens';
  end if;

  insert into token_ledger (user_id, amount, balance_after, type, description, reference_id)
  values (p_viewer, -p_amount, v_balance, 'spend', 'Live show tip', p_stream::text);

  insert into live_tips (stream_id, viewer_id, performer_id, amount)
  values (p_stream, p_viewer, v_performer, p_amount);

  insert into live_chat_messages (stream_id, user_id, username, body, is_tip, tip_amount)
  values (p_stream, p_viewer, left(coalesce(nullif(p_username, ''), 'Guest'), 40),
          left(coalesce(nullif(trim(p_message), ''), 'sent a tip'), 200), true, p_amount);

  return v_balance;
end;
$$;

revoke execute on function public.tip_live_stream(uuid, uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.tip_live_stream(uuid, uuid, integer, text, text) to service_role;
