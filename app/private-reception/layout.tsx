import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Private Reception — Privé Ontvangst in Belgium | SecretXperience',
  description: 'Independent ladies receiving privately in Brussels, Antwerp, Ghent and across Belgium. Verified adverts with real photos, prices and WhatsApp contact.',
  openGraph: { title: 'Private Reception — Privé Ontvangst in Belgium | SecretXperience', description: 'Independent ladies receiving privately in Brussels, Antwerp, Ghent and across Belgium. Verified adverts with real photos, prices and WhatsApp contact.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
