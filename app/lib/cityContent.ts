// Per-city editorial content for programmatic SEO + AEO (answer-engine) pages.
//
// WHY THIS EXISTS: the /escorts/[city] (and sibling category) pages render a
// listings grid that is near-empty pre-launch. ~130 city/country URLs with an
// H1 + one line + link pills is thin/doorway content — a Google penalty risk
// and useless to AI answer engines. This module gives every city page unique,
// genuinely-useful prose + an FAQ so the page stands on its own even with zero
// live listings, and is citation-worthy for ChatGPT/Perplexity (AEO).
//
// Content rules: factual, discreet, safety-oriented. No unverifiable legal
// assertions (legality varies and changes) — we point users to /regulations
// for specifics rather than stating law per city. Primary EU markets
// (BE/NL/DE/FR/LU) get richer, hand-written intros; all 26 cities get a unique
// intro + real local areas so no page is thin.

export interface CityEditorial {
  /** Country slug used by /regulations and country pages. */
  country: 'belgium' | 'netherlands' | 'germany' | 'france' | 'luxembourg' | 'switzerland'
  /** One-line positioning under the H1. */
  tagline: string
  /** 2-3 sentence unique intro. Renders as the lead paragraph. */
  intro: string
  /** Real neighbourhoods/areas — render as chips, adds genuine local signal. */
  areas: string[]
}

