-- Whether a deal's compare price is the manufacturer's recommended retail
-- price (adviesprijs / RRP) rather than the shop's own earlier price. Shops on
-- the EDC platform (EasyToys, Christine le Duc, Pabo) compare against RRP, and
-- presenting RRP as "was" would misstate the saving, so the card labels it.
alter table public.products add column if not exists compare_is_rrp boolean not null default false;
