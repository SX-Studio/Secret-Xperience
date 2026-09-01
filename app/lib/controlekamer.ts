import crypto from 'crypto'

// Grant cookie that unlocks the desktop once a phone has approved the session.
// Signed with INTERNAL_SECRET (already shared across internal routes) so no new secret is needed.
export const GRANT_COOKIE = 'sx_ck_grant'
export const GRANT_TTL_HOURS = 12

function secret(): string {
  return (process.env.INTERNAL_SECRET || process.env.NEXT_PUBLIC_INTERNAL_SECRET || '').trim()
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function sign(data: string): string {
  return b64url(crypto.createHmac('sha256', secret()).update(data).digest())
}

export function newToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

export function newCode(): string {
  // 6 unambiguous chars (no 0/O/1/I) shown on desktop + phone to compare before approving.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(6)
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('')
}

// Constant-time-ish equality on the signature portion.
function safeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export function mintGrant(adminId: string): string {
  const exp = Date.now() + GRANT_TTL_HOURS * 3600 * 1000
  const payload = b64url(JSON.stringify({ sub: adminId, exp }))
  return `${payload}.${sign(payload)}`
}

export function verifyGrant(value: string | undefined | null): { sub: string; exp: number } | null {
  if (!value || !secret()) return null
  const [payload, sig] = value.split('.')
  if (!payload || !sig) return null
  if (!safeEq(sig, sign(payload))) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    if (!decoded?.sub || typeof decoded.exp !== 'number' || decoded.exp < Date.now()) return null
    return decoded
  } catch {
    return null
  }
}
