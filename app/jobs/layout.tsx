import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Adult Industry Jobs | SecretXperience',
  description: 'Vacancies and opportunities for escorts, creators, hostesses and venue staff across Belgium and Europe.',
  openGraph: { title: 'Adult Industry Jobs | SecretXperience', description: 'Vacancies and opportunities for escorts, creators, hostesses and venue staff across Belgium and Europe.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
