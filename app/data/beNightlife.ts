// Belgian adult nightlife directory for /nightlife: private bars & clubs,
// swingers clubs, saunas, strip clubs and fetish venues.
//
// Two sources:
//  1. the Belgian entries of app/data/venues.ts (photos already in /public/ads/venues)
//  2. EXTRA below — venues found in public sources on 2026-11-25 (address,
//     hours and regular nights as those sources state them; `source` says where).
// Regular nights feed the agenda on the page; one-off events come from the
// `events` table (Admin → Events). Business details only — never a person's name.

import { venues } from './venues'

export type BeType = 'Private bars & clubs' | 'Swingers clubs' | 'Saunas & massage' | 'Strip clubs' | 'Fetish'

export const BE_TYPES: BeType[] = ['Private bars & clubs', 'Swingers clubs', 'Saunas & massage', 'Strip clubs', 'Fetish']

export interface RegularNight {
  /** 0 = Sunday … 6 = Saturday */
  day: number
  title: string
  from?: string
  to?: string
}

export interface BeVenue {
  slug: string
  name: string
  type: BeType
  /** Card label when it differs from the type's short name. */
  label?: string
  city: string
  address?: string
  hours?: string
  note?: string
  tags?: string[]
  website?: string
  image?: string
  nights?: RegularNight[]
  source?: string
}

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const TYPE_FROM_CATEGORY: Record<string, BeType | undefined> = {
  "Gentlemen's Clubs & Bars": 'Private bars & clubs',
  'Erotic Massage & Sauna': 'Saunas & massage',
  'Strip Clubs': 'Strip clubs',
  'Swingers Clubs': 'Swingers clubs',
  'Domina & Fetish': 'Fetish',
  'Brothels & Laufhaus': 'Private bars & clubs',
}

// Lap/strip clubs filed under "Gentlemen's Clubs" in venues.ts.
const STRIP_OVERRIDE = new Set(['Amnesia Night Club', 'Myoo', 'Club Riviera'])

// Directory photos whose subject is a model rather than the venue (owner,
// 2026-11-25: show interiors only). These cards fall back to the placeholder
// until an interior photo from the venue's own site is added below.
const MODEL_PHOTOS = new Set([
  'Dorsia Club', 'New Club Cocoon', 'Amnesia Night Club', 'Bodytalk', 'Dox', 'Clara Moore', 'Le VIP',
  'Love Bar Room', 'Mademoiselle X', 'Mary Hash', 'Club Privé 337', 'Club Riviera', 'De Massagerie',
  'Massage Wereld', 'Janphen Thai Massage', 'Alizée Détente', 'Aphrodite', 'Aqua Massage Sauna', 'Bo Karma',
  'Jardins Secret', 'Le Hammam', 'Sweetness', 'Vertigo', 'Anna Berry Louise', 'Anna Berry Schuman',
  'Victoria Secret Garden', 'Abilux Stripclub', "Men's World", "Charlie's Angels Bar", 'Funny Horse Club',
])
const CITY_OVERRIDE: Record<string, string> = { 'Pin (Habay)': 'Chiny' }

const FROM_DIRECTORY: BeVenue[] = venues
  .filter(v => v.country === 'Belgium' && TYPE_FROM_CATEGORY[v.category])
  .map(v => ({
    slug: slug(v.name),
    name: v.name,
    type: STRIP_OVERRIDE.has(v.name) ? 'Strip clubs' : TYPE_FROM_CATEGORY[v.category]!,
    city: CITY_OVERRIDE[v.city] || v.city,
    label: v.category === 'Erotic Massage & Sauna' && !/sauna|hammam/i.test(v.name) ? 'Massage' : undefined,
    website: v.website,
    image: MODEL_PHOTOS.has(v.name) ? undefined : v.image,
  }))

