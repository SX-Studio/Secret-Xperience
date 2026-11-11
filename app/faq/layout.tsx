import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Frequently Asked Questions | SecretXperience',
  description: 'Answers about verification, advertising, tokens, privacy and safety on SecretXperience.',
  openGraph: { title: 'Frequently Asked Questions | SecretXperience', description: 'Answers about verification, advertising, tokens, privacy and safety on SecretXperience.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
