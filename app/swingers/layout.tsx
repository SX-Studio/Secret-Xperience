import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Swingers Clubs & Couples | SecretXperience',
  description: 'Swinger clubs, parties and couple-friendly adverts across Belgium, the Netherlands, Germany and France.',
  openGraph: { title: 'Swingers Clubs & Couples | SecretXperience', description: 'Swinger clubs, parties and couple-friendly adverts across Belgium, the Netherlands, Germany and France.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