const EXTRA: BeVenue[] = [
  // ── Swingers clubs ──
  {
    name: 'Acanthus', type: 'Swingers clubs', city: 'Harelbeke', address: 'Brugsesteenweg 24b, 8531 Harelbeke',
    hours: 'Mon 19:00–01:00 · Fri 20:00–03:00 · Sat 20:00–05:00 · couple from €80',
    note: 'Calls itself the largest swingers club in Flanders: two dance floors, an erotic cinema, garden, saunas and jacuzzis, and a buffet.',
    website: 'https://www.parenclubacanthus.be/',
    nights: [
      { day: 1, title: 'Monday night', from: '19:00', to: '01:00' },
      { day: 5, title: 'Friday night', from: '20:00', to: '03:00' },
      { day: 6, title: 'Saturday night', from: '20:00', to: '05:00' },
    ],
    source: 'parenclubacanthus.be; acanthus.be/nl/events; vice.com',
  },
  { name: 'Eroxx', type: 'Swingers clubs', city: 'Balen', note: 'Swingers club with a disco and a restaurant.', source: 'vrt.be (2025)' },
  { name: 'Cap Hot', type: 'Swingers clubs', city: 'Menen', address: 'Rue de Bousbecque 20, 8930 Menen', note: 'Swingers club, recently extended on the ground floor.', source: 'petitfute.com' },
  { name: 'Le Pas-Sage Secret', type: 'Swingers clubs', city: 'Anderlues', address: 'Chaussée de Thuin 429, 6150 Anderlues', note: 'Libertine club built around wellness.', source: 'petitfute.com' },
  { name: 'Le Mi-Noï', type: 'Swingers clubs', city: 'Pecq', address: 'Chaussée de Courtrai 68, 7740 Pecq', note: 'Libertine club.', source: 'petitfute.com' },
  { name: 'Le Phénix', type: 'Swingers clubs', city: 'Blegny', address: 'Barchon, 4671 Blegny', note: 'Libertine club in the province of Liège, open to everyone; evenings start with a drink and dancing.', source: 'lavenir.net (2025)' },

  // ── Saunas ──
  { name: 'La Griffe', type: 'Saunas & massage', city: 'Brussels', address: 'Rue de Dinant 41-43, 1000 Brussels', note: 'Recently renovated sauna in the city centre.', source: 'petitfute.com' },
  { name: 'Club 3000', type: 'Saunas & massage', city: 'Brussels', address: 'Boulevard Jamar 9, 1060 Brussels', note: 'Large sauna near Brussels-Midi station.', source: 'petitfute.com' },
  { name: 'Macho Sauna', type: 'Saunas & massage', city: 'Brussels', address: 'Rue du Marché au Charbon 106, 1000 Brussels', tags: ['Men only'], note: 'Gay sauna in the city centre.', source: 'misterbandb.com' },
  { name: "L'Oasis", type: 'Saunas & massage', city: 'Brussels', address: 'Rue Van Orley 10, 1000 Brussels', tags: ['Men only'], note: 'Men-only sauna in a renovated townhouse near Botanique and Madou.', source: 'misterbandb.com' },
  { name: 'Spades4Gents', type: 'Saunas & massage', city: 'Ghent', tags: ['Men only'], note: 'Modern 850 m² gay sauna, walking distance from Gent-Sint-Pieters station; reopened late 2025.', source: 'misterbandb.com' },
  { name: "Sauna 't Herenhuis", type: 'Saunas & massage', city: 'Antwerp', address: 'De Lescluzestraat 63, 2600 Antwerp', tags: ['Men only'], note: 'Gay sauna in a converted townhouse with a 15-person jacuzzi, dry sauna and steam room.', source: 'travelgay.com' },
  { name: 'Sauna Aquarius', type: 'Saunas & massage', city: 'Ostend', address: 'Peter Benoitstraat 77, 8400 Ostend', note: 'Sauna in a townhouse with steam room, jacuzzi, cabins and bar; open to couples, bi men and women.', source: 'travelgay.com' },
  { name: 'Max21', type: 'Saunas & massage', city: 'Kortrijk', address: 'Heule, 8501 Kortrijk', note: 'Intimate mixed sauna of about 400 m² with dry sauna and hammam.', source: 'misterbandb.com' },
  { name: 'Le 139', type: 'Saunas & massage', city: 'Liège', tags: ['Men only'], hours: 'Tue–Fri 14:00–23:00 · entry €12', note: 'Men-only sauna with infrared cabin and private cabins.', source: 'misterbandb.com' },

  // ── Fetish ──
  {
    name: "Le Chap's", type: 'Fetish', city: 'Liège', tags: ['Men only', 'Dress code'],
    note: 'Men-only fetish club with two equipped rooms and a maze. Dress code: leather, latex, uniforms, sneakers.',
    nights: [
      { day: 3, title: 'Naked party' },
      { day: 0, title: 'Naked party' },
      { day: 5, title: 'All Fantasies' },
    ],
    source: 'misterbandb.com',
  },
  { name: "The Kinky's", type: 'Fetish', city: 'Antwerp', address: 'Lange Beeldekensstraat 10, 2000 Antwerp', tags: ['Men only', 'Dress code'], note: 'Leather and fetish venue a short walk from the centre.', source: 'petitfute.com; misterbandb.com' },
  { name: 'The Boots', type: 'Fetish', city: 'Antwerp', address: 'Van Aerdtstraat 22, Antwerp', tags: ['Men only', 'Members card', 'Dress code'], note: 'Leather and fetish club on six floors; membership card bought on site with ID.', source: 'misterbandb.com' },

  // ── Strip clubs ──
  { name: "Club 't Hazepad", type: 'Strip clubs', city: 'Antwerp', note: 'Lap club running for more than 20 years.', source: 'maximise.co.uk' },
].map(v => ({ ...v, slug: slug(v.name) } as BeVenue))

