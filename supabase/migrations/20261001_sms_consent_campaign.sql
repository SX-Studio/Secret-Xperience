-- GDPR Art. 14 consent campaign for listings sourced from third-party directories
-- (redlights.be). Admins send a one-time SMS via Bird asking each advertiser to
-- KEEP (consent + claim the listing) or REMOVE (delete + cease contact). Replies
-- arrive via the Bird inbound webhook. Phone numbers are PII and stay in these
-- tables only — never exported; Bird receives the number solely to deliver the SMS.

create table if not exists public.sms_campaigns (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  body           text not null,                          -- final message text sent
  audience       text not null default 'all_with_phone', -- all_with_phone | not_consented
  no_reply_days  int  not null default 30,               -- silence ≠ consent: unpublish after
  status         text not null default 'draft',          -- draft | sending | sent
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  sent_at        timestamptz
);

create table if not exists public.sms_campaign_messages (
  id                  uuid primary key default gen_random_uuid(),
  campaign_id         uuid not null references public.sms_campaigns(id) on delete cascade,
  listing_id          uuid references public.listings(id) on delete set null,
  listing_ids         uuid[] not null default '{}',       -- every listing sharing this number
  phone               text not null,                      -- E.164
  provider_message_id text,                               -- Bird message id
  status              text not null default 'queued',     -- queued | sent | delivered | failed
  error               text,
  reply               text,                               -- raw inbound text (first reply)
  decision            text,                               -- keep | remove | stop
  replied_at          timestamptz,
  sent_at             timestamptz,
  created_at          timestamptz not null default now(),
  unique (campaign_id, phone)
);
create index if not exists sms_campaign_messages_phone_idx    on public.sms_campaign_messages (phone);
create index if not exists sms_campaign_messages_campaign_idx on public.sms_campaign_messages (campaign_id, status);
create index if not exists sms_campaign_messages_provider_idx on public.sms_campaign_messages (provider_message_id);

-- Numbers that asked to be removed / stopped: never contacted again, listing stays down.
create table if not exists public.sms_optouts (
  phone      text primary key,
  reason     text not null,                 -- remove | stop
  created_at timestamptz not null default now()
);

-- Consent outcome recorded on the listing itself so every page can respect it.
alter table public.listings
  add column if not exists consent_status      text,        -- pending | consented | removed
  add column if not exists consent_at          timestamptz,
  add column if not exists consent_campaign_id uuid references public.sms_campaigns(id) on delete set null;
create index if not exists listings_consent_status_idx on public.listings (consent_status);

-- RLS: these tables hold PII. Only service_role (admin server routes) may touch them.
alter table public.sms_campaigns         enable row level security;
alter table public.sms_campaign_messages enable row level security;
alter table public.sms_optouts           enable row level security;

drop policy if exists "service_role all sms_campaigns"         on public.sms_campaigns;
drop policy if exists "service_role all sms_campaign_messages" on public.sms_campaign_messages;
drop policy if exists "service_role all sms_optouts"           on public.sms_optouts;
create policy "service_role all sms_campaigns"         on public.sms_campaigns         for all to service_role using (true) with check (true);
create policy "service_role all sms_campaign_messages" on public.sms_campaign_messages for all to service_role using (true) with check (true);
create policy "service_role all sms_optouts"           on public.sms_optouts           for all to service_role using (true) with check (true);

grant all on public.sms_campaigns         to service_role;
grant all on public.sms_campaign_messages to service_role;
grant all on public.sms_optouts           to service_role;