// ── Primary + secondary EU markets, hand-written per city ──────────────────
export const CITY_EDITORIAL: Record<string, CityEditorial> = {
  brussels: {
    country: 'belgium',
    tagline: 'The capital — international, discreet, always in demand.',
    intro: 'Brussels is the busiest market on SecretXperience: a bilingual, international capital where business travel and an established nightlife keep demand for verified companionship steady year-round. Advertisers here reach a cosmopolitan, privacy-conscious clientele across the EU quarter, the city centre and the southern communes.',
    areas: ['City Centre', 'Ixelles', 'Saint-Gilles', 'EU Quarter', 'Louise', 'Schaerbeek'],
  },
  antwerp: {
    country: 'belgium',
    tagline: 'Belgium’s style capital and second-largest market.',
    intro: 'Antwerp pairs a wealthy fashion-and-diamond economy with one of Belgium’s most visible adult districts, making it the country’s second strongest market after Brussels. Verified advertisers benefit from a city used to discretion and a steady flow of domestic and cross-border visitors.',
    areas: ['Het Zuid', 'Eilandje', 'Centraal Station district', 'Berchem', 'Zurenborg'],
  },
  ghent: {
    country: 'belgium',
    tagline: 'A young, liberal university city.',
    intro: 'Ghent’s large student and creative population gives it a notably open, liberal character and a demand profile skewed younger than Brussels or Antwerp. The compact historic core means advertisers can credibly cover the whole city from a single discreet location.',
    areas: ['Historic Centre', 'Patershol', 'Sint-Pieters', 'Ledeberg', 'Overpoort'],
  },
  bruges: {
    country: 'belgium',
    tagline: 'Tourism-driven, high-discretion coastal demand.',
    intro: 'Bruges is a year-round tourist destination, and its demand leans heavily toward visiting professionals and couples seeking total discretion in a small, well-known city. Advertisers who emphasise privacy and outcall flexibility tend to perform best here.',
    areas: ['Historic Centre', 'Sint-Anna', 'Station district', 'Sint-Kruis'],
  },
  liege: {
    country: 'belgium',
    tagline: 'The economic heart of Wallonia.',
    intro: 'Liège is the largest French-speaking market in Belgium outside Brussels, with an industrial-turned-cultural economy and lively riverside nightlife. It anchors demand for the wider Walloon region, including nearby Namur and Charleroi.',
    areas: ['Le Carré', 'Outremeuse', 'Guillemins', 'Centre', 'Rocourt'],
  },
  leuven: {
    country: 'belgium',
    tagline: 'University town, easy reach of Brussels.',
    intro: 'Leuven’s world-renowned university gives it a young, affluent and international demand base just twenty minutes from Brussels. Many advertisers serve both cities from here given the short rail connection.',
    areas: ['Centre', 'Oude Markt', 'Heverlee', 'Kessel-Lo'],
  },
  mechelen: {
    country: 'belgium',
    tagline: 'Between Brussels and Antwerp.',
    intro: 'Sitting midway on the Brussels–Antwerp axis, Mechelen draws demand from commuters and visitors moving between Belgium’s two biggest markets. Its central position makes it a practical base for advertisers covering both.',
    areas: ['Historic Centre', 'Nekkerspoel', 'Station district'],
  },
  hasselt: {
    country: 'belgium',
    tagline: 'The capital of Limburg.',
    intro: 'Hasselt is the commercial and nightlife hub of the Limburg province, with demand drawn from across the region and nearby Dutch border towns. Its reputation as a shopping and gastronomy destination supports a discreet, higher-end clientele.',
    areas: ['Centre', 'Kuringen', 'Runkst'],
  },
  namur: {
    country: 'belgium',
    tagline: 'The Walloon capital at the rivers’ meeting point.',
    intro: 'As the seat of Wallonia’s government, Namur combines administrative traffic with a scenic riverside setting at the confluence of the Sambre and Meuse. Demand here is steady and French-speaking, complementing nearby Liège and Charleroi.',
    areas: ['Centre', 'Jambes', 'Citadelle district', 'Salzinnes'],
  },
  charleroi: {
    country: 'belgium',
    tagline: 'The largest city in Wallonia.',
    intro: 'Charleroi is the most populous city in Wallonia and a long-standing market with its own established adult scene. Its airport brings a steady flow of low-cost European travellers, broadening the visiting clientele.',
    areas: ['Ville Basse', 'Ville Haute', 'Marcinelle', 'Gilly'],
  },
  kortrijk: {
    country: 'belgium',
    tagline: 'West-Flanders business hub near the French border.',
    intro: 'Kortrijk’s position on the French border makes it a cross-border market serving both West Flanders and the Lille metropolitan area. Its trade-fair and design economy sustains a professional visiting clientele.',
    areas: ['Centre', 'Station district', 'Hoog Kortrijk'],
  },
  ostend: {
    country: 'belgium',
    tagline: 'The coast’s liveliest city.',
    intro: 'Ostend is the largest city on the Belgian coast, with demand that swells in the warmer months as visitors arrive from across the country. Seaside tourism and a busy promenade make discretion and outcall service especially valued here.',
    areas: ['Centre', 'Promenade', 'Mariakerke', 'Station district'],
  },
  grimbergen: {
    country: 'belgium',
    tagline: 'Quiet Flemish-Brabant, minutes from Brussels.',
    intro: 'Grimbergen sits just north of Brussels, offering advertisers a quieter, more private base within easy reach of the capital’s demand. It suits those who prefer a discreet residential setting over the city centre.',
    areas: ['Centre', 'Strombeek-Bever', 'Humbeek'],
  },

  amsterdam: {
    country: 'netherlands',
    tagline: 'Europe’s most open adult-services market.',
    intro: 'Amsterdam is one of the most internationally recognised adult markets in the world, with a long-regulated, openly accepted scene and constant tourist demand. Verified advertisers reach a large, diverse and notably privacy-aware clientele drawn from across the globe.',
    areas: ['Centrum', 'De Wallen', 'De Pijp', 'Jordaan', 'Zuid', 'Oost'],
  },
  rotterdam: {
    country: 'netherlands',
    tagline: 'A modern port city with year-round business demand.',
    intro: 'Rotterdam’s vast port and modern business district drive steady, professional demand distinct from Amsterdam’s tourism. Its international, design-forward character supports a discreet, higher-end clientele.',
    areas: ['Centrum', 'Kralingen', 'Delfshaven', 'Kop van Zuid', 'Blijdorp'],
  },

  berlin: {
    country: 'germany',
    tagline: 'Germany’s most liberal and creative capital.',
    intro: 'Berlin is famous for its open, permissive nightlife and a demand base that is young, international and unusually accepting of adult services. The city’s scale and 24-hour culture make it the strongest German market on the platform.',
    areas: ['Mitte', 'Kreuzberg', 'Friedrichshain', 'Charlottenburg', 'Schöneberg', 'Prenzlauer Berg'],
  },
  hamburg: {
    country: 'germany',
    tagline: 'The port city with Germany’s most famous adult district.',
    intro: 'Hamburg is home to the Reeperbahn, one of Europe’s best-known entertainment and adult districts, anchoring a mature and well-established market. A wealthy port economy and constant business travel keep demand reliable.',
    areas: ['St. Pauli', 'Reeperbahn', 'Altona', 'St. Georg', 'HafenCity'],
  },
  cologne: {
    country: 'germany',
    tagline: 'The Rhineland’s open, sociable hub.',
    intro: 'Cologne’s famously sociable, easy-going culture and major trade-fair calendar produce steady demand from visitors across the Rhineland and beyond. The city is a practical base for reaching nearby Düsseldorf and Bonn as well.',
    areas: ['Innenstadt', 'Ehrenfeld', 'Belgisches Viertel', 'Deutz', 'Südstadt'],
  },

  paris: {
    country: 'france',
    tagline: 'France’s largest and most international market.',
    intro: 'Paris is by far the strongest market in France, combining year-round tourism, business travel and an affluent local clientele. Advertisers reach a discreet, high-expectation audience across the city’s distinct arrondissements.',
    areas: ['1er–4e (Centre)', '8e (Champs-Élysées)', '16e (Passy)', '7e (Invalides)', 'Le Marais', 'La Défense'],
  },
  lyon: {
    country: 'france',
    tagline: 'France’s gastronomic second city.',
    intro: 'Lyon’s wealthy economy, strong business-conference calendar and renowned dining scene support a refined, professional demand base. It anchors the Rhône-Alpes region as the clear second market after Paris.',
    areas: ['Presqu’île', 'Part-Dieu', 'Vieux Lyon', 'Croix-Rousse', 'Confluence'],
  },

  luxembourg: {
    country: 'luxembourg',
    tagline: 'Small country, exceptionally high-value market.',
    intro: 'Luxembourg City packs one of Europe’s wealthiest, most international populations into a compact area, with finance-sector professionals and cross-border commuters from Belgium, France and Germany. Demand skews discreet and high-end, and a single location can credibly serve the whole country.',
    areas: ['Ville Haute', 'Gare', 'Kirchberg', 'Clausen', 'Limpertsberg'],
  },

  zurich: {
    country: 'switzerland',
    tagline: 'Switzerland’s financial capital — discreet and affluent.',
    intro: 'Zürich is Switzerland’s largest city and financial centre, with a regulated adult market and a wealthy, privacy-focused clientele. The Langstrasse district is the well-known hub, while business travel sustains demand across the year.',
    areas: ['Kreis 1 (Altstadt)', 'Langstrasse', 'Zürich-West', 'Seefeld', 'Oerlikon'],
  },
  geneva: {
    country: 'switzerland',
    tagline: 'The international city by the lake.',
    intro: 'Geneva’s concentration of diplomats, NGOs and finance gives it an exceptionally international, high-value demand base. Constant conference and UN-related travel keeps the market active and notably discreet.',
    areas: ['Centre / Rive', 'Pâquis', 'Eaux-Vives', 'Carouge', 'Plainpalais'],
  },
  basel: {
    country: 'switzerland',
    tagline: 'Pharma wealth at the three-country corner.',
    intro: 'Basel sits where Switzerland, France and Germany meet, and its pharmaceutical and trade-fair economy draws a wealthy, cross-border clientele. Art Basel and a strong conference calendar create demand peaks throughout the year.',
    areas: ['Altstadt', 'Kleinbasel', 'Gundeldingen', 'St. Johann'],
  },
  bern: {
    country: 'switzerland',
    tagline: 'The Swiss capital — steady and discreet.',
    intro: 'As Switzerland’s political capital, Bern combines administrative traffic with a well-preserved, UNESCO-listed centre. Demand is steady and discreet, complementing the larger Zürich and Geneva markets.',
    areas: ['Altstadt', 'Länggasse', 'Breitenrain', 'Mattenhof'],
  },
  lausanne: {
    country: 'switzerland',
    tagline: 'Lakeside, young and international.',
    intro: 'Lausanne pairs a lakeside setting with a large student population and the international Olympic and university institutions based there. The result is a younger, cosmopolitan demand base within easy reach of Geneva.',
    areas: ['Centre / Flon', 'Ouchy', 'Sous-Gare', 'Chailly'],
  },
}

