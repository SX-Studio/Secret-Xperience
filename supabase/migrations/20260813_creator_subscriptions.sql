-- Token-based recurring memberships. A subscription charges the fan's wallet
-- price_tokens now and again every 30 days via renew_due_subscriptions() (pg_cron).
CREATE TABLE IF NOT EXISTS public.creator_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier_name text NOT NULL,
  price_tokens integer NOT NULL CHECK (price_tokens >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_renewed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS creator_subscriptions_active_uniq
  ON public.creator_subscriptions (subscriber_id, creator_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS creator_subscriptions_creator_idx ON public.creator_subscriptions (creator_id, status);
CREATE INDEX IF NOT EXISTS creator_subscriptions_due_idx ON public.creator_subscriptions (current_period_end) WHERE status = 'active';

ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.creator_subscriptions TO authenticated;
GRANT ALL ON public.creator_subscriptions TO service_role;

DROP POLICY IF EXISTS "own or received subs" ON public.creator_subscriptions;
CREATE POLICY "own or received subs" ON public.creator_subscriptions
  FOR SELECT TO authenticated
  USING (subscriber_id = auth.uid() OR creator_id = auth.uid());

CREATE OR REPLACE FUNCTION public.renew_due_subscriptions() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; sub_bal integer; cr_bal integer;
BEGIN
  FOR s IN SELECT * FROM creator_subscriptions
           WHERE status = 'active' AND cancel_at_period_end = false AND current_period_end <= now()
  LOOP
    SELECT balance INTO sub_bal FROM user_wallets WHERE user_id = s.subscriber_id FOR UPDATE;
    IF sub_bal IS NULL OR sub_bal < s.price_tokens THEN
      UPDATE creator_subscriptions SET status = 'expired' WHERE id = s.id;
      CONTINUE;
    END IF;
    UPDATE user_wallets SET balance = balance - s.price_tokens WHERE user_id = s.subscriber_id;

    SELECT balance INTO cr_bal FROM user_wallets WHERE user_id = s.creator_id FOR UPDATE;
    IF cr_bal IS NULL THEN
      INSERT INTO user_wallets (user_id, balance) VALUES (s.creator_id, s.price_tokens);
      cr_bal := s.price_tokens;
    ELSE
      UPDATE user_wallets SET balance = balance + s.price_tokens WHERE user_id = s.creator_id;
      cr_bal := cr_bal + s.price_tokens;
    END IF;

    INSERT INTO token_ledger (user_id, amount, balance_after, type, description) VALUES
      (s.subscriber_id, -s.price_tokens, sub_bal - s.price_tokens, 'spend', 'Subscription renewal'),
      (s.creator_id, s.price_tokens, cr_bal, 'bonus', 'Subscription renewal from fan');

    UPDATE creator_subscriptions
      SET current_period_end = now() + interval '30 days', last_renewed_at = now()
      WHERE id = s.id;
  END LOOP;
  UPDATE creator_subscriptions SET status = 'cancelled'
    WHERE status = 'active' AND cancel_at_period_end = true AND current_period_end <= now();
END $$;

DO $$ BEGIN
  PERFORM cron.schedule('renew-subscriptions', '15 3 * * *', 'SELECT public.renew_due_subscriptions()');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
