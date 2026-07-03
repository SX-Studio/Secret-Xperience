// Single source of truth for Partners & Links content.
// Rendered in full on /partners and as the homepage showcase — edit here, both update.

export interface BizLink {
  name: string
  tagline: string
  url: string           // real URL (replace with affiliate/tracking link when active)
  network?: string      // affiliate network, if applicable
  badge?: string
  emoji: string
}

export interface PartnerSection {
  id: string
  title: string
  emoji: string
  description: string
  items: BizLink[]
}

export const PARTNER_SECTIONS: PartnerSection[] = [
  // ══════════════════════════════════════════════════════════════
  //  ADULT INDUSTRY — REAL BUSINESSES
  // ══════════════════════════════════════════════════════════════

  {
    id: 'sexshops',
    title: 'Adult Shops & Toy Retailers',
    emoji: '🛍️',
    description: 'EU-based online adult retailers with wide product ranges, discrete shipping and active affiliate programmes.',
    items: [
      { name: 'EasyToys.eu', emoji: '🌹', tagline: 'Europe\'s fast-growing adult retailer — NL-based, ships EU-wide. Strong affiliate commissions via TradeTracker.', url: 'https://www.easytoys.eu', network: 'TradeTracker', badge: 'EU Favourite' },
      { name: 'Amorelie', emoji: '💜', tagline: 'Premium German adult boutique — elegant branding that resonates with our audience. Affiliate via Awin.', url: 'https://www.amorelie.de', network: 'Awin', badge: 'Trending' },
      { name: 'Orion.de', emoji: '⚡', tagline: 'Germany\'s largest adult retailer since 1969. Huge range, fast EU shipping. Solid Awin affiliate programme.', url: 'https://www.orion.de', network: 'Awin', badge: 'Top Earner' },
      { name: 'Eis.de', emoji: '❄️', tagline: 'German adult shop with 40,000+ products. High conversion rate. Affiliate via Awin with competitive commissions.', url: 'https://www.eis.de', network: 'Awin' },
      { name: 'Fun Factory', emoji: '🎨', tagline: 'Luxury German designer intimacy brand. Body-safe, sustainably produced. High AOV. Affiliate via Impact.', url: 'https://www.funfactory.com', network: 'Impact', badge: 'Luxury' },
      { name: 'Beate Uhse', emoji: '🖤', tagline: 'Europe\'s most iconic adult brand since 1946. Strong brand recognition. Physical stores + online EU-wide.', url: 'https://www.beate-uhse.ag', network: 'Awin' },
      { name: 'Beter in Bed', emoji: '💋', tagline: 'Dutch sex toy specialist — beterinbed.nl. Popular in BE/NL, strong local SEO and loyal customer base.', url: 'https://www.beterinbed.nl', network: 'TradeTracker' },
      { name: 'LoveHoney EU', emoji: '🌺', tagline: 'The UK\'s biggest adult retailer with full EU operations. Discrete packaging, huge range, top affiliate payouts.', url: 'https://www.lovehoney.co.uk', network: 'Awin', badge: 'Top Earner' },
    ],
  },

  {
    id: 'webcam',
    title: 'Webcam & Live Platforms',
    emoji: '🎥',
    description: 'Live streaming and content platforms with traffic-share and affiliate programmes. Among the highest-paying affiliate verticals online.',
    items: [
      { name: 'Chaturbate', emoji: '📡', tagline: 'The world\'s largest free webcam community. Their affiliate programme (20% recurring) is one of the best in adult.', url: 'https://chaturbate.com', network: 'Direct affiliate', badge: 'Top Earner' },
      { name: 'LiveJasmin', emoji: '💎', tagline: 'Premium HD webcam platform. High-paying clientele. Affiliate via AWEmpire — solid recurring commissions.', url: 'https://www.livejasmin.com', network: 'AWEmpire', badge: 'Luxury' },
      { name: 'BongaCams', emoji: '🔴', tagline: 'EU-headquartered live cam site. Strong European audience. Good referral programme for sending models or viewers.', url: 'https://bongacams.com', network: 'Direct affiliate', badge: 'EU Favourite' },
      { name: 'Stripchat', emoji: '🎬', tagline: 'Fast-growing cam platform with VR shows. Competitive model and viewer affiliate rates.', url: 'https://stripchat.com', network: 'Direct affiliate' },
      { name: 'ManyVids', emoji: '🎞️', tagline: 'Creator marketplace for adult video content. Traffic affiliate programme + model referrals available.', url: 'https://www.manyvids.com', network: 'Direct affiliate' },
    ],
  },

  {
    id: 'premium-content',
    title: 'Premium Adult Content',
    emoji: '🎬',
    description: 'Award-winning adult studios and premium content platforms. High-converting affiliate programmes with quality European productions.',
    items: [
      { name: 'Dorcel Club', emoji: '🔴', tagline: 'Marc Dorcel\'s flagship premium paysite — Europe\'s most prestigious adult studio. Exclusive HD films, series and live shows. Approved affiliate partner.', url: 'https://www.dorcelclub.com/en?aff=8103', network: 'Dorcel Cash', badge: 'Official Partner' },
    ],
  },

  {
    id: 'nightlife-venues',
    title: 'Nightlife & Gentleman\'s Clubs',
    emoji: '🥂',
    description: 'Premium nightlife venues across Belgium, Netherlands and Europe that welcome link exchanges and cross-promotion.',
    items: [
      { name: 'El Patio Spicy Gentleman\'s Club', emoji: '🌶️', tagline: 'Open daily 7/7 from 11:00 until the early hours. Belgium\'s well-known adult entertainment venue.', url: 'https://www.el-patio-club.be' },
      { name: 'Coco\'s Gentleman Club Antwerp', emoji: '🃏', tagline: 'Antwerp\'s adult entertainment club. Premium atmosphere, professional hostesses. Link exchange opportunity.', url: 'https://www.cocos.be' },
      { name: 'Désiré Lounge Brussels', emoji: '🌙', tagline: 'Private members club in Brussels. Discreet, premium experience. Cross-referral with escort listings.', url: 'https://www.desirelounge.be' },
      { name: 'Club NV Amsterdam', emoji: '💫', tagline: 'Amsterdam premium night venue. Well-established clientele overlap with escort/companion services.', url: 'https://www.clubnv.nl' },
      { name: 'Moulin Rouge Brussels', emoji: '🎭', tagline: 'Classic Brussels adult entertainment. Evening shows and private arrangements. Link exchange opportunity.', url: 'https://www.moulinrouge.be' },
    ],
  },

  {
    id: 'massage',
    title: 'Massage & Spa',
    emoji: '💆',
    description: 'Erotic and relaxation massage services across Belgium, Netherlands and Germany. Cross-referral opportunities.',
    items: [
      { name: 'Thai-Massages-Link.be', emoji: '🌿', tagline: 'Complete overview of Thai massage parlours in Belgium. High organic traffic, strong link exchange value.', url: 'https://thai-massages-link.be' },
      { name: 'EroMassage.nl', emoji: '🌸', tagline: 'Dutch erotic massage directory. Complementary audience to escorts and companions. Link exchange.', url: 'https://www.eromassage.nl' },
      { name: 'Tantramassage.be', emoji: '🕯️', tagline: 'Belgian tantra and sensual massage listings. Niche audience that overlaps significantly with our users.', url: 'https://www.tantramassage.be' },
    ],
  },

  {
    id: 'directories',
    title: 'Adult Directories & Sister Sites',
    emoji: '🔗',
    description: 'EU escort directories, adult portals and industry listing sites. Link exchange and cross-traffic opportunities.',
    items: [
      { name: 'The Best Fetish Sites', emoji: '📋', tagline: 'Curated list of the best escort and fetish sites. Strong SEO presence. Link exchange value for our domain.', url: 'https://www.thebestfetishsites.com' },
      { name: 'Erotiek4ever.nl', emoji: '🇳🇱', tagline: 'Dutch adult directory with strong NL organic traffic. Sister-site link exchange opportunity.', url: 'https://www.erotiek4ever.nl' },
      { name: 'Redlights.be', emoji: '🔴', tagline: 'Belgium\'s established adult listings platform. Cross-referral and link exchange with leading BE site.', url: 'https://www.redlights.be' },
      { name: 'Escort Amsterdam', emoji: '🌷', tagline: 'Leading Amsterdam escort directory. High NL traffic. Mutual link listing increases domain authority.', url: 'https://www.escortamsterdam1.com' },
      { name: 'Scarlet Blue', emoji: '💙', tagline: 'EU\'s premium independent escort platform. Non-competing audience for mutual promotion.', url: 'https://www.scarletblue.com.au' },
    ],
  },

  {
    id: 'industry-services',
    title: 'Industry Services & Tools',
    emoji: '🔧',
    description: 'Tech, billing, design and marketing services specifically for adult businesses. All EU-friendly.',
    items: [
      { name: 'Erotic & Escort Web Design — Van Der Linde Media', emoji: '🖥️', tagline: 'Specialist adult web design from the Netherlands. Quality sites at affordable rates. Regular advertiser in the EU adult space.', url: 'https://www.vanderlindemedia.nl' },
      { name: 'Segpay', emoji: '💳', tagline: 'Adult-friendly payment processing. Accepts major cards for adult businesses. Strong EU bank relationships.', url: 'https://segpay.com' },
      { name: 'Paxum', emoji: '🏦', tagline: 'The go-to e-wallet for adult industry professionals. Used by models, agencies and platforms globally.', url: 'https://www.paxum.com', badge: 'Industry Standard' },
      { name: 'NATS by Too Much Media', emoji: '📊', tagline: 'The industry-standard affiliate tracking and billing software. Powers most major adult affiliate programmes.', url: 'https://www.toomuchmedia.com' },
      { name: 'Adult Site Broker', emoji: '🤝', tagline: 'Buy and sell adult websites. Valuations, brokerage and M&A for adult digital businesses.', url: 'https://adultsitebroker.com' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  //  LIFESTYLE AFFILIATES
  // ══════════════════════════════════════════════════════════════

  {
    id: 'lingerie',
    title: 'Lingerie & Fashion',
    emoji: '🖤',
    description: 'Premium and luxury lingerie brands with strong EU presence and active affiliate programmes.',
    items: [
      { name: 'Honey Birdette', emoji: '🖤', tagline: 'High-fashion luxury lingerie, PVC and fantasy pieces. Premium brand, high AOV. Affiliate via Commission Factory.', url: 'https://www.honeybirdette.com', network: 'Rakuten', badge: 'Premium' },
      { name: 'Agent Provocateur', emoji: '🌙', tagline: 'The world\'s most iconic luxury lingerie. Hand-crafted. Very high AOV commissions. Affiliate via Rakuten.', url: 'https://www.agentprovocateur.com', network: 'Rakuten', badge: 'Luxury' },
      { name: 'Ann Summers', emoji: '💋', tagline: 'UK\'s favourite adult fashion brand. Wide range, constant promotions, huge EU affiliate audience.', url: 'https://www.annsummers.com', network: 'Awin', badge: 'EU Favourite' },
      { name: 'Bluebella', emoji: '🌿', tagline: 'Modern sensual lingerie. Contemporary, inclusive, affordable-luxury. Strong EU shipping and affiliate.', url: 'https://www.bluebella.com', network: 'Awin' },
      { name: 'La Perla', emoji: '🤍', tagline: 'Ultra-premium Italian couture lingerie. Low volume, very high commission per sale.', url: 'https://www.laperla.com', network: 'Rakuten', badge: 'Luxury' },
    ],
  },

  {
    id: 'privacy',
    title: 'Privacy & Digital Security',
    emoji: '🛡️',
    description: 'VPN and privacy tools — essential for a privacy-conscious adult services audience. Top affiliate commissions online.',
    items: [
      { name: 'NordVPN', emoji: '🛡️', tagline: 'The world\'s most recognised VPN. Extremely relevant for our audience. Very high commissions via Impact.', url: 'https://nordvpn.com', network: 'Impact', badge: 'Top Earner' },
      { name: 'ExpressVPN', emoji: '🔐', tagline: 'Premium VPN, 105 countries. One of the highest-paying affiliate programmes online.', url: 'https://www.expressvpn.com', network: 'Impact' },
      { name: 'Proton', emoji: '🔒', tagline: 'Swiss encrypted email, VPN and cloud storage. Deeply trusted in Europe. Direct affiliate programme.', url: 'https://proton.me', network: 'Direct', badge: 'EU Trusted' },
      { name: 'Surfshark', emoji: '🌊', tagline: 'Budget VPN, unlimited devices. Very popular with younger EU users. Good commissions via Impact.', url: 'https://surfshark.com', network: 'Impact' },
    ],
  },

  {
    id: 'beauty',
    title: 'Beauty & Fragrance',
    emoji: '💄',
    description: 'Skincare, makeup and fragrance brands with strong EU affiliate programmes and high audience crossover.',
    items: [
      { name: 'Lookfantastic', emoji: '✨', tagline: 'Europe\'s largest online beauty retailer. Hundreds of brands, frequent deals. Strong Awin conversion.', url: 'https://www.lookfantastic.com', network: 'Awin', badge: 'EU Favourite' },
      { name: 'Charlotte Tilbury', emoji: '🪄', tagline: 'Cult Hollywood glamour makeup. Pillow Talk range is hugely popular with our audience.', url: 'https://www.charlottetilbury.com', network: 'Awin', badge: 'Trending' },
      { name: 'Fragrance Direct', emoji: '🌺', tagline: 'Authentic designer perfumes (Dior, Chanel, YSL) at a discount. Popular gifting affiliate.', url: 'https://www.fragrancedirect.co.uk', network: 'Awin' },
      { name: 'Sephora EU', emoji: '💄', tagline: 'Premium EU beauty destination. Luxury perfumes and skincare. Rakuten/direct affiliate.', url: 'https://www.sephora.com', network: 'Rakuten' },
    ],
  },

  {
    id: 'creator',
    title: 'Creator Tools',
    emoji: '🎬',
    description: 'Essential tech and software for adult content creators — webcams, lighting, editing and streaming tools.',
    items: [
      { name: 'Elgato', emoji: '🎬', tagline: 'Ring lights, key lights, green screens and capture cards. The creator standard. Amazon Associates affiliate.', url: 'https://www.elgato.com', network: 'Amazon Associates', badge: 'Creator Pick' },
      { name: 'Logitech', emoji: '📷', tagline: 'Industry-standard webcams (Brio 4K, C920). Essential for live cam and content creation.', url: 'https://www.logitech.com', network: 'Awin / Impact' },
      { name: 'Canva Pro', emoji: '🎨', tagline: 'Design promo graphics, banners and social content fast. €120/yr plan. High conversion affiliate.', url: 'https://www.canva.com', network: 'Impact' },
      { name: 'Streamyard', emoji: '🎙️', tagline: 'Browser-based multi-platform live streaming. Growing creator tool with recurring affiliate commissions.', url: 'https://streamyard.com', network: 'Direct' },
    ],
  },

  {
    id: 'travel',
    title: 'Travel & Accommodation',
    emoji: '🏨',
    description: 'Booking platforms highly relevant for escorts, companions and clients. High conversion, strong EU inventory.',
    items: [
      { name: 'Booking.com', emoji: '🏨', tagline: 'Europe\'s dominant accommodation platform. Huge EU hotel inventory. Direct affiliate programme, high volume.', url: 'https://www.booking.com', network: 'Booking Affiliate (direct)', badge: 'EU Favourite' },
      { name: 'Hotels.com', emoji: '🛎️', tagline: 'Loyalty rewards + city hotels. Good commissions per completed stay. Affiliate via CJ.', url: 'https://www.hotels.com', network: 'CJ Affiliate' },
      { name: 'GetYourGuide', emoji: '🗺️', tagline: 'Curated experiences in 150+ cities — excellent upsell for companion bookings including dinners or shows.', url: 'https://www.getyourguide.com', network: 'Awin' },
    ],
  },

  {
    id: 'finance',
    title: 'Payments & Finance',
    emoji: '💸',
    description: 'International money transfer and multi-currency tools. Highly relevant for advertisers working across EU borders.',
    items: [
      { name: 'Wise', emoji: '💸', tagline: 'Low-fee international transfers. Huge relevance for BE/NL/DE/FR/LU cross-border work. Strong Impact affiliate.', url: 'https://wise.com', network: 'Impact', badge: 'EU Trusted' },
      { name: 'Revolut', emoji: '💳', tagline: 'Multi-currency super-app. Instant payments, expense cards. Very popular in Belgium and Netherlands.', url: 'https://www.revolut.com', network: 'Revolut referral' },
      { name: 'Coinbase', emoji: '₿', tagline: 'Regulated EU crypto exchange. Privacy-conscious audience increasingly prefers crypto payments.', url: 'https://www.coinbase.com', network: 'Impact' },
      { name: 'Paysafecard', emoji: '🎫', tagline: 'Prepaid voucher payments. Anonymous, widely used in adult platforms. No affiliate but strong cross-referral.', url: 'https://www.paysafecard.com' },
    ],
  },

  {
    id: 'wellness',
    title: 'Health & Wellness',
    emoji: '🌿',
    description: 'Sexual health, supplements and wellness products. Practical essentials for advertisers and clients.',
    items: [
      { name: 'Durex', emoji: '❤️', tagline: 'World\'s leading sexual wellness brand. Subscription bundles drive repeat commissions. Discrete EU shipping.', url: 'https://www.durex.com', network: 'Direct (regional)' },
      { name: 'Superdrug Online Doctor', emoji: '💊', tagline: 'UK/EU sexual health — STI testing, contraception, PrEP. Essential for a safety-conscious audience.', url: 'https://www.superdrug.com', network: 'Awin' },
      { name: 'iHerb', emoji: '🌿', tagline: 'Natural supplements shipped EU-wide. Libido, energy and wellness categories perform very well here.', url: 'https://www.iherb.com', network: 'Impact' },
    ],
  },
]

export const PARTNER_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  'Top Earner':       { bg: 'rgba(197,160,90,0.15)', color: '#c5a05a', border: 'rgba(197,160,90,0.4)' },
  'EU Favourite':     { bg: 'rgba(62,207,142,0.12)', color: '#3ecf8e', border: 'rgba(62,207,142,0.35)' },
  'Luxury':           { bg: 'rgba(176,106,224,0.12)', color: '#c084f5', border: 'rgba(176,106,224,0.35)' },
  'Trending':         { bg: 'rgba(234,120,77,0.12)', color: '#ea784d', border: 'rgba(234,120,77,0.35)' },
  'EU Trusted':       { bg: 'rgba(90,176,197,0.12)', color: '#5ab0c5', border: 'rgba(90,176,197,0.35)' },
  'Creator Pick':     { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.35)' },
  'Premium':          { bg: 'rgba(232,201,126,0.12)', color: '#e8c97e', border: 'rgba(232,201,126,0.35)' },
  'Official Partner': { bg: 'rgba(196,90,90,0.14)',  color: '#e09090', border: 'rgba(196,90,90,0.4)' },
  'Industry Standard':{ bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.15)' },
}

export const PARTNER_INDUSTRY_IDS  = ['sexshops','webcam','premium-content','nightlife-venues','massage','directories','industry-services']
export const PARTNER_LIFESTYLE_IDS = ['lingerie','privacy','beauty','creator','travel','finance','wellness']
