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
const STRIP_OVERRIDE = new Set(['Amnesia Night Club', 'Myoo'])
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
    image: v.image,
  }))

const EXTRA: BeVenue[] = [
  // ── Swingers clubs ──
  {
    name: 'Acanthus', type: 'Swingers clubs', city: 'Harelbeke', address: 'Brugsesteenweg 24b, 8531 Harelbeke',
    hours: 'Mon 19:00–02:00 · Fri 18:00–01:00 · Sat 20:00–05:00',
    note: 'Calls itself the largest swingers club in Flanders: two dance floors, an erotic cinema, garden, saunas and jacuzzis, and a buffet.',
    website: 'https://www.parenclubacanthus.be/',
    nights: [
      { day: 1, title: 'Monday night', from: '19:00', to: '02:00' },
      { day: 5, title: 'Friday night', from: '18:00', to: '01:00' },
      { day: 6, title: 'Saturday night', from: '20:00', to: '05:00' },
    ],
    source: 'parenclubacanthus.be; vice.com',
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
  'le-frisson': { note: 'Libertine club in the Belgian Ardennes, known for large themed evenings.' },
}

const extraSlugs = new Set(EXTRA.map(v => v.slug))

export const BE_VENUES: BeVenue[] = [
  ...FROM_DIRECTORY.filter(v => !extraSlugs.has(v.slug)).map(v => ({ ...v, ...FROM_DIRECTORY_ENRICH[v.slug] })),
  ...EXTRA,
]
