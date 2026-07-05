// Partner boutiques — lingerie & adult fashion webshops.
// Shown as photo cards on /shop (300×400) and the homepage (200×300).
// Card image lives at /public/shops/<slug>.jpg (600×800, generated); entries
// with img:false render a styled name card instead.

export interface BoutiqueShop {
  slug: string
  name: string
  url: string
  img: boolean
}

export const BOUTIQUE_SHOPS: BoutiqueShop[] = [
  { slug: 'maison-close',   name: 'Maison Close',     url: 'https://maison-close.com',                  img: true },
  { slug: 'elynaforce',     name: 'Elyna Force',      url: 'https://elynaforce.com/',                   img: false },
  { slug: 'womanza',        name: 'Womanza',          url: 'https://www.womanza.com/',                  img: true },
  { slug: 'noirsatine',     name: 'Noir Satine',      url: 'https://www.noirsatine.com/',               img: true },
  { slug: 'parfaitamour',   name: 'Parfait Amour',    url: 'https://parfaitamour.fr/',                  img: true },
  { slug: 'mariemur',       name: 'MARIEMUR',         url: 'https://mariemur.com/',                     img: true },
  { slug: 'serata',         name: 'Serata',           url: 'https://serata.store/',                     img: true },
  { slug: 'arralingerie',   name: 'Arra Lingerie',    url: 'https://www.arralingerie.com/',             img: true },
  { slug: 'bluebella',      name: 'Bluebella',        url: 'https://www.bluebella.eu/',                 img: false },
  { slug: 'bordelle',       name: 'Bordelle',         url: 'https://eu.bordelle.co.uk/nl',              img: true },
  { slug: 'superlove',      name: 'Superlove',        url: 'https://superlove.be/',                     img: false },
  { slug: 'christineleduc', name: 'Christine le Duc', url: 'https://www.christineleduc.be/',            img: true },
  { slug: 'pharador',       name: 'Pharador',         url: 'https://pharador.com/nl',                   img: true },
  { slug: 'pleasurements',  name: 'Pleasurements',    url: 'https://www.pleasurements.com/nl',          img: true },
  { slug: 'classywear',     name: 'Classywear',       url: 'https://www.classywear.nl/',                img: true },
  { slug: 'annavanrode',    name: 'Anna van Rode',    url: 'https://www.annavanrode.nl/',               img: true },
  { slug: 'honeybirdette',  name: 'Honey Birdette',   url: 'https://eu.honeybirdette.com/',             img: true },
  { slug: 'demask',         name: 'DeMask',           url: 'https://demask.com/',                       img: true },
  { slug: 'frauleinkink',   name: 'Fräulein Kink',    url: 'https://www.frauleinkink.com/',             img: true },
  { slug: 'atelieramour',   name: 'Atelier Amour',    url: 'https://atelier-amour.com/',                img: true },
  { slug: 'undiz',          name: 'Undiz',            url: 'https://be.undiz.com/',                     img: true },
  { slug: 'etam',           name: 'Etam',             url: 'https://www.etam.be/nl_BE/home',            img: true },
  { slug: 'sinful',         name: 'Sinful',           url: 'https://www.sinful.be/',                    img: true },
]
