/**
 * Bird (formerly MessageBird) SMS client — server-only.
 *
 * Used by the admin consent campaign: one-time GDPR Art. 14 notice to advertisers
 * whose listings were sourced from a third-party directory. Bird receives the
 * recipient number only to deliver the SMS; everything else stays in Supabase.
 *
 * Env (Vercel):
 *   BIRD_API_KEY         bk_eu1_… (region is read from the key prefix)
 *   BIRD_SMS_FROM        alphanumeric sender ID or an owned Bird number
 *   BIRD_WEBHOOK_SECRET  whsec_… from the webhook subscription (shown once)
 */
import { createHmac, timingSafeEqual } from 'crypto'

export type BirdConfig = { key: string; from: string; base: string }

export function birdConfig(): BirdConfig | null {
  const key = (process.env.BIRD_API_KEY ?? '').trim()
  const from = (process.env.BIRD_SMS_FROM ?? '').trim()
  if (!key || !from) return null
  const region = key.startsWith('bk_us1') ? 'us1' : 'eu1'
  return { key, from, base: `https://${region}.platform.bird.com` }
}

export type SmsCategory = 'service' | 'transactional' | 'marketing' | 'authentication'

/** POST /v1/sms/messages → 202 { id, status: 'accepted' } */
export async function sendSms(to: string, text: string, category: SmsCategory = 'service'): Promise<{ id: string; status: string }> {
  const cfg = birdConfig()
  if (!cfg) throw new Error('Bird is not configured (BIRD_API_KEY / BIRD_SMS_FROM)')
  const res = await fetch(`${cfg.base}/v1/sms/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, from: cfg.from, text, category }),
  })
  const json: any = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Bird ${res.status}: ${json?.message || json?.error || json?.title || 'send failed'}`)
  return { id: String(json?.id ?? ''), status: String(json?.status ?? 'accepted') }
}

/**
 * Standard-Webhooks verification (Bird follows the spec): HMAC-SHA256 over
 * "{webhook-id}.{webhook-timestamp}.{raw body}" keyed with the base64-decoded
 * secret (minus its whsec_ prefix). Rejects deliveries older than 5 minutes.
 */
export function verifyBirdWebhook(
  rawBody: string,
  h: { id?: string | null; timestamp?: string | null; signature?: string | null },
  secret = process.env.BIRD_WEBHOOK_SECRET ?? '',
): boolean {
  if (!secret || !h.id || !h.timestamp || !h.signature) return false
  const ts = Number(h.timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false
  const keyB64 = secret.startsWith('whsec_') ? secret.slice(6) : secret
  const expected = createHmac('sha256', Buffer.from(keyB64, 'base64'))
    .update(`${h.id}.${h.timestamp}.${rawBody}`)
    .digest('base64')
  const exp = Buffer.from(expected)
  // Header may list several space-separated "v1,<sig>" entries (key rotation).
  return h.signature.split(' ').some(part => {
    const sig = Buffer.from(part.startsWith('v1,') ? part.slice(3) : part)
    return sig.length === exp.length && timingSafeEqual(sig, exp)
  })
}

/** Loose E.164 normaliser for advertiser-entered numbers; default country BE (+32). */
export function toE164(raw: string | null | undefined, defaultCc = '32'): string | null {
  let s = (raw ?? '').replace(/[\s().\- ]/g, '')
  if (!s) return null
  if (s.startsWith('00')) s = '+' + s.slice(2)
  else if (s.startsWith('0')) s = '+' + defaultCc + s.slice(1)
  else if (!s.startsWith('+')) s = '+' + s
  return /^\+[1-9]\d{6,14}$/.test(s) ? s : null
}

/** Map a free-text reply to a campaign decision. */
export function parseDecision(text: string | null | undefined): 'keep' | 'remove' | 'stop' | null {
  const t = (text ?? '').trim().toLowerCase()
  if (!t) return null
  if (/^(stop|stopp|unsubscribe|arret|arrêt|stoppen|cancel)\b/.test(t)) return 'stop'
  if (/\b(remove|delete|verwijder|supprim|löschen|loschen|weg|nee|no)\b/.test(t)) return 'remove'
  if (/\b(keep|ja|yes|oui|ok|okay|behoud|houden|garder|behalten|akkoord|agree)\b/.test(t)) return 'keep'
  return null
}
