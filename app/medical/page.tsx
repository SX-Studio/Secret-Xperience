'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Data ────────────────────────────────────────────────────────────────────

type OrgCategory = 'STI Testing' | 'Sexual Health' | 'Healthcare' | 'Sex Worker Health' | 'HIV/PrEP' | 'Rights & Support' | 'Anti-Trafficking' | 'Outreach' | 'Mental Health' | 'Migrant Support'

interface Org {
  name: string
  country: string
  countryCode: string
  flag: string
  city: string
  category: OrgCategory
  phone?: string
  email?: string
  website?: string
  desc: string
  tags: string[]
  walkIn?: boolean
  freeService?: boolean
  multilingual?: boolean
}

const ORGS: Org[] = [
  // ─── Belgium ───────────────────────────────────────────────────────────────
  {
    name: 'Violett', country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', city: 'Brussels',
    category: 'Sex Worker Health', phone: '+32 2 292 25 40', website: 'https://violett.be',
    desc: 'Specialist healthcare for sex workers. STI testing, contraception, PrEP, gynaecology, counselling, and social support. No appointment needed for testing.',
    tags: ['STI testing', 'PrEP', 'contraception', 'counselling', 'social support'],
    walkIn: true, freeService: true, multilingual: true,
  },
  {
    name: 'Espace P', country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', city: 'Brussels & Wallonia',
    category: 'Outreach', phone: '+32 2 219 98 74', website: 'https://www.espace-p.be',
    desc: 'Social outreach, psychosocial support, health referrals, and harm reduction for sex workers across Brussels and Wallonia. Multilingual team.',
    tags: ['outreach', 'social work', 'harm reduction', 'multilingual'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Utsopi', country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', city: 'Nationwide',
    category: 'Rights & Support', phone: '+32 2 512 90 21', email: 'info@utsopi.be', website: 'https://utsopi.be',
    desc: 'Belgian sex worker union. Peer support, legal information, healthcare navigation, and advocacy. The primary point of contact for workers seeking peer advice.',
    tags: ['peer support', 'rights', 'legal info', 'advocacy'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Payoke', country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', city: 'Antwerp',
    category: 'Anti-Trafficking', phone: '+32 3 201 16 90', website: 'https://payoke.be',
    desc: 'Specialist support for trafficking victims. Shelter, legal aid, psychological support, social assistance. Confidential.',
    tags: ['trafficking', 'shelter', 'legal aid', 'confidential'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Sürya', country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', city: 'Brussels',
    category: 'Anti-Trafficking', phone: '+32 2 534 18 00', website: 'https://surya.be',
    desc: 'Support for victims of exploitation and trafficking in Brussels and Wallonia. No documentation required to access support.',
    tags: ['trafficking', 'exploitation', 'no documentation required'],
    freeService: true, multilingual: true,
  },
  {
    name: 'PASOP', country: 'Belgium', countryCode: 'BE', flag: '🇧🇪', city: 'Ghent',
    category: 'Outreach', website: 'https://pasop.be',
    desc: 'Mobile outreach to sex workers in Ghent and East Flanders. Health information, harm reduction, social referrals.',
    tags: ['outreach', 'Ghent', 'Flanders', 'harm reduction'],
    freeService: true,
  },

  // ─── Netherlands ──────────────────────────────────────────────────────────
  {
    name: 'SoaAids Nederland', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', city: 'Amsterdam (nationwide)',
    category: 'STI Testing', phone: '020 689 2577', website: 'https://soaaids.nl',
    desc: 'National STI testing & prevention organisation. Free testing advice, PrEP information, sexual health information, and helpline. Partners with GGD clinics nationwide.',
    tags: ['STI testing', 'PrEP', 'HIV', 'sexual health'],
    freeService: true, multilingual: true,
  },
  {
    name: 'P&G069 (Prostitutie & Gezondheid)', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', city: 'Amsterdam',
    category: 'Sex Worker Health', phone: '020 626 2000', website: 'https://pg069.nl',
    desc: 'Specialist health centre for sex workers. Free STI testing, gynaecology, sexual health advice, psychological support, and social work. No appointment needed.',
    tags: ['STI testing', 'gynaecology', 'mental health', 'social work'],
    walkIn: true, freeService: true, multilingual: true,
  },
  {
    name: 'GGD Amsterdam', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', city: 'Amsterdam',
    category: 'Healthcare', phone: '020 555 5555', website: 'https://ggd.amsterdam.nl',
    desc: 'Municipal public health service. Free STI testing, hepatitis vaccinations, mental health support, PrEP, and general public health services.',
    tags: ['STI testing', 'vaccination', 'PrEP', 'public health'],
    freeService: true,
  },
  {
    name: 'Proud', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', city: 'Nationwide',
    category: 'Rights & Support', email: 'info@proud.nl', website: 'https://www.proud.nl',
    desc: 'National sex worker collective. Peer support, rights information, advocacy, and political campaigning. The central community voice for sex workers in the Netherlands.',
    tags: ['peer support', 'advocacy', 'rights', 'community'],
    freeService: true, multilingual: false,
  },
  {
    name: 'CoMensha', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', city: 'Nationwide',
    category: 'Anti-Trafficking', phone: '033 448 11 86', website: 'https://comensha.nl',
    desc: 'National coordination centre for victims of human trafficking. Connects victims to shelter, legal aid, and support services across the Netherlands.',
    tags: ['trafficking', 'shelter', 'legal aid', 'coordination'],
    freeService: true, multilingual: true,
  },
  {
    name: 'GGD Rotterdam-Rijnmond', country: 'Netherlands', countryCode: 'NL', flag: '🇳🇱', city: 'Rotterdam',
    category: 'STI Testing', phone: '010 433 9966', website: 'https://ggdrotterdamrijnmond.nl',
    desc: 'STI testing, PrEP, vaccination, and sexual health services in Rotterdam. Free testing for sex workers.',
    tags: ['STI testing', 'PrEP', 'Rotterdam'],
    freeService: true,
  },

  // ─── Germany ──────────────────────────────────────────────────────────────
  {
    name: 'Madonna e.V.', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', city: 'Cologne / Bonn',
    category: 'Sex Worker Health', phone: '+49 221 992 3696', website: 'https://madonna-ev.de',
    desc: 'Health counselling, STI testing, social support, and legal advice for sex workers. Multilingual outreach team. Also supports migrant sex workers.',
    tags: ['health counselling', 'STI testing', 'migrant support', 'legal advice'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Hydra e.V.', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', city: 'Berlin',
    category: 'Rights & Support', phone: '+49 30 284 4596', website: 'https://hydra-berlin.de',
    desc: 'Berlin sex worker rights organisation. Legal information, health referrals, counselling, peer support. One of Germany\'s oldest and most established sex worker organisations.',
    tags: ['rights', 'legal info', 'peer support', 'counselling'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Doña Carmen e.V.', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', city: 'Frankfurt',
    category: 'Outreach', phone: '+49 69 291 564', website: 'https://donacarmen.de',
    desc: 'Street-based and indoor outreach in Frankfurt. Health services, harm reduction, social work, rights advocacy for sex workers.',
    tags: ['outreach', 'harm reduction', 'Frankfurt', 'social work'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Gesundheitsamt München', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', city: 'Munich',
    category: 'Healthcare', phone: '+49 89 233 0', website: 'https://gesundheitsamt.de',
    desc: 'Munich public health authority. Provides mandatory health counselling for ProstSchG registration, STI testing, and general health services.',
    tags: ['ProstSchG counselling', 'STI testing', 'registration', 'public health'],
    freeService: true,
  },
  {
    name: 'TAMPEP International', country: 'Germany', countryCode: 'DE', flag: '🇩🇪', city: 'Europe-wide',
    category: 'Migrant Support', website: 'https://tampep.eu',
    desc: 'European network supporting migrant and mobile sex workers. Multilingual health materials, rights information, and advocacy across EU member states.',
    tags: ['migrant workers', 'multilingual', 'EU-wide', 'rights'],
    freeService: true, multilingual: true,
  },

  // ─── France ────────────────────────────────────────────────────────────────
  {
    name: 'Médecins du Monde', country: 'France', countryCode: 'FR', flag: '🇫🇷', city: 'Nationwide',
    category: 'Healthcare', website: 'https://medecinsdumonde.org',
    desc: 'Mobile outreach clinics providing free healthcare, STI testing, condoms, PrEP information, and social referrals. No documentation required. Operates in Paris, Lyon, Marseille, Bordeaux, and other cities.',
    tags: ['free healthcare', 'no documentation', 'outreach', 'STI testing', 'PrEP'],
    walkIn: true, freeService: true, multilingual: true,
  },
  {
    name: 'Bus des Femmes', country: 'France', countryCode: 'FR', flag: '🇫🇷', city: 'Paris',
    category: 'Outreach', phone: '+33 1 47 00 25 77',
    desc: 'Street outreach via mobile bus in Paris. Harm reduction, condoms, health advice, social work, and referrals. Operates several evenings per week across Paris arrondissements.',
    tags: ['mobile outreach', 'Paris', 'harm reduction', 'evening hours'],
    walkIn: true, freeService: true, multilingual: true,
  },
  {
    name: 'AIDES', country: 'France', countryCode: 'FR', flag: '🇫🇷', city: 'Nationwide',
    category: 'HIV/PrEP', website: 'https://www.aides.org',
    desc: 'France\'s leading HIV prevention and advocacy organisation. PrEP access, rapid HIV testing, harm reduction, and peer support. Operates local centres and community outreach across France.',
    tags: ['HIV', 'PrEP', 'rapid testing', 'harm reduction'],
    freeService: true, multilingual: true,
  },
  {
    name: 'STRASS', country: 'France', countryCode: 'FR', flag: '🇫🇷', city: 'Nationwide',
    category: 'Rights & Support', website: 'https://strass-syndicat.org', email: 'contact@strass-syndicat.org',
    desc: 'National sex worker union. Provides legal information, rights guidance, healthcare navigation, and political advocacy. Peer-led.',
    tags: ['union', 'rights', 'legal info', 'peer support'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Grisélidis', country: 'France', countryCode: 'FR', flag: '🇫🇷', city: 'Toulouse',
    category: 'Rights & Support', website: 'https://griselidis.fr',
    desc: 'Toulouse-based sex worker rights organisation. Social support, legal referrals, health information, and advocacy for decriminalization.',
    tags: ['rights', 'Toulouse', 'legal referrals', 'advocacy'],
    freeService: true,
  },
  {
    name: 'CeGIDD Paris Centre', country: 'France', countryCode: 'FR', flag: '🇫🇷', city: 'Paris',
    category: 'STI Testing', website: 'https://www.aphp.fr',
    desc: 'Centre Gratuit d\'Information, de Dépistage et de Diagnostic. Free, anonymous STI testing including HIV, syphilis, gonorrhoea, chlamydia, and hepatitis. No appointment needed.',
    tags: ['free STI testing', 'anonymous', 'no appointment', 'HIV', 'syphilis'],
    walkIn: true, freeService: true,
  },

  // ─── Luxembourg ────────────────────────────────────────────────────────────
  {
    name: 'Lëtz Rise Up', country: 'Luxembourg', countryCode: 'LU', flag: '🇱🇺', city: 'Luxembourg City',
    category: 'Rights & Support', email: 'contact@letzriseup.lu',
    desc: 'Sex worker-led organisation in Luxembourg. Community support, rights information, and outreach. The primary sex worker community voice in Luxembourg.',
    tags: ['peer support', 'rights', 'community', 'Luxembourg'],
    freeService: true,
  },
  {
    name: 'Médecins du Monde Luxembourg', country: 'Luxembourg', countryCode: 'LU', flag: '🇱🇺', city: 'Luxembourg City',
    category: 'Healthcare', website: 'https://medecinsdumonde.lu',
    desc: 'Free medical consultations, STI testing, and health referrals for people without access to the regular healthcare system. No documentation required.',
    tags: ['free healthcare', 'no documentation', 'STI testing'],
    walkIn: true, freeService: true, multilingual: true,
  },
  {
    name: 'Croix-Rouge Luxembourg', country: 'Luxembourg', countryCode: 'LU', flag: '🇱🇺', city: 'Nationwide',
    category: 'Healthcare', phone: '+352 27 55', website: 'https://croix-rouge.lu',
    desc: 'STI testing, anonymous HIV testing, social support, and emergency services. Also provides shelter and social assistance.',
    tags: ['STI testing', 'HIV testing', 'anonymous', 'social support'],
    freeService: true,
  },
  {
    name: 'CEFIS', country: 'Luxembourg', countryCode: 'LU', flag: '🇱🇺', city: 'Luxembourg City',
    category: 'Migrant Support', website: 'https://cefis.lu',
    desc: 'Social integration and support for migrants. Offers legal advice, social work, and referrals to health services.',
    tags: ['migrants', 'legal advice', 'social work'],
    freeService: true, multilingual: true,
  },

  // ─── Spain ─────────────────────────────────────────────────────────────────
  {
    name: 'Médicos del Mundo', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', city: 'Multiple cities',
    category: 'Healthcare', phone: '+34 91 543 60 33', website: 'https://medicosdelmundo.org',
    desc: 'Free healthcare, STI testing, PrEP, and support services. Operates outreach across Madrid, Barcelona, Valencia, Bilbao, Seville. No documentation required.',
    tags: ['free healthcare', 'STI testing', 'PrEP', 'outreach', 'no documentation'],
    freeService: true, multilingual: true,
  },
  {
    name: 'APROSEX', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', city: 'Barcelona',
    category: 'Rights & Support', website: 'https://aprosex.org', email: 'info@aprosex.org',
    desc: 'Sex worker association in Catalonia. Legal information, health referrals, peer support, and political advocacy for sex worker rights.',
    tags: ['rights', 'peer support', 'Catalonia', 'legal info'],
    freeService: true, multilingual: true,
  },
  {
    name: 'HETAIRA', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', city: 'Madrid',
    category: 'Rights & Support', website: 'https://colectivohetaira.org',
    desc: 'Madrid-based sex worker collective. Social support, rights information, healthcare navigation, and harm reduction.',
    tags: ['rights', 'Madrid', 'social support', 'harm reduction'],
    freeService: true,
  },
  {
    name: 'Stop Sida', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', city: 'Barcelona',
    category: 'HIV/PrEP', website: 'https://stopsida.org',
    desc: 'HIV prevention, PrEP access, rapid HIV testing, and harm reduction in Catalonia. Runs community health programmes including outreach to sex workers.',
    tags: ['HIV', 'PrEP', 'rapid testing', 'Catalonia'],
    freeService: true,
  },
  {
    name: 'Fundación Salud y Comunidad', country: 'Spain', countryCode: 'ES', flag: '🇪🇸', city: 'Nationwide',
    category: 'Outreach', website: 'https://fsyc.org',
    desc: 'Mobile outreach, harm reduction, health services, and psychosocial support for vulnerable groups including sex workers. Present in multiple Spanish cities.',
    tags: ['outreach', 'harm reduction', 'psychosocial support', 'nationwide'],
    freeService: true, multilingual: true,
  },

  // ─── Austria ───────────────────────────────────────────────────────────────
  {
    name: 'LEFÖ', country: 'Austria', countryCode: 'AT', flag: '🇦🇹', city: 'Vienna',
    category: 'Migrant Support', phone: '+43 1 796 36 70', website: 'https://lefoe.at',
    desc: 'Specialist support for migrant women including sex workers. Legal advice, immigration guidance, psychosocial support, shelter, and anti-trafficking victim assistance. Strictly confidential.',
    tags: ['migrant women', 'legal advice', 'anti-trafficking', 'confidential', 'shelter'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Sophie Frauenberatung', country: 'Austria', countryCode: 'AT', flag: '🇦🇹', city: 'Vienna',
    category: 'Sex Worker Health', phone: '+43 1 581 28 82',
    desc: 'Free, confidential health counselling and social work for sex workers in Vienna. Psychosocial support, health referrals, legal information.',
    tags: ['counselling', 'social work', 'confidential', 'Vienna'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Wiener Gesundheitsverbund', country: 'Austria', countryCode: 'AT', flag: '🇦🇹', city: 'Vienna',
    category: 'STI Testing', phone: '+43 1 4000 87300', website: 'https://gesundheitsverbund.at',
    desc: 'Vienna\'s public health network. Provides mandatory STI testing (every 6 weeks for registered sex workers), PrEP, HIV testing, and general health services.',
    tags: ['STI testing', 'mandatory testing', 'PrEP', 'HIV'],
    freeService: true,
  },

  // ─── Switzerland ──────────────────────────────────────────────────────────
  {
    name: 'Aspasie', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', city: 'Geneva',
    category: 'Sex Worker Health', phone: '+41 22 906 40 40', website: 'https://aspasie.ch',
    desc: 'Geneva\'s peer-led sex worker organisation. Health consultations, STI testing, PrEP, legal information, social support, and outreach. Run by and for sex workers.',
    tags: ['peer-led', 'STI testing', 'PrEP', 'legal info', 'Geneva'],
    walkIn: true, freeService: true, multilingual: true,
  },
  {
    name: 'ProKoRe', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', city: 'Bern',
    category: 'Rights & Support', phone: '+41 31 534 10 10', website: 'https://prokore.ch',
    desc: 'Berne region coordination network for sex workers. Health resources, networking, rights advocacy, and referrals to specialist services.',
    tags: ['networking', 'health resources', 'Bern', 'rights'],
    freeService: true, multilingual: true,
  },
  {
    name: 'Fleur de Pavé', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', city: 'Geneva',
    category: 'Outreach', website: 'https://fleurdepavedge.ch',
    desc: 'Mobile outreach service for sex workers in Geneva. Health services, harm reduction, social support, and referrals. Reaches workers in venues, hotels, and street-based locations.',
    tags: ['outreach', 'mobile', 'harm reduction', 'Geneva'],
    freeService: true,
  },
  {
    name: 'Checkpoint Zurich', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', city: 'Zurich',
    category: 'STI Testing', website: 'https://checkpointzh.ch',
    desc: 'Free STI testing, rapid HIV testing, PrEP, hepatitis testing and vaccination. Walk-in and appointment slots available. Open evenings and weekends.',
    tags: ['STI testing', 'PrEP', 'rapid HIV', 'hepatitis', 'evening hours'],
    walkIn: true, freeService: true,
  },
  {
    name: 'Checkpoint Geneva (CPHG)', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', city: 'Geneva',
    category: 'HIV/PrEP', website: 'https://checkpointgva.ch',
    desc: 'Free STI and HIV testing, PrEP services, and sexual health counselling. Anonymous. Available to residents and visitors.',
    tags: ['HIV testing', 'PrEP', 'anonymous', 'Geneva'],
    walkIn: true, freeService: true, multilingual: true,
  },
  {
    name: 'FIZ Fachstelle Frauenhandel', country: 'Switzerland', countryCode: 'CH', flag: '🇨🇭', city: 'Zurich (nationwide)',
    category: 'Anti-Trafficking', phone: '+41 44 436 90 00', website: 'https://fiz-info.ch',
    desc: 'Switzerland\'s specialist trafficking victim support centre. Shelter, legal aid, psychological support, immigration advice. Confidential and without reporting obligation.',
    tags: ['trafficking', 'shelter', 'legal aid', 'confidential'],
    freeService: true, multilingual: true,
  },
]

const ALL_COUNTRIES = ['All', 'Belgium', 'Netherlands', 'Germany', 'France', 'Luxembourg', 'Spain', 'Austria', 'Switzerland']
const ALL_CATEGORIES: OrgCategory[] = ['STI Testing', 'Sexual Health', 'Healthcare', 'Sex Worker Health', 'HIV/PrEP', 'Rights & Support', 'Anti-Trafficking', 'Outreach', 'Mental Health', 'Migrant Support']
const COUNTRY_FLAGS: Record<string, string> = { Belgium: '🇧🇪', Netherlands: '🇳🇱', Germany: '🇩🇪', France: '🇫🇷', Luxembourg: '🇱🇺', Spain: '🇪🇸', Austria: '🇦🇹', Switzerland: '🇨🇭' }

const CAT_COLORS: Record<OrgCategory, string> = {
  'STI Testing':      '#26d4a0',
  'Sexual Health':    '#4b9fff',
  'Healthcare':       '#4b9fff',
  'Sex Worker Health':'#c5a05a',
  'HIV/PrEP':         '#e05252',
  'Rights & Support': '#9b6dff',
  'Anti-Trafficking': '#f5944a',
  'Outreach':         '#f5c542',
  'Mental Health':    '#5cbcd6',
  'Migrant Support':  '#26d4a0',
}

// ─── Health Info Data ─────────────────────────────────────────────────────────

const HEALTH_GUIDES = [
  {
    icon: 'ti-virus', title: 'STI Screening Guide', color: '#26d4a0',
    summary: 'Regular STI screening is one of the most important health steps you can take.',
    items: [
      { heading: 'Recommended Frequency', body: 'Every 3 months for HIV, syphilis, gonorrhoea, chlamydia, and hepatitis B/C if you are sexually active with multiple partners or clients. Quarterly testing catches infections early and keeps your community safe.' },
      { heading: 'What to Test For', body: 'At minimum: HIV (Ag/Ab combination test), syphilis (TPPA/VDRL), gonorrhoea (NAAT — urine + swabs from all exposed sites), chlamydia (NAAT). Also consider: hepatitis B, hepatitis C, herpes (if symptomatic), and HPV vaccination if eligible.' },
      { heading: 'Testing Locations', body: 'GGD (Netherlands), GeSuNd clinics (Germany), Violett/Espace P (Belgium), Aspasie/Checkpoint (Switzerland), CeGIDD (France), Médicos del Mundo (Spain, France), LEFÖ (Austria). Many are free and walk-in.' },
      { heading: 'Anonymous Testing', body: 'Most public sexual health clinics offer anonymous testing. You do not need to provide your real name or ID. Ask specifically for anonymous testing when you arrive.' },
    ]
  },
  {
    icon: 'ti-pill', title: 'PrEP (HIV Prevention)', color: '#4b9fff',
    summary: 'PrEP is highly effective at preventing HIV and is free or low-cost in most EU countries.',
    items: [
      { heading: 'What is PrEP?', body: 'Pre-Exposure Prophylaxis (PrEP) is a daily pill (tenofovir/emtricitabine, brand names: Truvada, Descovy) that reduces HIV transmission risk by over 99% when taken correctly. It is not a treatment for HIV — it prevents infection.' },
      { heading: 'Where to Access', body: 'Belgium: RIZIV reimburses PrEP for high-risk individuals (via GP or sexual health clinic). Netherlands: GGD and PrEP clinics — partially reimbursed. Germany: statutory health insurance (GKV) reimburses since 2019. France: CeGIDD centres provide free PrEP. Switzerland: available on prescription, reimbursed by basic insurance. Spain: reimbursed via SNS.' },
      { heading: 'Daily vs Event-Based', body: 'Daily PrEP (one pill every day) offers maximum protection. Event-Based PrEP (2-1-1 dosing: 2 pills 2–24h before, 1 pill 24h after, 1 pill 48h after) is effective for receptive anal sex but NOT recommended for vaginal sex or injecting. Discuss with your doctor.' },
      { heading: 'PrEP and STIs', body: 'PrEP does not protect against other STIs. Continue using condoms for full protection. When on PrEP, get an STI test every 3 months (required for PrEP prescription renewal at most clinics).' },
    ]
  },
  {
    icon: 'ti-vaccine', title: 'Vaccinations', color: '#c5a05a',
    summary: 'Several vaccines are highly recommended and often free for sex workers.',
    items: [
      { heading: 'Hepatitis B', body: 'Highly recommended. The hepatitis B vaccine is a 3-dose course and provides long-term protection. Most sexual health clinics offer it free. If you\'ve never been vaccinated, do so now.' },
      { heading: 'Hepatitis A', body: 'Recommended if you have sexual contact that may include faecal exposure. 2-dose course. Often available free at sexual health clinics or GPs.' },
      { heading: 'HPV (Human Papillomavirus)', body: 'HPV causes cervical cancer, anal cancer, genital warts, and other cancers. Vaccination (Gardasil 9) is most effective before exposure but still beneficial up to age 45 (check national eligibility). Available at GPs and clinics.' },
      { heading: 'Mpox (Monkeypox)', body: 'Vaccination (Imvanex/Jynneos) is available in most EU countries for people at elevated risk, including sex workers. Contact your national health authority or a sexual health clinic.' },
    ]
  },
  {
    icon: 'ti-shield-check', title: 'Safer Work Practices', color: '#9b6dff',
    summary: 'Practical harm reduction that can significantly improve your safety.',
    items: [
      { heading: 'Condom Use', body: 'Consistent, correct condom use is the most effective way to prevent STI transmission during penetrative sex. Use latex or polyurethane condoms — lambskin condoms do not prevent STI transmission. Use water-based lubricant with latex condoms.' },
      { heading: 'Client Screening', body: 'Wherever safe and practical to do so, screening clients in advance reduces risk. Consider: phone/message screening, requiring a reference, using a shared blacklist, or working with a trusted third party. Your safety comes first.' },
      { heading: 'Working Alone vs With Others', body: 'Working with trusted colleagues can increase safety. If working alone, tell someone your location and schedule a check-in. Keep emergency numbers saved in your phone. Trust your instincts — you always have the right to refuse.' },
      { heading: 'Right to Refuse', body: 'You have the absolute right to refuse any client, any act, at any time — regardless of what was agreed beforehand, whether or not any payment has been made. This right is explicitly protected by law in Belgium, and is a universal harm reduction principle.' },
    ]
  },
  {
    icon: 'ti-brain', title: 'Mental Health & Wellbeing', color: '#5cbcd6',
    summary: 'Mental health is health. Accessing support is a sign of strength, not weakness.',
    items: [
      { heading: 'Finding Support', body: 'Many sex worker support organisations offer confidential psychological counselling: Violett (Belgium), P&G069 (Netherlands), Madonna e.V. (Germany), Espace P (Belgium). Regular access to a trusted therapist or counsellor can make a significant difference.' },
      { heading: 'Peer Support', body: 'Talking with others who have shared experience can be uniquely helpful. Sex worker unions and collectives (Utsopi, Proud, STRASS, Aspasie, APROSEX) facilitate peer support networks, forums, and community events.' },
      { heading: 'Burnout & Boundaries', body: 'Setting and maintaining clear personal boundaries — with clients, employers, and in your own scheduling — is essential for long-term wellbeing. Taking planned rest is not optional; it is professional self-care.' },
      { heading: 'Crisis Support', body: 'If you are in crisis: EU-wide emergency number 112. Suicide/crisis lines: Belgium: 0800 32 123. Netherlands: 0800 0113. Germany: 0800 111 0 111. France: 3114. Switzerland: 143. Spain: 024.' },
    ]
  },
  {
    icon: 'ti-heart', title: 'Reproductive & Sexual Health', color: '#e05252',
    summary: 'Contraception, cervical screening, and sexual health care tailored to your needs.',
    items: [
      { heading: 'Contraception', body: 'Multiple effective options: hormonal (pill, patch, ring, injection, implant), non-hormonal (copper IUD), or barrier methods (condoms, diaphragm). Most are reimbursed through national health systems. Discuss options with a GP or gynecologist.' },
      { heading: 'Emergency Contraception', body: 'Available at pharmacies without prescription in Belgium, Netherlands, Germany, France, Spain, Switzerland, and Austria. Most effective within 72 hours of unprotected sex. Some methods effective up to 5 days.' },
      { heading: 'Cervical Screening (Smear Test)', body: 'Recommended every 3 years (or as per national guidelines). Essential for detecting cervical cancer early. Available at GPs, gynecologists, and sexual health clinics. Often free or very low cost.' },
      { heading: 'Pregnancy Options', body: 'All EU countries covered here allow abortion access (Belgium: up to 18 weeks; France: up to 14 weeks; Germany: up to 12 weeks; Netherlands: up to 24 weeks; Spain: up to 14 weeks; Austria: up to 3 months; Switzerland: up to 12 weeks). Consult a GP or reproductive health clinic for confidential advice.' },
    ]
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function MedicalPage() {
  const [tab, setTab] = useState<'orgs' | 'health'>('orgs')
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('All')
  const [filterCat, setFilterCat] = useState<OrgCategory | 'All'>('All')
  const [onlyFree, setOnlyFree] = useState(false)
  const [onlyWalkIn, setOnlyWalkIn] = useState(false)
  const [onlyMultilingual, setOnlyMultilingual] = useState(false)
  const [openGuide, setOpenGuide] = useState<string | null>('STI Screening Guide')

  const filtered = useMemo(() => {
    let res = ORGS
    if (filterCountry !== 'All') res = res.filter(o => o.country === filterCountry)
    if (filterCat !== 'All') res = res.filter(o => o.category === filterCat)
    if (onlyFree) res = res.filter(o => o.freeService)
    if (onlyWalkIn) res = res.filter(o => o.walkIn)
    if (onlyMultilingual) res = res.filter(o => o.multilingual)
    if (search.trim()) {
      const q = search.toLowerCase()
      res = res.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.desc.toLowerCase().includes(q) ||
        o.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return res
  }, [filterCountry, filterCat, onlyFree, onlyWalkIn, onlyMultilingual, search])

  // Group by country
  const grouped = useMemo(() => {
    const g: Record<string, Org[]> = {}
    filtered.forEach(o => {
      if (!g[o.country]) g[o.country] = []
      g[o.country].push(o)
    })
    return g
  }, [filtered])

  const countryOrder = ['Belgium', 'Netherlands', 'Germany', 'France', 'Luxembourg', 'Spain', 'Austria', 'Switzerland']

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--t)', fontFamily: 'var(--sans)' }}>

      {/* NAV */}
      <nav className="sx-subnav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '64px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 14px rgba(197,160,90,0.35))' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/regulations" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-scale" /> Regulations
          </Link>
          <Link href="/" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t2)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-arrow-left" /> Home
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '4.5rem 1.5rem 3.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid var(--b)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(92,188,214,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#5cbcd6', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            <i className="ti ti-heart-rate-monitor" style={{ marginRight: '8px' }} />Medical Information
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>
            Healthcare &amp; <em style={{ fontStyle: 'italic', color: '#5cbcd6' }}>Support Resources</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--t2)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto' }}>
            Verified health organisations, testing centres, and harm reduction resources across Europe — with health guides written for sex workers.
          </p>
        </div>
      </section>

      {/* TABS */}
      <div style={{ position: 'sticky', top: '64px', zIndex: 100, background: 'rgba(8,6,18,0.97)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid var(--b)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', gap: 0 }}>
          {(['orgs', 'health'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ height: '50px', padding: '0 20px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? '#5cbcd6' : 'transparent'}`, cursor: 'pointer', color: tab === t ? '#5cbcd6' : 'var(--t2)', fontSize: '14px', fontWeight: tab === t ? 600 : 400, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <i className={`ti ${t === 'orgs' ? 'ti-map-pin' : 'ti-book-health'}`} />
              {t === 'orgs' ? 'Organisations' : 'Health Guides'}
            </button>
          ))}
        </div>
      </div>

      {/* ── ORGANISATIONS TAB ── */}
      {tab === 'orgs' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', fontSize: '15px', pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organisations…"
                style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {/* Country */}
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              style={{ padding: '9px 12px', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
              {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Countries' : `${COUNTRY_FLAGS[c]} ${c}`}</option>)}
            </select>
            {/* Category */}
            <select value={filterCat} onChange={e => setFilterCat(e.target.value as OrgCategory | 'All')}
              style={{ padding: '9px 12px', background: 'var(--bg1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--t)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {/* Toggle filters */}
            {[
              { label: 'Free service', val: onlyFree, set: setOnlyFree, icon: 'ti-discount-2' },
              { label: 'Walk-in', val: onlyWalkIn, set: setOnlyWalkIn, icon: 'ti-walk' },
              { label: 'Multilingual', val: onlyMultilingual, set: setOnlyMultilingual, icon: 'ti-language' },
            ].map(f => (
              <button key={f.label} onClick={() => f.set(!f.val)}
                style={{ height: '38px', padding: '0 12px', borderRadius: '20px', border: `0.5px solid ${f.val ? '#5cbcd6' : 'var(--b)'}`, background: f.val ? 'rgba(92,188,214,0.1)' : 'transparent', color: f.val ? '#5cbcd6' : 'var(--t2)', fontSize: '12px', fontWeight: f.val ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className={`ti ${f.icon}`} />{f.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div style={{ fontSize: '12px', color: 'var(--t3)', marginBottom: '1.5rem' }}>
            Showing <strong style={{ color: 'var(--t)' }}>{filtered.length}</strong> organisation{filtered.length !== 1 ? 's' : ''}
            {filterCountry !== 'All' ? ` in ${filterCountry}` : ' across Europe'}
          </div>

          {/* Country groups */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--t3)' }}>
              <i className="ti ti-building-hospital" style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }} />
              No organisations match your filters.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {countryOrder.filter(c => grouped[c]).map(country => (
                <div key={country}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{COUNTRY_FLAGS[country]}</span>
                    <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 500, margin: 0 }}>{country}</h2>
                    <span style={{ fontSize: '12px', color: 'var(--t3)', background: 'var(--bg2)', border: '0.5px solid var(--b)', borderRadius: '10px', padding: '2px 10px' }}>{grouped[country].length} org{grouped[country].length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px,100%), 1fr))', gap: '12px' }}>
                    {grouped[country].map((org, i) => {
                      const catColor = CAT_COLORS[org.category] || 'var(--gold)'
                      return (
                        <div key={i} style={{ background: 'var(--bg1)', border: '0.5px solid var(--b)', borderRadius: 'var(--rl)', padding: '1.1rem 1.25rem', transition: 'border-color .2s, transform .15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${catColor}55`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b)'; (e.currentTarget as HTMLElement).style.transform = '' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px', gap: '8px' }}>
                            <h3 style={{ fontWeight: 600, fontSize: '15px', margin: 0, color: 'var(--t)', flex: 1 }}>{org.name}</h3>
                            <span style={{ fontSize: '10px', color: catColor, background: `${catColor}18`, border: `0.5px solid ${catColor}44`, borderRadius: '8px', padding: '2px 8px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{org.category}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <i className="ti ti-map-pin" style={{ fontSize: '11px', color: 'var(--t3)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--t3)' }}>{org.city}</span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6, margin: '0 0 10px' }}>{org.desc}</p>
                          {/* Tags */}
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {org.freeService && <span style={{ fontSize: '10px', color: '#26d4a0', background: 'rgba(38,212,160,0.1)', border: '0.5px solid rgba(38,212,160,0.3)', borderRadius: '6px', padding: '1px 7px' }}>Free</span>}
                            {org.walkIn && <span style={{ fontSize: '10px', color: '#4b9fff', background: 'rgba(75,159,255,0.1)', border: '0.5px solid rgba(75,159,255,0.3)', borderRadius: '6px', padding: '1px 7px' }}>Walk-in</span>}
                            {org.multilingual && <span style={{ fontSize: '10px', color: '#f5c542', background: 'rgba(245,197,66,0.1)', border: '0.5px solid rgba(245,197,66,0.3)', borderRadius: '6px', padding: '1px 7px' }}>Multilingual</span>}
                          </div>
                          {/* Contact */}
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {org.phone && (
                              <a href={`tel:${org.phone}`} style={{ fontSize: '12px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="ti ti-phone" style={{ fontSize: '12px' }} />{org.phone}
                              </a>
                            )}
                            {org.email && (
                              <a href={`mailto:${org.email}`} style={{ fontSize: '12px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="ti ti-mail" style={{ fontSize: '12px' }} />{org.email}
                              </a>
                            )}
                            {org.website && (
                              <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: catColor, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <i className="ti ti-external-link" style={{ fontSize: '12px' }} />Visit website
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HEALTH GUIDES TAB ── */}
      {tab === 'health' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>
          <p style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Practical, accurate health information written for sex workers. These guides are for general information — always consult a healthcare professional for personal medical advice.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {HEALTH_GUIDES.map(guide => {
              const isOpen = openGuide === guide.title
              return (
                <div key={guide.title} style={{ background: 'var(--bg1)', border: `0.5px solid ${isOpen ? guide.color + '44' : 'var(--b)'}`, borderRadius: 'var(--rl)', overflow: 'hidden', transition: 'border-color .2s' }}>
                  <button onClick={() => setOpenGuide(isOpen ? null : guide.title)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '1.1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t)', textAlign: 'left' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${guide.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ${guide.icon}`} style={{ fontSize: '20px', color: guide.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 500, marginBottom: '2px' }}>{guide.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--t3)' }}>{guide.summary}</div>
                    </div>
                    <i className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '16px', color: 'var(--t3)', flexShrink: 0 }} />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.25rem 1.25rem', borderTop: `0.5px solid ${guide.color}22` }}>
                      {guide.items.map((item, i) => (
                        <div key={i} style={{ padding: '1rem 0', borderBottom: i < guide.items.length - 1 ? '0.5px solid var(--b)' : 'none' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: guide.color, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: guide.color, flexShrink: 0, display: 'inline-block' }} />
                            {item.heading}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.75, margin: '0 0 0 10px' }}>{item.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Emergency numbers */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(224,82,82,0.06)', border: '0.5px solid rgba(224,82,82,0.2)', borderRadius: 'var(--rl)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <i className="ti ti-phone-emergency" style={{ fontSize: '22px', color: '#e05252' }} />
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 500, margin: 0 }}>Emergency & Crisis Lines</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { country: 'EU-wide', number: '112', label: 'Emergency' },
                { country: 'EU-wide', number: '+32 2 555 45 50', label: 'Anti-Trafficking Hotline' },
                { country: 'Belgium', number: '0800 32 123', label: 'Crisis / Suicide' },
                { country: 'Netherlands', number: '0800 0113', label: 'Crisis / Suicide' },
                { country: 'Germany', number: '0800 111 0 111', label: 'Crisis / Suicide' },
                { country: 'France', number: '3114', label: 'Crisis / Suicide' },
                { country: 'Spain', number: '024', label: 'Crisis / Suicide' },
                { country: 'Switzerland', number: '143', label: 'Crisis / Suicide' },
                { country: 'Austria', number: '142', label: 'Crisis / Suicide' },
              ].map((e, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: 'var(--r)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: '2px' }}>{e.country} — {e.label}</div>
                  <a href={`tel:${e.number}`} style={{ fontWeight: 700, fontSize: '14px', color: '#e05252', textDecoration: 'none' }}>{e.number}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--t3)', maxWidth: '700px', margin: '0 auto 1rem', lineHeight: 1.7 }}>
          Organisation information is verified but may change. Always call ahead to confirm opening hours, services, and availability.
          SecretXperience does not provide medical advice. Consult a qualified healthcare professional for personal medical decisions.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/regulations" style={{ fontSize: '13px', color: 'var(--gold)', textDecoration: 'none' }}>Regulation Guide →</Link>
          <Link href="/partners" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Partner Directory →</Link>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Back to Platform →</Link>
        </div>
      </div>
    </div>
  )
}
