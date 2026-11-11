-- Silence ≠ consent. Once a consent campaign has been sent, listings still marked
-- 'pending' after that campaign's own no_reply_days window are unpublished. The
-- window is set per campaign in the admin form (default 30 days).

create or replace function public.unpublish_unanswered_consent()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.listings l
     set active = false,
         consent_status = 'expired'
    from public.sms_campaigns c
   where l.consent_campaign_id = c.id
     and l.consent_status = 'pending'
     and c.status = 'sent'
     and c.sent_at < now() - make_interval(days => c.no_reply_days);
end;
$$;

do $$
begin
  perform cron.unschedule('unpublish_unanswered_consent_daily');
exception when others then
  null;
end;
$$;

select cron.schedule(
  'unpublish_unanswered_consent_daily',
  '15 0 * * *',
  $$select public.unpublish_unanswered_consent();$$
);
