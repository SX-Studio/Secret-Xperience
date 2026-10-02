/**
 * Canonical attribute vocabularies shared across the whole platform so the
 * options shown on the create form, the dashboard editor, and every filter
 * stay in lock-step. Add or rename a value here once and it propagates.
 */

/** The single source of truth for ethnicity options (no "Any" — pages prepend that for filters). */
export const ETHNICITIES = [
  'Asian', 'Black', 'Caucasian', 'Latina', 'Middle Eastern',
  'Indian', 'Mixed', 'Eastern European', 'Other',
]

/**
 * Legacy tag values that older listings may carry, mapped to the canonical
 * label above. Keeps previously-saved listings findable & displayable without
 * a data migration.
 */
const ETHNICITY_ALIASES: Record<string, string[]> = {
  black:            ['ebony'],
  caucasian:        ['european'],
  latina:           ['hispanic'],
  'middle eastern': ['arabic'],
}

/** Every lowercase value the tag parser should recognise as an ethnicity (canonical + legacy). */
export const ETHNIC_VALUES = new Set<string>([
  ...ETHNICITIES.map(e => e.toLowerCase()),
  'european', 'ebony', 'arabic', 'hispanic',
])

/** All acceptable lowercase tag values for a selected canonical ethnicity (incl. legacy aliases). */
export function ethnicityMatchValues(canonical: string): string[] {
  const v = canonical.toLowerCase().trim()
  return [v, ...(ETHNICITY_ALIASES[v] || [])]
}

/** Does a single listing tag denote this ethnicity? Handles both `ethnicity: x` and bare `x`. */
export function tagMatchesEthnicity(tag: string, canonical: string): boolean {
  const t = tag.toLowerCase().trim()
  return ethnicityMatchValues(canonical).some(v => t === v || t === `ethnicity: ${v}`)
}

// ── Hair ──────────────────────────────────────────────────────────────────────

/** Canonical hair colour options (no "Any"). */
export const HAIR_COLOURS = [
  'Blonde', 'Brunette', 'Black', 'Red', 'Auburn', 'White / Grey', 'Other',
]

/** Legacy aliases old listings may carry → canonical lowercase. */
const HAIR_ALIASES: Record<string, string[]> = {
  brunette:       ['brown', 'brown hair', 'dark hair', 'dark'],
  black:          ['black hair'],
  red:            ['redhead', 'ginger'],
  'white / grey': ['white', 'grey', 'gray', 'silver'],
}

export const HAIR_VALUES = new Set<string>([
  ...HAIR_COLOURS.map(h => h.toLowerCase()),
  'brown', 'brown hair', 'dark hair', 'dark', 'black hair',
  'redhead', 'ginger', 'white', 'grey', 'gray', 'silver',
])

/** Does a listing tag match a canonical hair colour? Handles prefixed `hair: x` and bare `x`. */
export function tagMatchesHair(tag: string, canonical: string): boolean {
  const t = tag.toLowerCase().trim()
  const v = canonical.toLowerCase()
  const match = (val: string) => t === val || t === `hair: ${val}` || t === `hair:${val}`
  return match(v) || (HAIR_ALIASES[v] ?? []).some(match)
}

// ── Build ─────────────────────────────────────────────────────────────────────

/** Canonical body build options (no "Any"). */
export const BUILDS = [
  'Slim', 'Athletic', 'Curvy', 'Petite', 'Full-figured', 'Muscular', 'Average', 'Other',
]

/** Legacy aliases. */
const BUILD_ALIASES: Record<string, string[]> = {
  'full-figured': ['bbw', 'plus size', 'plus-size', 'curvy plus'],
}

export const BUILD_VALUES = new Set<string>([
  ...BUILDS.map(b => b.toLowerCase()),
  'bbw', 'plus size', 'plus-size',
])

/** Does a listing tag match a canonical build? Handles prefixed `build: x` and bare `x`. */
export function tagMatchesBuild(tag: string, canonical: string): boolean {
  const t = tag.toLowerCase().trim()
  const v = canonical.toLowerCase()
  const match = (val: string) => t === val || t === `build: ${val}` || t === `build:${val}`
  return match(v) || (BUILD_ALIASES[v] ?? []).some(match)
}

// ── Orientation ───────────────────────────────────────────────────────────────

/** Canonical orientation options (filter value → display label). */
export const ORIENTATIONS = [
  { value: 'straight', label: 'Straight' },
  { value: 'gay',      label: 'Gay / Lesbian' },
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'for all',  label: 'For all' },
]

/** Does a listing tag match a canonical orientation? Handles prefixed `orientation: x` and bare `x`. */
export function tagMatchesOrientation(tag: string, canonical: string): boolean {
  const t = tag.toLowerCase().trim()
  const v = canonical.toLowerCase()
  if (v === 'for all') {
    return t === 'for all' || t === 'for-all' || t === 'orientation:for all' || t === 'orientation: for all'
  }
  return t === v || t === `orientation:${v}` || t === `orientation: ${v}`
}

// ── Profile / escort type ───────────────────────────────────────────────────────

/**
 * Filter-key → all lowercase tag values that denote that type. Listings store the
 * type as a prefixed tag (`type:men`, `type:trans woman`) from the create form and
 * dashboard editor, but older/free-text listings may carry bare synonyms — so each
 * key lists every acceptable bare value. Matching also strips a leading `type:`.
 */
const TYPE_SYNONYMS: Record<string, string[]> = {
  'women':       ['women', 'woman', 'female'],
  'men':         ['men', 'man', 'male', 'gigolo'],
  'trans-woman': ['trans woman', 'transwoman', 'transsexual', 'trans-woman', 'ts', 'shemale'],
  'trans-man':   ['trans man', 'transman', 'trans-man'],
  'non-binary':  ['non-binary', 'nonbinary', 'enby', 'non binary'],
  'couples':     ['couples', 'couple', 'duo'],
  'fetish':      ['fetish', 'bdsm', 'domination', 'mistress'],
}

/** Does a listing tag denote this profile type? Handles prefixed `type:x` and bare `x`. */
export function tagMatchesType(tag: string, filterKey: string): boolean {
  const raw = tag.toLowerCase().trim()
  // The create form stores the same fact as `Gender: Trans woman`; treat both prefixes alike.
  const bare = raw.startsWith('type:') ? raw.slice(5).trim() : raw.startsWith('gender:') ? raw.slice(7).trim() : raw
  const syn = TYPE_SYNONYMS[filterKey] ?? [filterKey]
  return syn.includes(bare)
}
