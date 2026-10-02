import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'LGBTQ+ Escorts, Trans & Couples | SecretXperience',
  description: 'Gay, bisexual, trans and couple adverts across Belgium and Europe. Inclusive, verified and discreet.',
  openGraph: { title: 'LGBTQ+ Escorts, Trans & Couples | SecretXperience', description: 'Gay, bisexual, trans and couple adverts across Belgium and Europe. Inclusive, verified and discreet.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
