import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'How SecretXperience Works | SecretXperience',
  description: 'How to find, contact and meet verified advertisers discreetly, and how advertisers get listed and verified.',
  openGraph: { title: 'How SecretXperience Works | SecretXperience', description: 'How to find, contact and meet verified advertisers discreetly, and how advertisers get listed and verified.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
