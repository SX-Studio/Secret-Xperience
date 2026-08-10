-- Locker Room: community message wall for the Pride / LGBTQ+ section.
create table if not exists public.locker_room_posts (
  id uuid primary key default gen_random_uuid(),
  handle text not null default 'Anonymous',
  body text not null,
  vibe text,
  approved boolean not null default true,
  flagged boolean not null default false,
  created_at timestamptz not null default now(),
  constraint locker_body_len check (char_length(body) between 1 and 280),
  constraint locker_handle_len check (char_length(handle) <= 40),
  constraint locker_vibe_len check (vibe is null or char_length(vibe) <= 8)
);

create index if not exists locker_room_posts_created_idx
  on public.locker_room_posts (created_at desc) where approved = true and flagged = false;

alter table public.locker_room_posts enable row level security;

drop policy if exists "locker read visible" on public.locker_room_posts;
create policy "locker read visible" on public.locker_room_posts
  for select to anon, authenticated using (approved = true and flagged = false);

drop policy if exists "locker insert" on public.locker_room_posts;
create policy "locker insert" on public.locker_room_posts
  for insert to anon, authenticated with check (true);

drop policy if exists "locker admin update" on public.locker_room_posts;
create policy "locker admin update" on public.locker_room_posts
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

grant select, insert on public.locker_room_posts to anon, authenticated;
grant all on public.locker_room_posts to service_role;
