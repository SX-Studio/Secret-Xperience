import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Videos | SecretXperience',
  description: 'Clips and previews from verified advertisers and creators on SecretXperience.',
  openGraph: { title: 'Videos | SecretXperience', description: 'Clips and previews from verified advertisers and creators on SecretXperience.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
