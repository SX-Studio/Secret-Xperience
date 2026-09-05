-- Content Box — Phase (hardening): DB-backed rate limiting.
-- Idempotent. Works across serverless instances (a per-process counter would not).
-- check_rate_limit(key, max, window_seconds) atomically bumps a fixed-window
-- counter and returns true if the action is allowed.

create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer not null default 0
);

create or replace function public.check_rate_limit(p_key text, p_max integer, p_window integer)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  r public.rate_limits;
begin
  insert into public.rate_limits(key, window_start, count)
    values (p_key, now(), 0)
    on conflict (key) do nothing;

  select * into r from public.rate_limits where key = p_key for update;

  if now() - r.window_start > make_interval(secs => p_window) then
    update public.rate_limits set window_start = now(), count = 1 where key = p_key;
    return true;
  end if;

  if r.count >= p_max then
    return false;
  end if;

  update public.rate_limits set count = count + 1 where key = p_key;
  return true;
end $$;

alter table public.rate_limits enable row level security; -- no policies: service role only

revoke all on function public.check_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text,integer,integer) to service_role;
grant select, insert, update, delete on public.rate_limits to service_role;
