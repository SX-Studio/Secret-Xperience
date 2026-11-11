import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Fetish, BDSM & Domination | SecretXperience',
  description: 'Professional dominants, fetish specialists and BDSM-friendly adverts and venues across Belgium and Europe.',
  openGraph: { title: 'Fetish, BDSM & Domination | SecretXperience', description: 'Professional dominants, fetish specialists and BDSM-friendly adverts and venues across Belgium and Europe.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
