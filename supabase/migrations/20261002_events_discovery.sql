-- Events discovery agent (app/lib/eventsDiscovery.ts, Admin → Events).
-- Discovered events land as active=false / status='pending' and are published by
-- an admin. Slug is the dedupe key (title+city+date), so rejected rows stay in
-- the table to stop the same event being rediscovered.

alter table public.events
  add column if not exists source        text not null default 'manual',   -- manual | discovery
  add column if not exists source_url    text,
  add column if not exists discovered_at timestamptz,
  add column if not exists status        text not null default 'approved', -- pending | approved | rejected
  add column if not exists reviewed_by   uuid,
  add column if not exists reviewed_at   timestamptz;

create index if not exists events_status_idx on public.events (status) where status = 'pending';

create table if not exists public.event_discovery_runs (
  id          uuid primary key default gen_random_uuid(),
  city        text not null,
  country     text,
  trigger     text not null default 'cron',   -- cron | manual
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  found       int not null default 0,
  inserted    int not null default 0,
  skipped     int not null default 0,
  error       text,
  usage       jsonb
);
create index if not exists event_discovery_runs_city_idx on public.event_discovery_runs (city, started_at desc);

alter table public.event_discovery_runs enable row level security;
revoke all on public.event_discovery_runs from anon, authenticated;
grant select, insert, update, delete on public.event_discovery_runs to service_role;

-- Hourly trigger from the database so it does not depend on the Vercel plan's
-- cron limits. The URL and bearer secret live in app_settings (service_role
-- only; the cron job runs as the table owner so it can read them). Supabase's
-- postgres role may not set database-level parameters, hence a table.
-- Seed once (value must equal CRON_SECRET in Vercel):
--   insert into public.app_settings (key, value) values
--     ('events_discover_url',    'https://www.secretxperience.eu/api/cron/events-discover'),
--     ('events_discover_secret', '<CRON_SECRET>')
--   on conflict (key) do update set value = excluded.value, updated_at = now();
create table if not exists public.app_settings (key text primary key, value text not null, updated_at timestamptz not null default now());
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;
grant select, insert, update, delete on public.app_settings to service_role;

create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('events-discover-hourly')
      where exists (select 1 from cron.job where jobname = 'events-discover-hourly');
    perform cron.schedule('events-discover-hourly', '20 * * * *', $cron$
      select net.http_post(
        url     := (select value from public.app_settings where key = 'events_discover_url'),
        headers := jsonb_build_object('Authorization', 'Bearer ' || (select value from public.app_settings where key = 'events_discover_secret'), 'Content-Type', 'application/json'),
        body    := '{}'::jsonb,
        timeout_milliseconds := 60000
      )
      where exists (select 1 from public.app_settings where key = 'events_discover_secret');
    $cron$);
  end if;
end $$;
