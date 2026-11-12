-- Deals on secretxperience.store: the "Best deals / Hot sale" slider.
--
-- A product is in the slider while deal = true and its deal has not ended.
-- compare_at_cents is the price before the discount (shown struck through,
-- and the -NN% badge is computed from it); deal_label is the short tag on the
-- card ("HOT", "BEST DEAL"); promo_code is the brand's affiliate discount
-- code, shown for the shopper to copy. Prices of partner items are display
-- only — the brand sells and ships them.

alter table public.products
  add column if not exists deal             boolean not null default false,
  add column if not exists compare_at_cents int,
  add column if not exists deal_label       text,
  add column if not exists promo_code       text,
  add column if not exists deal_ends_at     timestamptz;

alter table public.products drop constraint if exists products_compare_at_check;
alter table public.products add constraint products_compare_at_check
  check (compare_at_cents is null or price_cents is null or compare_at_cents > price_cents);

create index if not exists products_deal_idx on public.products (deal_ends_at) where deal and active;
