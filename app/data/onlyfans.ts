// OnlyFans creator directory — shown on the homepage and /creators.
// Keep any ?rec= referral params on the URLs; they are affiliate/referral codes.
// Edit here — every surface that renders this list updates.

export interface OFCreator {
  name: string
  handle: string
  url: string
  /** Show as a large clickable photo card (requires /public/onlyfans/<handle>.jpg). */
  featured?: boolean
}

export interface OFGroup {
  id: string
  label: string
  flag: string
  items: OFCreator[]
}

export const ONLYFANS_GROUPS: OFGroup[] = [
  {
    id: 'be',
    label: 'België',
    flag: '🇧🇪',
    items: [
      { name: 'Nannaagirlii', handle: 'barbiipinkii', url: 'https://onlyfans.com/barbiipinkii', featured: true },
      { name: 'Sabrina._Ck ♡', handle: 'sabrinack', url: 'https://onlyfans.com/sabrinack', featured: true },
      { name: 'Elise Luna', handle: 'elise_luna7', url: 'https://onlyfans.com/elise_luna7' },
      { name: 'Gigi Max 🍒', handle: 'gigimaxofficial', url: 'https://onlyfans.com/gigimaxofficial', featured: true },
      { name: 'Baddie Mi', handle: 'baddiemi', url: 'https://onlyfans.com/baddiemi?rec=89521844' },
      { name: 'Kimberly X', handle: 'kimberlyxxxxxxxx', url: 'https://onlyfans.com/kimberlyxxxxxxxx' },
      { name: 'Fetilicious', handle: 'mfetilicious', url: 'https://onlyfans.com/mfetilicious' },
      { name: 'Yuki', handle: 'yuki.nky', url: 'https://onlyfans.com/yuki.nky' },
      { name: 'Kayleigh Wonder', handle: 'kayleigh.wonder', url: 'https://onlyfans.com/kayleigh.wonder' },
      { name: 'Curvy Geek', handle: 'curvygeekvip', url: 'https://onlyfans.com/curvygeekvip' },
      { name: 'Our Deepest Secrets', handle: 'ourdeepest_secrets', url: 'https://onlyfans.com/ourdeepest_secrets' },
      { name: 'Lisa Wildlove', handle: 'lisawildlove', url: 'https://onlyfans.com/lisawildlove?rec=89521844' },
      { name: 'Maya Honing', handle: 'mayahoning.vip', url: 'https://onlyfans.com/mayahoning.vip' },
      { name: 'Domino Faye', handle: 'dominofaye', url: 'https://onlyfans.com/dominofaye' },
      { name: 'Alina Wet Yoga', handle: 'alina_wet_yoga', url: 'https://onlyfans.com/alina_wet_yoga' },
      { name: 'Curvy Mom', handle: 'curvymom', url: 'https://onlyfans.com/curvymom' },
      { name: 'Lizanne', handle: 'lizanne_l', url: 'https://onlyfans.com/lizanne_l' },
      { name: 'Jolynn Vissers', handle: 'jolynn_vissers', url: 'https://onlyfans.com/jolynn_vissers' },
      { name: 'Irene Brie', handle: 'irenebrie', url: 'https://onlyfans.com/irenebrie' },
      { name: 'Goddess Ice', handle: 'goddesssice', url: 'https://onlyfans.com/goddesssice' },
      { name: 'Jessie', handle: 'jessie_ca_xo', url: 'https://onlyfans.com/jessie_ca_xo' },
      { name: 'Nova Star', handle: 'nova-star', url: 'https://onlyfans.com/nova-star' },
      { name: 'Ruby Mae', handle: 'therubymae', url: 'https://onlyfans.com/therubymae' },
      { name: 'Josie Moon', handle: 'josiemoon', url: 'https://onlyfans.com/josiemoon' },
      { name: 'The Lily Experience', handle: 'thelilyexperiencex', url: 'https://onlyfans.com/thelilyexperiencex' },
      { name: 'Inked & Pierced', handle: 'inkedpierced', url: 'https://onlyfans.com/inkedpierced' },
      { name: 'Delulo', handle: 'deluloex', url: 'https://onlyfans.com/deluloex' },
    ],
  },
  {
    id: 'de',
    label: 'Deutschland',
    flag: '🇩🇪',
    items: [
      { name: 'Jana Exklusiv', handle: 'janaexklusiv', url: 'https://onlyfans.com/janaexklusiv' },
    ],
  },
  {
    id: 'ro',
    label: 'România',
    flag: '🇷🇴',
    items: [
      { name: 'Lila Roses', handle: 'lilaroses_vip', url: 'https://onlyfans.com/lilaroses_vip' },
    ],
  },
  {
    id: 'es',
    label: 'España',
    flag: '🇪🇸',
    items: [
      { name: 'Africa', handle: 'africa04', url: 'https://onlyfans.com/africa04' },
    ],
  },
  {
    id: 'int',
    label: 'International',
    flag: '🌍',
    items: [
      { name: 'Queen Tati', handle: 'queentatix', url: 'https://onlyfans.com/queentatix' },
      { name: 'Levionta', handle: 'leviontaa', url: 'https://onlyfans.com/leviontaa' },
      { name: 'Rose Velvet', handle: 'rosevelvetxx', url: 'https://onlyfans.com/rosevelvetxx' },
      { name: 'Veronica Foxova', handle: 'veronicafoxova', url: 'https://onlyfans.com/veronicafoxova' },
      { name: 'Solange', handle: 'heysolange', url: 'https://onlyfans.com/heysolange' },
      { name: 'Selina Fox', handle: 'selinafox_vip', url: 'https://onlyfans.com/selinafox_vip' },
    ],
  },
]

export const ONLYFANS_TOTAL = ONLYFANS_GROUPS.reduce((n, g) => n + g.items.length, 0)
