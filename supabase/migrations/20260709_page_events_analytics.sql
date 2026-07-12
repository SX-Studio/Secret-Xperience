-- Privacy-first, first-party pageview analytics. No PII: pathname only (query
-- string dropped), external referrer HOST only, coarse country, and a random
-- per-session id (not linked to any user). Cookieless. Data stays in Supabase.
-- Feeds an owned funnel/traffic view without any third-party analytics.
CREATE TABLE IF NOT EXISTS public.page_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path          text NOT NULL,
  referrer_host text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  session_id    text,
  country       text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_events_created_idx  ON public.page_events (created_at DESC);
CREATE INDEX IF NOT EXISTS page_events_path_idx     ON public.page_events (path, created_at DESC);
CREATE INDEX IF NOT EXISTS page_events_referrer_idx ON public.page_events (referrer_host) WHERE referrer_host IS NOT NULL;

ALTER TABLE public.page_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read page_events" ON public.page_events;
CREATE POLICY "Admins can read page_events" ON public.page_events
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_events TO service_role;
GRANT SELECT ON public.page_events TO authenticated;
