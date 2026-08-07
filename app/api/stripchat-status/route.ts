import { NextResponse } from 'next/server'

// Live status for the Stripchat profile cards on the homepage.
// Queries Stripchat's public model API server-side (no CORS in the browser);
// cached for 60s at the edge so we never hammer their API.
const MODELS = ['Martyca_Beee', 'IdaJonesy', 'Onlyxlicious_sc', 'Jenny-Mystery-X', 'VlaamseYaira']

export const dynamic = 'force-dynamic'

export async function GET() {
  const status: Record<string, boolean> = {}

  await Promise.all(MODELS.map(async (m) => {
    try {
      const res = await fetch(`https://stripchat.com/api/front/v2/models/username/${m}/cam`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SecretXperience/1.0)' },
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
        next: { revalidate: 60 },
      })
      if (!res.ok) { status[m] = false; return }
      const data = await res.json()
      const u = data?.user?.user
      status[m] = Boolean(u?.isLive || (u?.status && u.status !== 'off' && u.status !== 'idle'))
    } catch {
      status[m] = false
    }
  }))

  return NextResponse.json(status, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
