-- Auto-unpublish events once their date has passed. One-off events go inactive the
-- day after date_end (or date_start when there is no end date); recurring events
-- are left alone. Mirrors expire_listing_tiers(): SECURITY DEFINER function + pg_cron.

create or replace function public.expire_past_events()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.events
  set active = false
  where active = true
    and coalesce(date_end, date_start) is not null
    and coalesce(date_end, date_start) < current_date
    and (recurring is null or recurring = '' or recurring = 'one-time');
end;
$$;

do $$
begin
  perform cron.unschedule('expire_past_events_daily');
exception when others then
  null;
end;
$$;

-- Runs daily just after midnight UTC.
select cron.schedule(
  'expire_past_events_daily',
  '5 0 * * *',
  $$select public.expire_past_events();$$
);

create index if not exists events_active_date_idx
  on public.events (date_end, date_start)
  where active = true;
