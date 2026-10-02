import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Adult Nightlife & Venues | SecretXperience',
  description: 'Private clubs, swinger clubs, bars and erotic venues across Belgium and Europe. Verified listings with addresses and opening hours.',
  openGraph: { title: 'Adult Nightlife & Venues | SecretXperience', description: 'Private clubs, swinger clubs, bars and erotic venues across Belgium and Europe. Verified listings with addresses and opening hours.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
