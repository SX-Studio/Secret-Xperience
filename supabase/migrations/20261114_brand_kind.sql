-- Brand kind, so the storefront can show two separate rows: lingerie & fashion
-- brands, and sex toy brands / erotic webshops. Owner request 2026-11-14.
alter table public.brands add column if not exists kind text not null default 'lingerie';
alter table public.brands drop constraint if exists brands_kind_check;
alter table public.brands add constraint brands_kind_check check (kind in ('lingerie', 'toys'));

update public.brands set kind = 'toys'
where slug in ('willie', 'easytoys', 'pabo', 'christineleduc', 'sinful', 'lovehoney', 'lelo', 'meo', 'bijoux-indiscrets', 'system-jo');
