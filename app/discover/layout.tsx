import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Discover — Private Gallery | SecretXperience',
  description: 'Swipe through verified adverts and save your favourites. A private gallery of escorts, companions and more.',
  openGraph: { title: 'Discover — Private Gallery | SecretXperience', description: 'Swipe through verified adverts and save your favourites. A private gallery of escorts, companions and more.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
