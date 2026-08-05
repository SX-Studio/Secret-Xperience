-- Verified seed of European swinger & fetish venues (ES/IT/AT/CH/CZ/PL/PT) for the
-- /swingers and /fetish hubs. Each entry was verified via web search to have a
-- current official website. Idempotent (unique on name+country → on conflict update).
-- Curated from public listings; SecretXperience is not affiliated with these venues.

create unique index if not exists directory_listings_name_country_key
  on public.directory_listings (name, country);

insert into public.directory_listings (name, category, description, city, country, country_code, website, status) values
('Oops Barcelona','swingers','Liberal swinger club in a modernist house in upper Barcelona.','Barcelona','Spain','ES','https://oops.barcelona/','approved'),
('Encuentros VIP','swingers','One of Spain''s best-known liberal swinger venues, 650 m² in central Madrid.','Madrid','Spain','ES','https://www.encuentrosvip.com/','approved'),
('Club Fusión VIP','swingers','Couples-exchange swinger club in Madrid.','Madrid','Spain','ES','https://fusionvip.com/','approved'),
('Bad Romance','swingers','Rome''s most international swinger club, an erotic meeting lounge since 2014.','Rome','Italy','IT','https://badromanceclub.com/','approved'),
('Le Swing','swingers','Established Vienna swinger club since the early 1980s — cafe-bar, dancefloor and erotic cinema.','Vienna','Austria','AT','https://leswing.net/','approved'),
('Papillon Sauna Club','swingers','Vienna sauna & swinger club, open daily.','Vienna','Austria','AT','https://papillon.at/','approved'),
('Orangerie le Club','swingers','Switzerland''s 5-star premium swinger club, recognised by JoyClub.','Wängi','Switzerland','CH','https://orangerie.eu/','approved'),
('Heaven Can Wait','swingers','Discreet liberal club in Lisbon for couples and singles.','Lisbon','Portugal','PT','https://www.heaven.pt/','approved'),
('LAVA Club','swingers','Exclusive Warsaw swinger club for couples and singles since 2012.','Warsaw','Poland','PL','https://lava-club.pl/','approved'),
('Elysium Swingers Club','swingers','Swinger club on the edge of Warsaw (Marki).','Warsaw','Poland','PL','https://elysium.warszawa.pl/','approved'),
('En la Órbita de IO','fetish','Barcelona''s most iconic long-standing BDSM, kink and fetish space.','Barcelona','Spain','ES','https://enlaorbitadeio.com/en/','approved'),
('The Wicked Place','fetish','200 m² BDSM dungeon in Barcelona with fully equipped rooms.','Barcelona','Spain','ES','https://thewickedplace.net/','approved'),
('Barcelona BDSM','fetish','Elegant BDSM space in Barcelona for consensual play.','Barcelona','Spain','ES','https://barcelonabdsm.com/en/','approved'),
('Club Privé Milano Nautilus','fetish','Fetish & BDSM events at a private club in Milan.','Milan','Italy','IT','https://www.clubprivemilano.it/','approved'),
('Milano Fetish','fetish','Kinky, fetish, BDSM and shibari parties in Milan.','Milan','Italy','IT','https://www.milanofetish.com/','approved'),
('SM Club Roma','fetish','Reference point for BDSM in Rome since 2007 — play parties, munches and workshops.','Rome','Italy','IT','https://www.smclubroma.com/','approved'),
('Darkest Dreams','fetish','BDSM rental studio in Vienna for kinksters, models and photographers.','Vienna','Austria','AT','https://www.darkest-dreams.com/','approved'),
('Atelier Mystique','fetish','BDSM community and play location in Vienna.','Vienna','Austria','AT','https://www.atelier-mystique.at/','approved'),
('Mysticum','fetish','BDSM club in Vienna below the long-established Frivoli club.','Vienna','Austria','AT','https://www.mysticum.at/','approved'),
('Cirque Bizarre','fetish','BDSM studio, SM clinic and domina/fetish space near Zürich (Schlieren).','Zürich','Switzerland','CH','https://www.cirque-bizarre.ch/','approved'),
('Club-CMS','fetish','SM/BDSM club with darkroom and play rooms near Zürich (Urdorf).','Zürich','Switzerland','CH','https://club-cms.ch/','approved'),
('Utopia Fetish de Luxe','fetish','Zürich''s kinky fetish party, running for 30 years.','Zürich','Switzerland','CH','https://utopia-fetish.ch/','approved'),
('Tartaros Club','fetish','Private Prague club for the kink, fetish and BDSM community.','Prague','Czech Republic','CZ','https://tartarosclub.cz/en/','approved'),
('Fetish Chateau','fetish','The largest BDSM studio in Poland — 7 rooms, 200 m² in Warsaw.','Warsaw','Poland','PL','https://fetishchateau.com/','approved'),
('Warsaw Fetish Meeting','fetish','Recurring fetish parties in central Warsaw.','Warsaw','Poland','PL','https://wfm.plug.org.pl/','approved'),
('Lisbon Dungeon','fetish','BDSM dungeon studio for hire in Lisbon — private and professional sessions.','Lisbon','Portugal','PT','https://www.lisbondungeon.com/','approved'),
('Divalicious — Lisbon Femdom','fetish','Femdom party at a libertine club in central Lisbon.','Lisbon','Portugal','PT','https://www.divalicious.club/','approved')
on conflict (name, country) do update set
  category=excluded.category, description=excluded.description, city=excluded.city,
  country_code=excluded.country_code, website=excluded.website, status=excluded.status;
