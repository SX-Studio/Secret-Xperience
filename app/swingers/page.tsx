'use client'

import CommunityHub from '../components/community/CommunityHub'

export default function SwingersPage() {
  return (
    <CommunityHub
      venueCategory="Swingers Clubs"
      dbCategory="swingers"
      accent="#e0708a"
      eyebrow="Swinger & parenclubs — across Europe"
      title={<>Swinger Clubs &amp; <em style={{ fontStyle: 'italic', color: '#e0708a' }}>Parenclubs</em></>}
      blurb="A curated European directory of swinger clubs, parenclubs and couples-friendly play parties. Themed nights, sauna clubs and liberal venues — each entry links to the club's own site. Run a club? List it below."
      info={[
        { h: 'What you’ll find here', p: 'Swinger clubs and Dutch-style parenclubs, couples and singles nights, liberal sauna clubs and themed play parties. Coverage starts in Belgium, the Netherlands, Germany and France and expands across Europe as clubs add themselves.' },
        { h: 'Etiquette & house rules', p: 'Every club sets its own door policy, dress code and single/couple ratio — check before you travel. Consent and “no means no” are universal: a polite no ends any approach. Phones and photos are almost always forbidden inside; respect everyone’s privacy.' },
        { h: 'For club owners & organisers', p: 'Listing is self-serve and free: submit your club or party below and our team reviews it before publishing. Update your entry whenever your nights or policies change.' },
      ]}
    />
  )
}
