import { redirect } from 'next/navigation'

// Paid featured boosts are switched off (see app/api/featured-boost/route.ts).
export const dynamic = 'force-dynamic'

export default function BoostPage() {
  redirect('/advertise')
}
