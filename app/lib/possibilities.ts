/**
 * Structured service "Possibilities" menu for escort / private-reception style
 * listings. Grouped exactly like the major EU directories so advertisers can tick
 * what they offer and clients see a clean, scannable checklist on the listing.
 *
 * Stored on `listings.services` as a flat string[] of the selected labels;
 * grouped back into sections at display time via POSSIBILITY_GROUPS.
 */

export interface PossibilityGroup {
  key: string
  label: string
  items: string[]
}

export const POSSIBILITY_GROUPS: PossibilityGroup[] = [
  {
    key: 'massage',
    label: 'Massage',
    items: [
      'Body to body', 'California massage', 'Erotic massage', 'Hot stone massage',
      'Massage', 'Happy ending massage (manual)', 'Happy ending massage (oral)',
      'Massage on massage table', 'Nuru massage', 'Prostate massage',
      'Sensual massage', 'Tantra massage',
    ],
  },
  {
    key: 'foreplay',
    label: 'Foreplay',
    items: [
      'Anal fingering', 'Cunnilingus', 'With dental dam', 'Deepthroat', 'With condom',
      'To the end', 'Without a condom', 'Nipple sucking', 'French kissing',
      'Fingering', 'Kissing',
    ],
  },
  {
    key: 'intimate',
    label: 'Intimate',
    items: [
      'Anal (Greek)', 'Games', 'Double penetration', 'Own orgasm possible',
      'Fisting (giving)', 'Fisting (receiving)', 'Manual orgasm',
      'Intimate with condom', 'Intimate without a condom', 'Cum in mouth (CIM)',
      'Cumming on breasts / body', 'Facial cum', 'Multiple orgasms',
      'Russian (between the breasts)', 'Spanish (between the buttocks)',
      'Cum swallow',
    ],
  },
  {
    key: 'fetish',
    label: 'Fetish',
    items: [
      'Bondage (master)', 'Bondage (slave)', 'Facesitting', 'Gangbang',
      'Golden shower (giving)', 'Golden shower (receiving)', 'Rimming (giving)',
      'Rimming (receiving)', 'Role play', 'SM master hard', 'SM master soft',
      'SM slave hard', 'SM slave soft', 'Spanking', 'Squirt', 'Strapon',
      'Foot fetish',
    ],
  },
  {
    key: 'other',
    label: 'Other services',
    items: [
      'Visit to swingers club', 'Outdoor sex', 'Cardate', 'Dinnerdate',
      'Shower options', 'Film or photo', 'Overnight stay', 'Partner swap',
      'Sauna (guidance)', 'Striptease', 'Trio (M/M/W)', 'Trio (M/F/W)',
      'Virtual sex', 'Quickie', 'Female condom', 'Business trip domestic',
      'Business trip abroad',
    ],
  },
]

/** All valid possibility labels (for validation). */
export const ALL_POSSIBILITIES = new Set(POSSIBILITY_GROUPS.flatMap(g => g.items))

/** Categories that get the structured Possibilities menu. */
export const POSSIBILITY_CATEGORIES = new Set([
  'escorts', 'companionship', 'massage', 'domination', 'adult',
])

/** Group a flat list of selected labels back into their sections, preserving group order. */
export function groupSelected(selected: string[]): { label: string; items: string[] }[] {
  const set = new Set(selected)
  return POSSIBILITY_GROUPS
    .map(g => ({ label: g.label, items: g.items.filter(i => set.has(i)) }))
    .filter(g => g.items.length > 0)
}
