-- Warn fans in-app when a membership is about to renew but their wallet can't cover it.
-- Daily sweep at 03:00 UTC (ahead of renewals at 03:15); one warning per cycle.
ALTER TABLE public.creator_subscriptions
  ADD COLUMN IF NOT EXISTS low_balance_warned_at timestamptz;

CREATE OR REPLACE FUNCTION public.warn_low_balance_renewals() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; short integer;
BEGIN
  FOR s IN
    SELECT cs.id, cs.subscriber_id, cs.tier_name, cs.price_tokens, cs.current_period_end,
           COALESCE(p.full_name, p.username, 'a creator') AS creator_name,
           COALESCE(w.balance, 0) AS bal
    FROM creator_subscriptions cs
    JOIN profiles p ON p.id = cs.creator_id
    LEFT JOIN user_wallets w ON w.user_id = cs.subscriber_id
    WHERE cs.status = 'active' AND cs.cancel_at_period_end = false
      AND cs.current_period_end <= now() + interval '3 days'
      AND cs.current_period_end > now()
      AND COALESCE(w.balance, 0) < cs.price_tokens
      AND (cs.low_balance_warned_at IS NULL OR cs.low_balance_warned_at < now() - interval '7 days')
  LOOP
    short := s.price_tokens - s.bal;
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (s.subscriber_id, 'subscription_low_balance',
      'Top up to keep your membership',
      'Your ' || s.tier_name || ' membership with ' || s.creator_name || ' renews on ' ||
        to_char(s.current_period_end, 'DD Mon') || ' for ' || s.price_tokens ||
        ' tokens, but your balance is ' || s.bal || '. Add ' || short || ' more tokens to keep access.',
      '/tokens');
    UPDATE creator_subscriptions SET low_balance_warned_at = now() WHERE id = s.id;
  END LOOP;
END $$;

-- Renewal now also clears low_balance_warned_at so the next cycle can warn again.
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
      SET current_period_end = now() + interval '30 days', last_renewed_at = now(), low_balance_warned_at = NULL
      WHERE id = s.id;
  END LOOP;
  UPDATE creator_subscriptions SET status = 'cancelled'
    WHERE status = 'active' AND cancel_at_period_end = true AND current_period_end <= now();
END $$;

DO $$ BEGIN
  PERFORM cron.schedule('warn-low-balance-subs', '0 3 * * *', 'SELECT public.warn_low_balance_renewals()');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
