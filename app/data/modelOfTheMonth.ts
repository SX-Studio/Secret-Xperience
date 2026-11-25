// "Belgian Adult Model of the Month" — rendered by /model-of-the-month and
// the teasers on the homepage and /creators. Each month: add an entry at the
// top of MODELS (photos in /public/creators/<slug>/). The first entry is the
// current model; older ones stay listed as past spotlights.
//
// Every outbound link points to the model's own channels — the goal of the
// page is to send her traffic and subscribers. Never host her paid content
// (videos) here; link to where she sells it.

export interface ModelLink {
  label: string
  url: string
  kind: 'links' | 'onlyfans' | 'instagram' | 'x'
}

export interface ModelPhoto {
  src: string
  alt: string
  /** Shape of the crop, so the gallery can lay it out without distortion. */
  shape: 'portrait' | 'landscape' | 'square'
}

export interface ModelTeaser {
  /** Short muted loop (15–20s, H.264 MP4, vertical) in /public/creators/<slug>/. */
  src: string
  poster: string
  /** Where the clip sends the visitor — one of her own channels. */
  url: string
}

export interface ModelOfTheMonth {
  slug: string
  name: string
  month: string
  country: string
  headline: string
  intro: string
  story: string[]
  quote?: string
  avatar: string
  cover: string
  photos: ModelPhoto[]
  links: ModelLink[]
  teasers?: ModelTeaser[]
}

export const MODELS: ModelOfTheMonth[] = [
  {
    slug: 'kimberlyx',
    name: 'KimberlyX',
    month: 'December 2026',
    country: 'Belgium',
    headline: 'Belgian Adult Performance Model of the Month',
    intro:
      'Tattooed, bespectacled and completely herself — KimberlyX is one of the most recognisable faces of the Belgian adult scene, and our model of the month.',
    story: [
      'KimberlyX describes herself simply as a Belgian actress, and her motto says the rest: live the way you want to. She has built one of the most loyal audiences of any Belgian creator — without hiding the ink, the glasses or the sense of humour that make her instantly recognisable.',
      'Her feed moves easily between lingerie sets, playful "ready for breakfast?" mornings and evenings out, and that relaxed, at-home confidence is exactly what her fans come back for. She is a verified creator on OnlyFans and available for professional shoots.',
      'Want to see more? Everything she does is one tap away on her link page: Instagram, X, her OnlyFans and her website. Subscribing directly is the best way to support her work.',
    ],
    quote: 'Leef zoals je zelf wilt.',
    avatar: '/creators/kimberlyx/portrait.jpg',
    cover: '/creators/kimberlyx/pink.jpg',
    photos: [
      { src: '/creators/kimberlyx/pink.jpg', alt: 'KimberlyX in pink lingerie on a sofa', shape: 'landscape' },
      { src: '/creators/kimberlyx/blue-lace.jpg', alt: 'KimberlyX in blue lace lingerie', shape: 'portrait' },
      { src: '/creators/kimberlyx/stockings.jpg', alt: 'KimberlyX in stockings, lying on a bed', shape: 'landscape' },
    ],
    links: [
      { label: 'All my links', url: 'https://myslink.app/kimberlyx', kind: 'links' },
      { label: 'OnlyFans', url: 'https://onlyfans.com/kimberlyxxxxxxxx', kind: 'onlyfans' },
      { label: 'Instagram', url: 'https://www.instagram.com/kimberlyx.x.x/', kind: 'instagram' },
    ],
    teasers: [],
  },
]

export const CURRENT_MODEL = MODELS[0]
