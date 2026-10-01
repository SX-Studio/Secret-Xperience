import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Sign in | SecretXperience',
  description: 'Sign in to your SecretXperience account or create a new one.',
  robots: { index: false, follow: false },
  openGraph: { title: 'Sign in | SecretXperience', description: 'Sign in to your SecretXperience account or create a new one.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
