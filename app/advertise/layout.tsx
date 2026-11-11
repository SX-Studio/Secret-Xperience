import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Advertise on SecretXperience | SecretXperience',
  description: 'Reach clients across Belgium, the Netherlands, Germany and France. Verified adverts, premium placements and B2B packages.',
  openGraph: { title: 'Advertise on SecretXperience | SecretXperience', description: 'Reach clients across Belgium, the Netherlands, Germany and France. Verified adverts, premium placements and B2B packages.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
