-- Brands on secretxperience.store.
--
-- Commission-only phase: brands do not pay to be listed. Each brand has a page
-- on the storefront (/b/<slug>) and can have a few featured items; every
-- outbound click goes through /go/... so it is counted before the shopper is
-- sent to the brand's (affiliate) link. The click log is what we show a brand
-- when the conversation moves to paid placement.
--
-- `is_house` marks SecretXperience's own label: its products are sold through
-- our own checkout rather than linked out.

create table if not exists public.brands (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null,
  tagline           text,
  description       text,
  logo_url          text,
  cover_url         text,
  website_url       text,
  affiliate_url     text,
  affiliate_network text,
  commission_note   text,
  is_house          boolean not null default false,
  featured          boolean not null default false,
  sort              int not null default 0,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists brands_active_idx on public.brands (active, featured desc, sort, name);
create unique index if not exists brands_one_house on public.brands ((true)) where is_house;

alter table public.products add column if not exists brand_id uuid references public.brands(id) on delete set null;
alter table public.products add column if not exists sort int not null default 0;
create index if not exists products_brand_idx on public.products (brand_id) where active;

-- No user id, no IP: the count is the product, not the person.
create table if not exists public.affiliate_clicks (
  id          bigint generated always as identity primary key,
  brand_id    uuid references public.brands(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  source      text,
  clicked_at  timestamptz not null default now()
);
create index if not exists affiliate_clicks_brand_idx on public.affiliate_clicks (brand_id, clicked_at desc);
create index if not exists affiliate_clicks_product_idx on public.affiliate_clicks (product_id, clicked_at desc);

alter table public.brands enable row level security;
alter table public.affiliate_clicks enable row level security;

drop policy if exists "public read active brands" on public.brands;
create policy "public read active brands" on public.brands for select using (active = true);

grant select on public.brands to anon, authenticated;
grant select, insert, update, delete on public.brands to service_role;
-- affiliate_clicks: written and read only by server routes.
revoke all on public.affiliate_clicks from anon, authenticated;
grant select, insert, update, delete on public.affiliate_clicks to service_role;
grant usage, select on sequence public.affiliate_clicks_id_seq to service_role;

-- Seed: the partner boutiques that were hard-coded in app/data/shops.ts, the
-- brands already named on products, and the house label (inactive until it
-- has products). Plain website links for now; affiliate links are added in
-- Admin -> Shop as each programme is joined.
insert into public.brands (slug, name, website_url, cover_url, sort) values
  ('maison-close',   'Maison Close',     'https://maison-close.com',            '/shops/maison-close.jpg', 10),
  ('elynaforce',     'Elyna Force',      'https://elynaforce.com/',             null,                      20),
  ('womanza',        'Womanza',          'https://www.womanza.com/',            '/shops/womanza.jpg',      30),
  ('noirsatine',     'Noir Satine',      'https://www.noirsatine.com/',         '/shops/noirsatine.jpg',   40),
  ('parfaitamour',   'Parfait Amour',    'https://parfaitamour.fr/',            '/shops/parfaitamour.jpg', 50),
  ('mariemur',       'MARIEMUR',         'https://mariemur.com/',               '/shops/mariemur.jpg',     60),
  ('serata',         'Serata',           'https://serata.store/',               '/shops/serata.jpg',       70),
  ('arralingerie',   'Arra Lingerie',    'https://www.arralingerie.com/',       '/shops/arralingerie.jpg', 80),
  ('bluebella',      'Bluebella',        'https://www.bluebella.eu/',           null,                      90),
  ('bordelle',       'Bordelle',         'https://eu.bordelle.co.uk/nl',        '/shops/bordelle.jpg',     100),
  ('superlove',      'Superlove',        'https://superlove.be/',               null,                      110),
  ('christineleduc', 'Christine le Duc', 'https://www.christineleduc.be/',      '/shops/christineleduc.jpg', 120),
  ('pharador',       'Pharador',         'https://pharador.com/nl',             '/shops/pharador.jpg',     130),
  ('pleasurements',  'Pleasurements',    'https://www.pleasurements.com/nl',    '/shops/pleasurements.jpg', 140),
  ('classywear',     'Classywear',       'https://www.classywear.nl/',          '/shops/classywear.jpg',   150),
  ('annavanrode',    'Anna van Rode',    'https://www.annavanrode.nl/',         '/shops/annavanrode.jpg',  160),
  ('honeybirdette',  'Honey Birdette',   'https://eu.honeybirdette.com/',       '/shops/honeybirdette.jpg', 170),
  ('demask',         'DeMask',           'https://demask.com/',                 '/shops/demask.jpg',       180),
  ('frauleinkink',   'Fräulein Kink',    'https://www.frauleinkink.com/',       '/shops/frauleinkink.jpg', 190),
  ('atelieramour',   'Atelier Amour',    'https://atelier-amour.com/',          '/shops/atelieramour.jpg', 200),
  ('undiz',          'Undiz',            'https://be.undiz.com/',               '/shops/undiz.jpg',        210),
  ('etam',           'Etam',             'https://www.etam.be/nl_BE/home',      '/shops/etam.jpg',         220),
  ('sinful',         'Sinful',           'https://www.sinful.be/',              '/shops/sinful.jpg',       230)
on conflict (slug) do nothing;

insert into public.brands (slug, name, sort)
select distinct lower(regexp_replace(regexp_replace(trim(p.brand), '[^A-Za-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')), trim(p.brand), 500
from public.products p
where p.brand is not null and trim(p.brand) <> ''
  and not exists (select 1 from public.brands b where lower(b.name) = lower(trim(p.brand)))
on conflict (slug) do nothing;

update public.products p set brand_id = b.id
from public.brands b
where p.brand_id is null and p.brand is not null and lower(b.name) = lower(trim(p.brand));

insert into public.brands (slug, name, tagline, is_house, active, sort)
values ('secretxperience', 'SecretXperience', 'The house collection', true, false, 0)
on conflict (slug) do nothing;
