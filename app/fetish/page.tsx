'use client'

import CommunityHub from '../components/community/CommunityHub'

export default function FetishPage() {
  return (
    <CommunityHub
      venueCategory="Domina & Fetish"
      dbCategory="fetish"
      accent="#a86bd8"
      eyebrow="Fetish · Domina · BDSM — across Europe"
      title={<>Domina Studios &amp; <em style={{ fontStyle: 'italic', color: '#a86bd8' }}>Fetish Venues</em></>}
      blurb="A curated European directory of domina studios, BDSM dungeons, fetish clubs and play spaces. Professional, consensual and discreet — each entry links to the venue's own site. Run a studio? List it below."
      info={[
        { h: 'What you’ll find here', p: 'Professional domina studios, equipped dungeons, fetish and BDSM clubs, and kink-friendly play parties. Listings span Belgium, the Netherlands, Germany and France today, and grow across the rest of Europe as venues submit themselves.' },
        { h: 'Consent, safety & discretion', p: 'Everything listed is strictly adults-only (18+) and premised on informed, enthusiastic consent between all participants. Agree limits and a safeword in advance, respect house rules, and never share other guests’ identities. If a venue advertises anything non-consensual, report it.' },
        { h: 'For studios & organisers', p: 'Listing is self-serve and free: submit your studio or club below and our team reviews it before it goes live. Keep your details current — you can resubmit updates any time.' },
      ]}
    />
  )
}
