-- Multi-placement support: a listing can hold several paid placements at once
-- (e.g. Slider + Section + Homepage simultaneously) instead of a single `tier`.
-- `tier` is kept as the representative/primary placement for badges & back-compat.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS placements text[] NOT NULL DEFAULT '{}';

-- Backfill from the existing single tier so existing paid placements don't regress.
UPDATE public.listings
SET placements = ARRAY[tier]
WHERE (placements IS NULL OR placements = '{}')
  AND tier IS NOT NULL
  AND tier <> 'basic';

-- GIN index so contains() lookups (homepage/section banners) stay fast.
CREATE INDEX IF NOT EXISTS listings_placements_gin
  ON public.listings USING gin (placements);
