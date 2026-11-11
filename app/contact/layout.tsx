import type { Metadata } from 'next'

// The page is a client component and cannot export metadata; the layout carries it.
export const metadata: Metadata = {
  title: 'Contact Us | SecretXperience',
  description: 'Get in touch with the SecretXperience team for support, advertising and partnership enquiries.',
  openGraph: { title: 'Contact Us | SecretXperience', description: 'Get in touch with the SecretXperience team for support, advertising and partnership enquiries.' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
