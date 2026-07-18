// Belgium adult venues directory — clubs, brothels, erotic massage, saunas, swingers.
// Data curated from public listings; each entry links to the venue's own website.
// Photos are hosted by the source directory (hotlinked with a gradient fallback).

export type Venue = {
  name: string
  city: string
  category: VenueCategory
  website: string
  image: string
}

export type VenueCategory =
  | 'Gentlemen\'s Clubs & Bars'
  | 'Erotic Massage & Sauna'
  | 'Strip Clubs'
  | 'Swingers Clubs'
  | 'Escort'

export const VENUE_CATEGORY_ORDER: VenueCategory[] = [
  'Gentlemen\'s Clubs & Bars',
  'Erotic Massage & Sauna',
  'Strip Clubs',
  'Swingers Clubs',
  'Escort',
]

export const venues: Venue[] = [
  // ── Gentlemen's Clubs & Bars ──────────────────────────────────────────────
  { name: 'Funny Horse Club', city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'http://www.funnyhorse.be/', image: '/ads/venues/funny-horse-club-0c3.jpg' },
  { name: 'Dorsia Club', city: 'Antwerp', category: "Gentlemen's Clubs & Bars", website: 'http://www.dorsiaclub.be/index.html', image: '/ads/venues/dorsia-club-982.jpg' },
  { name: 'New Club Cocoon', city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'http://www.newclubcocoon.com/site2015/index.php', image: '/ads/venues/new-club-cocoon-ecb.jpg' },
  { name: 'Amnesia Night Club', city: 'Antwerp', category: "Gentlemen's Clubs & Bars", website: 'http://www.clubamnesia.be', image: '/ads/venues/amnesia-night-club-2f0.jpg' },
  { name: 'Bodytalk', city: 'Antwerp', category: "Gentlemen's Clubs & Bars", website: 'http://www.bodytalk69.be', image: '/ads/venues/bodytalk-c9e.jpg' },
  { name: 'Dox', city: 'Antwerp', category: "Gentlemen's Clubs & Bars", website: 'http://www.doxgirls.eu', image: '/ads/venues/dox-608.jpg' },
  { name: 'Myoo', city: 'Antwerp', category: "Gentlemen's Clubs & Bars", website: 'http://www.myoo.be/', image: '/ads/venues/myoo-0a9.jpg' },
  { name: 'Silk', city: 'Antwerp', category: "Gentlemen's Clubs & Bars", website: 'http://www.club-silk.be/', image: '/ads/venues/silk-052.jpg' },
  { name: 'XS Gentlemens Club', city: 'Antwerp', category: "Gentlemen's Clubs & Bars", website: 'http://xsgentlemensclub.com/', image: '/ads/venues/xs-652.jpg' },
  { name: "Charlie's Angels Bar", city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'http://www.sexy-charlies-angels.com/', image: '/ads/venues/charlie-s-angels-bar-37c.jpg' },
  { name: 'Clara Moore', city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'http://en.claramoore.be/', image: '/ads/venues/clara-moore-df6.jpg' },
  { name: 'Le VIP', city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'http://www.euro-vip.com/home_2009.php', image: '/ads/venues/le-vip-02e.jpg' },
  { name: 'Love Bar Room', city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'https://love-bar-room.be/', image: '/ads/venues/love-bar-room-ed7.jpg' },
  { name: 'Mademoiselle X', city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'http://www.mellex.be/', image: '/ads/venues/mademoiselle-x-c39.jpg' },
  { name: 'Mary Hash', city: 'Brussels', category: "Gentlemen's Clubs & Bars", website: 'http://maryhash.be', image: '/ads/venues/mary-hash-c8e.jpg' },
  { name: 'Club Privé 337', city: 'Mouscron', category: "Gentlemen's Clubs & Bars", website: 'http://leclub337.com/', image: '/ads/venues/club-prive-337-1783277776583-TDT8X9IWWkRj3dFt.jpg' },
  { name: 'Club Riviera', city: 'Harelbeke', category: "Gentlemen's Clubs & Bars", website: 'http://www.clubriviera.be/', image: '/ads/venues/club-riviera-1783557368044-ecrRbMH4TCMTbIP8.png' },

  // ── Erotic Massage & Sauna ────────────────────────────────────────────────
  { name: 'De Massagerie', city: 'Antwerp', category: 'Erotic Massage & Sauna', website: 'http://www.massagerie.be/', image: '/ads/venues/de-massagerie-1784026570650-SUv7pxOR5Bf8emSX.jpg' },
  { name: "Men's World", city: 'Antwerp', category: 'Erotic Massage & Sauna', website: 'http://www.mens-world.be/', image: '/ads/venues/mens-world-1784034969208-BRrBizFnnkZDwrgS.jpg' },
  { name: 'Geisha', city: 'Antwerp', category: 'Erotic Massage & Sauna', website: 'http://www.geishamassage.be/', image: '/ads/venues/geisha-8a2.jpg' },
  { name: 'Massage Wereld', city: 'Antwerp', category: 'Erotic Massage & Sauna', website: 'https://www.massagewereld.com/', image: '/ads/venues/massage-wereld-f41.jpg' },
  { name: 'Janphen Thai Massage', city: 'Mechelen', category: 'Erotic Massage & Sauna', website: 'http://www.janphenmassage.be/', image: '/ads/venues/janphen-thai-massage-1783681570521-B37fmoOyCvaT01KG.jpg' },
  { name: 'Bhumjai Thai Massage', city: 'Wommelgem', category: 'Erotic Massage & Sauna', website: 'http://bhumjai.be/', image: '/ads/venues/bhumjai-thai-massage-H5OfHbjpd42L56fs.jpg' },
  { name: 'Alizée Détente', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://www.alizeedetente.com/', image: '/ads/venues/alizee-detente-1783442171808-G2EYXcq82ZR104cE.jpg' },
  { name: 'Aphrodite', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://www.massageaphrodite.be/en/our-center', image: '/ads/venues/aphrodite-557.jpg' },
  { name: 'Aqua Massage', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://www.aquamassagesauna.com/site/welkom-en/', image: '/ads/venues/aqua-massage-d63.jpg' },
  { name: 'Aqua Massage Sauna', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://www.aquamassagesauna.com/', image: '/ads/venues/aqua-massage-sauna-1783452371575-La6BGlb9MZMkqdh0.png' },
  { name: 'Bo Karma', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'https://www.bokarma.be/', image: '/ads/venues/bo-karma-723.jpg' },
  { name: 'Jardins Secret', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://www.jardins-secret.be/fr/centre-massage-1830', image: '/ads/venues/jardins-secret-0db.jpg' },
  { name: 'Le Hammam', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'https://www.lehammam.be/', image: '/ads/venues/le-hammam-b94.jpg' },
  { name: 'Sweetness', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://www.sweetness-massage.be/', image: '/ads/venues/sweetness-dd6.jpeg' },
  { name: 'Vertigo', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://vertigobrusselsmassage.be/', image: '/ads/venues/vertigo-994.jpg' },
  { name: 'Anna Berry Louise', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'http://annaberry.be/en/salon-louise/', image: '/ads/venues/anna-berry-louise-53d.jpg' },
  { name: 'Anna Berry Schuman', city: 'Brussels', category: 'Erotic Massage & Sauna', website: 'https://annaberry.be/en/salon-schuman/', image: '/ads/venues/anna-berry-schuman-bbb.jpg' },
  { name: 'Victoria Secret Garden', city: 'Meise', category: 'Erotic Massage & Sauna', website: 'http://www.victoriasecretgarden.be/', image: '/ads/venues/victoria-secret-garden-1784272272921-ryCByQFn6BXJosbV.jpg' },
  { name: 'Dreams Club', city: 'Wevelgem', category: 'Erotic Massage & Sauna', website: 'http://www.dreams-erotic-massage.be/', image: '/ads/venues/dreams-club-1783588270207-kwsuwxfBDX9exvb5.jpg' },

  // ── Strip Clubs ───────────────────────────────────────────────────────────
  { name: 'Abilux Stripclub', city: 'Antwerp', category: 'Strip Clubs', website: 'http://abilux.be/', image: '/ads/venues/abilux-stripclub-8dd.jpg' },

  // ── Swingers Clubs ────────────────────────────────────────────────────────
  { name: 'Le Frisson', city: 'Pin (Habay)', category: 'Swingers Clubs', website: 'http://lefrisson.be/', image: '/ads/venues/le-frisson-1783278076463-EAwQyohdbNkQunVf.jpg' },

  // ── Escort ────────────────────────────────────────────────────────────────
  { name: 'Escorte Sofie', city: 'Ghent', category: 'Escort', website: 'http://www.escorte-sofie.be/', image: '/ads/venues/escorte-sofie-1783608668966-3jpKicus7hVzi42t.png' },
]
