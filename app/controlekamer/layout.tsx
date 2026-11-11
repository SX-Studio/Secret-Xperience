// The approve page is a client component and cannot set metadata itself; without this
// it would carry the public homepage title and be indexable.
export const metadata = {
  title: 'Controlekamer',
  robots: { index: false, follow: false },
}

export default function ControlekamerLayout({ children }: { children: React.ReactNode }) {
  return children
}
