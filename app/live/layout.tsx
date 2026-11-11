import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Live Cams | SecretXperience',
  description: 'Live cam performers streaming now. Verified adult entertainment partners of SecretXperience.',
  openGraph: { title: 'Live Cams | SecretXperience', description: 'Live cam performers streaming now. Verified adult entertainment partners of SecretXperience.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
