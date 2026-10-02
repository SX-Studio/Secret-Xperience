-- creator_posts already has the RLS policy "public read active posts" (active = true),
-- but the anon role was never granted SELECT, so logged-out visitors to /creators got
-- 401 from PostgREST and an empty feed. RLS still scopes anon to active posts only.
-- Applied live 2026-10-01.
grant select on public.creator_posts to anon;
