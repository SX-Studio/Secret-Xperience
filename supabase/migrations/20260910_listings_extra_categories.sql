-- Multi-category listings: an ad can appear in up to 3 categories total
-- (its primary `category` plus up to 2 entries here). Applied to the live
-- project via MCP on 2026-09-10; this file backfills it into version control.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS extra_categories text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS listings_extra_categories_idx
  ON public.listings USING gin (extra_categories);
