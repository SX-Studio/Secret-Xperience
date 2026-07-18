// Belgium adult venues directory — clubs, brothels, erotic massage, saunas, swingers.
// Data curated from public listings; each entry links to the venue's own website.
// Photos are hosted by the source directory (hotlinked with a gradient fallback).

export type Venue = {
  name: string
  city: string
  country: 'Belgium' | 'Germany'
  category: VenueCategory
  website: string
  image: string
}

export type VenueCategory =
  | 'Gentlemen\'s Clubs & Bars'
  | 'Erotic Massage & Sauna'
  | 'Brothels & Laufhaus'
  | 'Strip Clubs'
  | 'Swingers Clubs'
  | 'Domina & Fetish'
  | 'Escort'

export const VENUE_CATEGORY_ORDER: VenueCategory[] = [
  'Gentlemen\'s Clubs & Bars',
  'Erotic Massage & Sauna',
  'Brothels & Laufhaus',
  'Strip Clubs',
  'Swingers Clubs',
  'Domina & Fetish',
  'Escort',
]

export const venues: Venue[] = [
  // ── Gentlemen's Clubs & Bars ──────────────────────────────────────────────
  { name: 'Funny Horse Club', city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.funnyhorse.be/', image: '/ads/venues/funny-horse-club-0c3.jpg' },
  { name: 'Dorsia Club', city: 'Antwerp', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.dorsiaclub.be/index.html', image: '/ads/venues/dorsia-club-982.jpg' },
  { name: 'New Club Cocoon', city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.newclubcocoon.com/site2015/index.php', image: '/ads/venues/new-club-cocoon-ecb.jpg' },
  { name: 'Amnesia Night Club', city: 'Antwerp', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.clubamnesia.be', image: '/ads/venues/amnesia-night-club-2f0.jpg' },
  { name: 'Bodytalk', city: 'Antwerp', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.bodytalk69.be', image: '/ads/venues/bodytalk-c9e.jpg' },
  { name: 'Dox', city: 'Antwerp', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.doxgirls.eu', image: '/ads/venues/dox-608.jpg' },
  { name: 'Myoo', city: 'Antwerp', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.myoo.be/', image: '/ads/venues/myoo-0a9.jpg' },
  { name: 'Silk', city: 'Antwerp', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.club-silk.be/', image: '/ads/venues/silk-052.jpg' },
  { name: 'XS Gentlemens Club', city: 'Antwerp', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://xsgentlemensclub.com/', image: '/ads/venues/xs-652.jpg' },
  { name: "Charlie's Angels Bar", city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.sexy-charlies-angels.com/', image: '/ads/venues/charlie-s-angels-bar-37c.jpg' },
  { name: 'Clara Moore', city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://en.claramoore.be/', image: '/ads/venues/clara-moore-df6.jpg' },
  { name: 'Le VIP', city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.euro-vip.com/home_2009.php', image: '/ads/venues/le-vip-02e.jpg' },
  { name: 'Love Bar Room', city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'https://love-bar-room.be/', image: '/ads/venues/love-bar-room-ed7.jpg' },
  { name: 'Mademoiselle X', city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.mellex.be/', image: '/ads/venues/mademoiselle-x-c39.jpg' },
  { name: 'Mary Hash', city: 'Brussels', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://maryhash.be', image: '/ads/venues/mary-hash-c8e.jpg' },
  { name: 'Club Privé 337', city: 'Mouscron', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://leclub337.com/', image: '/ads/venues/club-prive-337-1783277776583-TDT8X9IWWkRj3dFt.jpg' },
  { name: 'Club Riviera', city: 'Harelbeke', country: 'Belgium', category: "Gentlemen's Clubs & Bars", website: 'http://www.clubriviera.be/', image: '/ads/venues/club-riviera-1783557368044-ecrRbMH4TCMTbIP8.png' },

  // ── Erotic Massage & Sauna ────────────────────────────────────────────────
  { name: 'De Massagerie', city: 'Antwerp', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.massagerie.be/', image: '/ads/venues/de-massagerie-1784026570650-SUv7pxOR5Bf8emSX.jpg' },
  { name: "Men's World", city: 'Antwerp', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.mens-world.be/', image: '/ads/venues/mens-world-1784034969208-BRrBizFnnkZDwrgS.jpg' },
  { name: 'Geisha', city: 'Antwerp', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.geishamassage.be/', image: '/ads/venues/geisha-8a2.jpg' },
  { name: 'Massage Wereld', city: 'Antwerp', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'https://www.massagewereld.com/', image: '/ads/venues/massage-wereld-f41.jpg' },
  { name: 'Janphen Thai Massage', city: 'Mechelen', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.janphenmassage.be/', image: '/ads/venues/janphen-thai-massage-1783681570521-B37fmoOyCvaT01KG.jpg' },
  { name: 'Bhumjai Thai Massage', city: 'Wommelgem', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://bhumjai.be/', image: '/ads/venues/bhumjai-thai-massage-H5OfHbjpd42L56fs.jpg' },
  { name: 'Alizée Détente', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.alizeedetente.com/', image: '/ads/venues/alizee-detente-1783442171808-G2EYXcq82ZR104cE.jpg' },
  { name: 'Aphrodite', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.massageaphrodite.be/en/our-center', image: '/ads/venues/aphrodite-557.jpg' },
  { name: 'Aqua Massage', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.aquamassagesauna.com/site/welkom-en/', image: '/ads/venues/aqua-massage-d63.jpg' },
  { name: 'Aqua Massage Sauna', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.aquamassagesauna.com/', image: '/ads/venues/aqua-massage-sauna-1783452371575-La6BGlb9MZMkqdh0.png' },
  { name: 'Bo Karma', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'https://www.bokarma.be/', image: '/ads/venues/bo-karma-723.jpg' },
  { name: 'Jardins Secret', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.jardins-secret.be/fr/centre-massage-1830', image: '/ads/venues/jardins-secret-0db.jpg' },
  { name: 'Le Hammam', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'https://www.lehammam.be/', image: '/ads/venues/le-hammam-b94.jpg' },
  { name: 'Sweetness', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.sweetness-massage.be/', image: '/ads/venues/sweetness-dd6.jpeg' },
  { name: 'Vertigo', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://vertigobrusselsmassage.be/', image: '/ads/venues/vertigo-994.jpg' },
  { name: 'Anna Berry Louise', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://annaberry.be/en/salon-louise/', image: '/ads/venues/anna-berry-louise-53d.jpg' },
  { name: 'Anna Berry Schuman', city: 'Brussels', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'https://annaberry.be/en/salon-schuman/', image: '/ads/venues/anna-berry-schuman-bbb.jpg' },
  { name: 'Victoria Secret Garden', city: 'Meise', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.victoriasecretgarden.be/', image: '/ads/venues/victoria-secret-garden-1784272272921-ryCByQFn6BXJosbV.jpg' },
  { name: 'Dreams Club', city: 'Wevelgem', country: 'Belgium', category: 'Erotic Massage & Sauna', website: 'http://www.dreams-erotic-massage.be/', image: '/ads/venues/dreams-club-1783588270207-kwsuwxfBDX9exvb5.jpg' },

  // ── Strip Clubs ───────────────────────────────────────────────────────────
  { name: 'Abilux Stripclub', city: 'Antwerp', country: 'Belgium', category: 'Strip Clubs', website: 'http://abilux.be/', image: '/ads/venues/abilux-stripclub-8dd.jpg' },

  // ── Swingers Clubs ────────────────────────────────────────────────────────
  { name: 'Le Frisson', city: 'Pin (Habay)', country: 'Belgium', category: 'Swingers Clubs', website: 'http://lefrisson.be/', image: '/ads/venues/le-frisson-1783278076463-EAwQyohdbNkQunVf.jpg' },

  // ── Escort ────────────────────────────────────────────────────────────────
  { name: 'Escorte Sofie', city: 'Ghent', country: 'Belgium', category: 'Escort', website: 'http://www.escorte-sofie.be/', image: '/ads/venues/escorte-sofie-1783608668966-3jpKicus7hVzi42t.png' },

  // ── Germany ───────────────────────────────────────────────────────────────
  { name: 'Villa Freiburg', city: 'Freiburg', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://www.villa-freiburg.de/', image: '/ads/venues/villa-freiburg-1784274669597-R1fzKhuIaIWLoxfg.jpg' },
  { name: 'Heaven & Hell Karlsruhe', city: 'Karlsruhe', country: 'Germany', category: "Domina & Fetish", website: 'http://domina-bea.com/', image: '/ads/venues/heaven-hell-karlsruhe-1783213872939-zSvOQGE14SGZya2k.jpg' },
  { name: 'Laufhaus Erospark Karlsruhe', city: 'Karlsruhe', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://www.erospark-karlsruhe.de/', image: '/ads/venues/laufhaus-erospark-karlsruhe-1783604769428-3zE36jD7mg1LtMm2.webp' },
  { name: 'Punktmassage', city: 'Karlsruhe', country: 'Germany', category: "Erotic Massage & Sauna", website: 'http://www.punkt-massage.de/', image: '/ads/venues/punktmassage-1784108475203-NyMVLt1Kn9ZgVlyi.jpeg' },
  { name: 'Vögelnest', city: 'Karlsruhe', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://voegelnest.com/', image: '/ads/venues/vogelnest-1783423272676-blzruvgHdCe9Nnrb.jpg' },
  { name: 'Traumoase Fürth', city: 'Fürth', country: 'Germany', category: "Erotic Massage & Sauna", website: 'http://69bettgeschichten.de/', image: '/ads/venues/traumoase-furth-4AZPZQfNhCyQG30i.jpg' },
  { name: '1001 Nacht', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.club1001nacht.com', image: '/ads/venues/1001-nacht-d9a.jpg' },
  { name: 'Bad Angel', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.bad-angel.de/', image: '/ads/venues/bad-angel-24b.jpg' },
  { name: 'BB 22', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://www.laufhaeuser-muenchen.de/bb22-damen', image: '/ads/venues/bad-angel-24b.jpg' },
  { name: 'Bel Ami', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.belamiclub.de/', image: '/ads/venues/bel-ami-a09.jpg' },
  { name: 'Boobs', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://boobs-tabledance.com/', image: '/ads/venues/boobs-bb6.jpg' },
  { name: 'Caesars World', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://www.caesars-world.de/Home', image: '/ads/venues/caesars-world-8d6.jpg' },
  { name: 'Hansa 9', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://www.laufhaeuser-muenchen.de/hansa9-damen', image: '/ads/venues/1001-nacht-d9a.jpg' },
  { name: 'Leierkasten', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.leierkasten.sexy', image: '/ads/venues/leierkasten-8ec.jpg' },
  { name: 'Madam Strip Club', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://madamstripclub.com/en/', image: '/ads/venues/madam-strip-club-77d.jpg' },
  { name: 'Mon Cherie', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://moncherie.info', image: '/ads/venues/mon-cherie-0f9.jpg' },
  { name: 'Monaco', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.monaco-nightclub.com/', image: '/ads/venues/monaco-ac7.jpg' },
  { name: 'New York', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.newyork-showclub.de/', image: '/ads/venues/new-york-385.jpg' },
  { name: 'No 24', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://www.laufhaeuser-muenchen.de/no24-damen', image: '/ads/venues/1001-nacht-d9a.jpg' },
  { name: 'Queens', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.queenstabledance.com/en/', image: '/ads/venues/queens-ca5.jpg' },
  { name: 'Venus 13', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.sex-ladies-muenchen.de', image: '/ads/venues/venus-13-0fc.jpg' },
  { name: 'Villa Roma', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://villa-roma.de/', image: '/ads/venues/villa-roma-072.jpg' },
  { name: 'Vitalia', city: 'Munich', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://laufhaus-vitalia.de/', image: '/ads/venues/vitalia-bc5.jpg' },
  { name: 'Aller 45', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://aller45-berlin.de/', image: '/ads/venues/aller-45-1783118397778-zLP17EuqAtUADzpz.jpg' },
  { name: 'Amante', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.amante-berlin.de/', image: '/ads/venues/amante-f9b.jpg' },
  { name: 'Artemis', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://fkk-artemis.de/en/home/', image: '/ads/venues/artemis-e9c.jpg' },
  { name: 'Aston', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://aston-berlin.de', image: '/ads/venues/aston-f4a.jpg' },
  { name: 'Aston Berlin', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://aston-berlin.de/', image: '/ads/venues/aston-berlin-1783125669516-dT6pwW22thnXuPJ5.jpg' },
  { name: 'Avarus Berlin', city: 'Berlin', country: 'Germany', category: "Swingers Clubs", website: 'http://www.avarus-berlin.com/', image: '/ads/venues/avarus-berlin-1783457471536-jnKN73Nc1Dcxnd38.png' },
  { name: 'Bizarre Rollenspiele', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.bizarre-rollenspiele.com/', image: '/ads/venues/bizarre-rollenspiele-6d6.jpg' },
  { name: 'Caligula', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.caligula-berlin.de/', image: '/ads/venues/caligula-8e5.jpg' },
  { name: 'Club Butterfly', city: 'Berlin', country: 'Germany', category: "Strip Clubs", website: 'http://butterfly138.de/', image: '/ads/venues/club-butterfly-K4Pw2h7gHpgVOvXl.jpg' },
  { name: 'Culture Houze', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://club-culture-houze.de/eng', image: '/ads/venues/culture-houze-a67.jpg' },
  { name: 'Fabrik Lounge', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.fabriklounge.com/', image: '/ads/venues/fabrik-lounge-503.jpg' },
  { name: 'Feelings - Massagen', city: 'Berlin', country: 'Germany', category: "Erotic Massage & Sauna", website: 'http://www.feelings-massagen.de/', image: '/ads/venues/feelings-massagen-1783619167048-rcG9PR4XS6tWVLB7.jpg' },
  { name: 'Fetisch Hof Berlin', city: 'Berlin', country: 'Germany', category: "Domina & Fetish", website: 'http://fetisch-hof.de/', image: '/ads/venues/fetisch-hof-berlin-1783235170507-2zDve5lLT4O7YjjL.png' },
  { name: 'Flair', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://hauptstadtnummer.com/Flair.html', image: '/ads/venues/flair-955.jpg' },
  { name: 'Fuchs 34', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.fuchs-34.de/index.php', image: '/ads/venues/mond-18-1784039767138-MtB3vxkNClTzVqKP.jpg' },
  { name: 'Gentleman Club 59', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'https://club-59.de', image: '/ads/venues/gentleman-club-59-1783230071129-Z2gr3uFqDThwMyay.jpg' },
  { name: 'Golden Dolls', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.golden-dolls.de/', image: '/ads/venues/golden-dolls--13a.jpg' },
  { name: 'Hauptstadt-Puff', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://www.hauptstadt-puff.de/', image: '/ads/venues/hauptstadt-puff-1783653676926-K8CnqXZUBE3P5vAx.jpg' },
  { name: 'Haus der Lust', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.danziger-61.de/', image: '/ads/venues/haus-der-lust-54e.jpg' },
  { name: 'IDYLLE Erotik & Massagen', city: 'Berlin', country: 'Germany', category: "Erotic Massage & Sauna", website: 'http://www.idylle-massagen.de/', image: '/ads/venues/idylle-erotik-massagen-EJfA9wDJTNAS51eM.jpg' },
  { name: 'Insomnia', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'https://www.insomnia-berlin.de/index.html?lang=en', image: '/ads/venues/insomnia-829.jpg' },
  { name: 'King George Club', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://king-george-club.de/', image: '/ads/venues/king-george-club-1783264868733-P3Rx615lwYtw35rw.png' },
  { name: 'La Rose', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.clublarose.de', image: '/ads/venues/la-rose-bf2.jpg' },
  { name: 'LaLa', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.lala203.de/', image: '/ads/venues/fetisch-hof-berlin-1783235170507-2zDve5lLT4O7YjjL.png' },
  { name: 'Love House', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.lovehouseberlin.de/', image: '/ads/venues/love-house-8ac.jpg' },
  { name: 'Lunacy Berlin', city: 'Berlin', country: 'Germany', category: "Domina & Fetish", website: 'http://www.lunacyberlin.com/', image: '/ads/venues/lunacy-berlin-1784000176084-4MEh2RbHCN1E6cy5.jpg' },
  { name: 'Maria-Brasil', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://brasil.lustgarten.de/', image: '/ads/venues/amante-f9b.jpg' },
  { name: 'Massagestudio Adeliya', city: 'Berlin', country: 'Germany', category: "Erotic Massage & Sauna", website: 'http://ameliya-massagen.de/', image: '/ads/venues/massagestudio-adeliya-rBEeXMnQ5fP2stWD.webp' },
  { name: 'Mond 18', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://www.mond18.de/', image: '/ads/venues/mond-18-1784039767138-MtB3vxkNClTzVqKP.jpg' },
  { name: 'NewVanKampen', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://www.newvankampen.berlin/', image: '/ads/venues/newvankampen-1784054171785-6laDJDk3GLRyXXC0.webp' },
  { name: 'Pankow', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.salonpankow.de/', image: '/ads/venues/pankow-025.jpg' },
  { name: 'Red rose', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://redroseclub.de/ ', image: '/ads/venues/red-rose-f6a.jpg' },
  { name: 'RoyalGirl', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://royalgirl.de/', image: '/ads/venues/royalgirl-1783355177631-e8G72cfxOLFdMbRb.jpg' },
  { name: 'Rush hour', city: 'Berlin', country: 'Germany', category: "Gentlemen's Clubs & Bars", website: 'http://www.rush-hour-berlin.de/', image: '/ads/venues/rush-hour-8cf.jpg' },
  { name: 'Salon Engel', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://www.salon-engel.de/', image: '/ads/venues/salon-engel-1784140567487-34UEr32twSDiHszB.jpg' },
  { name: 'Salon Prestige Berlin', city: 'Berlin', country: 'Germany', category: "Brothels & Laufhaus", website: 'http://salon-prestige-berlin.de/', image: '/ads/venues/salon-prestige-berlin-1783359373020-cadQiviJaXkRwrh8.png' },
]
