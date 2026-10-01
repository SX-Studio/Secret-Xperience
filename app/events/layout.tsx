import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Adult Events & Parties in Belgium & Europe | SecretXperience',
  description: 'Upcoming adult events, swinger parties, fetish nights and club evenings across Belgium, the Netherlands, Germany and France. Dates, venues and tickets.',
  openGraph: { title: 'Adult Events & Parties in Belgium & Europe | SecretXperience', description: 'Upcoming adult events, swinger parties, fetish nights and club evenings across Belgium, the Netherlands, Germany and France. Dates, venues and tickets.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
