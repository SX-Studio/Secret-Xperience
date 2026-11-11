import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Erotic Venues & Clubs Directory | SecretXperience',
  description: 'Private clubs, saunas, swinger clubs and erotic venues across Europe, with addresses and websites.',
  openGraph: { title: 'Erotic Venues & Clubs Directory | SecretXperience', description: 'Private clubs, saunas, swinger clubs and erotic venues across Europe, with addresses and websites.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
