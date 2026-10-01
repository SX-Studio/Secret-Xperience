import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Refer & Earn | SecretXperience',
  description: 'Invite advertisers and friends to SecretXperience and earn token rewards.',
  robots: { index: false, follow: false },
  openGraph: { title: 'Refer & Earn | SecretXperience', description: 'Invite advertisers and friends to SecretXperience and earn token rewards.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
