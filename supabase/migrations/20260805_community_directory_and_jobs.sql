-- Community-submitted venue directory (swinger / fetish / nightlife / massage / etc.)
-- and a sex-work vacancies board (offered / wanted). Both moderated (self-serve
-- submissions land as 'pending'; an admin approves them). Public may read only
-- approved rows; all writes go through the service-role /api/community route.
-- Idempotent — safe to re-run.

create table if not exists public.directory_listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other',
  description text,
  city text,
  country text,
  country_code text,
  website text,
  contact_email text,
  image_url text,
  status text not null default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
do $$ begin
  alter table public.directory_listings
    add constraint directory_listings_status_check check (status in ('pending','approved','rejected'));
exception when duplicate_object then null; end $$;
create index if not exists directory_listings_pub_idx
  on public.directory_listings (category, country) where status = 'approved';

create table if not exists public.job_posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'offered',
  title text not null,
  category text not null default 'other',
  description text,
  city text,
  country text,
  country_code text,
  compensation text,
  poster_type text,
  contact_email text,
  contact_phone text,
  website text,
  status text not null default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 days')
);
do $$ begin
  alter table public.job_posts
    add constraint job_posts_kind_check check (kind in ('offered','wanted'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.job_posts
    add constraint job_posts_status_check check (status in ('pending','approved','rejected'));
exception when duplicate_object then null; end $$;
create index if not exists job_posts_pub_idx
  on public.job_posts (kind, country, expires_at) where status = 'approved';

alter table public.directory_listings enable row level security;
alter table public.job_posts enable row level security;

drop policy if exists "public reads approved directory" on public.directory_listings;
create policy "public reads approved directory" on public.directory_listings
  for select to anon, authenticated using (status = 'approved');

drop policy if exists "public reads approved jobs" on public.job_posts;
create policy "public reads approved jobs" on public.job_posts
  for select to anon, authenticated using (status = 'approved' and expires_at > now());

grant select on public.directory_listings, public.job_posts to anon, authenticated;
grant all on public.directory_listings, public.job_posts to service_role;

-- Admins (profiles.role = 'admin') can read all rows and moderate from the
-- authenticated browser client (mirrors the existing verification-admin policies).
drop policy if exists "admin all directory" on public.directory_listings;
create policy "admin all directory" on public.directory_listings
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "admin all jobs" on public.job_posts;
create policy "admin all jobs" on public.job_posts
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
