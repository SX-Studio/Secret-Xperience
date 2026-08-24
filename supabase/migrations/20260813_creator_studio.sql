-- Creator Studio: profile presentation + per-post access controls + a flexible
-- config blob for studio-only settings (tiers, gift catalog, goal, theme, toggles).
-- Idempotent; safe to re-run.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS studio_config jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.creator_posts
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS blur integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE public.creator_posts DROP CONSTRAINT IF EXISTS creator_posts_visibility_check;
  ALTER TABLE public.creator_posts ADD CONSTRAINT creator_posts_visibility_check
    CHECK (visibility IN ('public','subscribers','ppv'));
END $$;
