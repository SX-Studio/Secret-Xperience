import { cookies } from 'next/headers'
import { verifyGrant, GRANT_COOKIE } from '../lib/controlekamer'
import Gate from './Gate'
import ControlRoom from './ControlRoom'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Controlekamer',
  robots: { index: false, follow: false },
}

export default function ControlekamerPage() {
  const grant = verifyGrant(cookies().get(GRANT_COOKIE)?.value)
  return grant ? <ControlRoom /> : <Gate />
}