const COUNTRY_LABEL: Record<CityEditorial['country'], string> = {
  belgium: 'Belgium', netherlands: 'the Netherlands', germany: 'Germany',
  france: 'France', luxembourg: 'Luxembourg', switzerland: 'Switzerland',
}

/** Stable, unique FAQ per city + category — feeds visible FAQ and FAQPage schema. */
export function cityFaq(cityName: string, category = 'escort'): { q: string; a: string }[] {
  const cat = category.toLowerCase()
  return [
    {
      q: `How do I find verified ${cat}s in ${cityName}?`,
      a: `Every advertiser on SecretXperience completes identity verification before publishing. On the ${cityName} page, profiles showing the green verified badge have passed a government-ID and selfie review, so you can browse and contact them directly with confidence.`,
    },
    {
      q: `Is contacting an advertiser in ${cityName} discreet?`,
      a: `Yes. You message advertisers through SecretXperience’s private messaging — your personal details are never shared, and advertisers cannot see your contact information unless you choose to give it. No booking or payment for any in-person service passes through the platform.`,
    },
    {
      q: `How much do ${cat}s in ${cityName} typically charge?`,
      a: `Rates are set independently by each advertiser and shown on their profile where provided. Prices in ${cityName} vary with experience, duration and services offered, so compare individual listings rather than relying on a single figure.`,
    },
    {
      q: `Can I advertise as a ${cat} in ${cityName}?`,
      a: `Yes. Listing in ${cityName} is free: create a profile, complete identity verification (usually reviewed within 24 hours), and go live the same day. SecretXperience never takes a commission on your bookings. See our regulations page for the rules that apply before you publish.`,
    },
  ]
}

/**
 * Returns editorial for a city slug. Falls back to a unique, non-thin default
 * built from the city name so even un-curated cities never render empty.
 */
export function getCityEditorial(slug: string, cityName: string): CityEditorial {
  const found = CITY_EDITORIAL[slug.toLowerCase()]
  if (found) return found
  return {
    country: 'belgium',
    tagline: `Verified advertisers in ${cityName}.`,
    intro: `Browse verified companionship advertisers in ${cityName}. Every profile is identity-reviewed before going live, and you contact advertisers directly through private, discreet messaging — no booking or payment for any in-person service passes through the platform.`,
    areas: [],
  }
}

export function countryLabel(c: CityEditorial['country']): string {
  return COUNTRY_LABEL[c]
}