// Directory entries that EXTRA describes in more detail.
const FROM_DIRECTORY_ENRICH: Record<string, Partial<BeVenue>> = {
  'le-frisson': {
    address: 'Rue Albert 1er 134, 6810 Pin (Chiny)',
    note: 'Libertine club in the Belgian Ardennes with a sauna, jacuzzi, mezzanine and themed alcoves; known for large themed evenings.',
    image: 'https://lefrisson.be/storage/gallery/wp-1278.jpg',
    website: 'https://lefrisson.be/agenda',
  },
  'club-prive-337': {
    address: 'Boulevard des Alliés 337, 7700 Mouscron',
    hours: 'Every day 14:00–05:00 · with or without appointment',
    note: 'Private champagne bar where hostesses welcome guests in an intimate setting, with a jacuzzi.',
    image: 'https://leclub337.com/wp-content/uploads/2022/04/600x700_club-337-jacuzzi-copie-1.jpg',
  },
  'de-massagerie': {
    address: 'Ijzerlaan 39-41, 2060 Antwerp',
    hours: 'Mon–Fri 10:30–22:00 · Sat, Sun & holidays 12:00–22:00',
    note: 'Massage studio offering erotic and tantra massage in a discreet setting.',
    image: 'https://static.wixstatic.com/media/c67807_c656edfbd6f84f608a8b376359bdfe38~mv2.jpg/v1/fill/w_640,h_760,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/High-End%20Interior%20Photo%20Edit_edited.jpg',
  },
  'bo-karma': {
    address: 'Rue de Livourne 88, 1050 Brussels',
    hours: 'Mon–Fri 10:30–20:00 · Sat–Sun 12:00–18:00',
    note: "Tantric massage salon in Brussels' Louise district, with massages, rituals and workshops.",
  },
  'clara-moore': {
    hours: 'Mon–Fri 11:00–22:00 · Sat–Sun 13:00–19:00',
    note: 'Wellness centre of about 230 m² near central Brussels with tantric massage, aquamassage, jacuzzi and sauna.',
  },
  'alizee-detente': {
    address: 'Avenue de la Floride 152, 1180 Uccle (Brussels)',
    hours: 'Mon–Fri 10:30–22:00 · Sat 12:00–18:30 · Sun closed',
    note: 'Massage salon in Uccle offering Nuru, tantric and erotic massage, plus a VIP service.',
  },
  vertigo: {
    hours: 'Mon–Fri 10:00–19:00 · weekends & holidays 13:00–18:00 · by appointment',
    note: 'Massage studio in Brussels for erotic and tantric sessions with warm oil; exact address shared on booking.',
    image: 'https://vertigomassage.be/wp-content/uploads/2023/10/salon-massage-vertigo-a-bruxelles.jpg.webp',
    website: 'https://vertigomassage.be/',
  },
  'victoria-secret-garden': {
    address: 'Nieuwelaan 81, 1860 Meise',
    hours: 'Mon–Fri 10:00–20:00 · Sat 12:00–20:00 · with or without appointment',
    note: 'Massage salon offering tantric and erotic massage.',
  },
  'aqua-massage-sauna': {
    address: 'Sint-Bernardusstraat 19, 1060 Sint-Gillis (Brussels)',
    hours: 'Mon–Fri 11:00–22:00 · Sat–Sun 12:00–22:00',
    note: 'Massage venue with female and male staff, private rooms and private parking.',
  },
  'mary-hash': {
    city: 'Namur',
    address: 'Boulevard de la Meuse 68, 5100 Namur',
    hours: 'Mon–Fri 09:00–18:00 · weekends closed',
    note: 'Tantric massage centre that calls itself the first of its kind in Belgium.',
  },
  bodytalk: { website: undefined, note: 'Website currently offline.' },
  'janphen-thai-massage': {
    address: 'Zandpoortvest 29, 2800 Mechelen',
    hours: 'Mon–Fri 10:00–21:00 · Sat 10:00–18:00',
    note: 'Salon in central Mechelen offering Thai, body and erotic massage.',
    website: 'https://www.janphenthaimassage.com/',
  },
  'funny-horse-club': {
    address: 'Rue de Livourne 37, 1050 Brussels',
    hours: 'Open from 22:00',
    note: 'Social bar promising a relaxed atmosphere, security and discretion.',
  },
  'club-riviera': {
    address: 'Kortrijksesteenweg 227, 8530 Harelbeke',
    hours: 'Sun–Thu 17:00–03:00 · Fri–Sat 18:00–05:00',
    note: "Gentlemen's club near Kortrijk with striptease shows, lap dances and private rooms with jacuzzi; own parking.",
  },
}

const extraSlugs = new Set(EXTRA.map(v => v.slug))

export const BE_VENUES: BeVenue[] = [
  ...FROM_DIRECTORY.filter(v => !extraSlugs.has(v.slug)).map(v => ({ ...v, ...FROM_DIRECTORY_ENRICH[v.slug] })),
  ...EXTRA,
]
