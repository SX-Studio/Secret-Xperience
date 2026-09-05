/**
 * Crypto token purchases via NOWPayments (adult-friendly, multi-coin hosted
 * checkout + IPN webhook). A parallel rail to Verotel: no card processor can
 * decline crypto, so this stays available even while a card PSP is pending.
 *
 * Self-contained config like the Verotel routes: returns configured:false until
 * BOTH the API key and IPN secret are set, so the charge route can respond
 * { configured:false } and the tokens page shows the graceful modal instead of
 * a 503 — nothing breaks before the keys are added in Vercel.
 *
 * Env vars (set in Vercel):
 *   NOWPAYMENTS_API_KEY     — from the NOWPayments dashboard (Store settings → API keys)
 *   NOWPAYMENTS_IPN_SECRET  — Store settings → IPN secret (signs the webhook)
 */
import { createHmac, timingSafeEqual } from 'crypto'
import { siteUrl } from './site'

const API = 'https://api.nowpayments.io/v1'

export function nowpaymentsConfig() {
  const apiKey = (process.env.NOWPAYMENTS_API_KEY || '').trim()
  const ipnSecret = (process.env.NOWPAYMENTS_IPN_SECRET || '').trim()
  return { configured: Boolean(apiKey && ipnSecret), apiKey, ipnSecret }
}

// Create a hosted invoice; the buyer picks the coin on NOWPayments' page and is
// returned to /tokens afterwards. Wallet credit happens later via the IPN webhook.
export async function createInvoice(opts: {
  apiKey: string
  priceEur: number
  orderId: string
  description: string // ASCII, slash-free (keeps IPN signature parity simple)
}): Promise<{ url: string; id: string } | null> {
  const origin = siteUrl()
  const res = await fetch(`${API}/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': opts.apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: opts.priceEur,
      price_currency: 'eur',
      order_id: opts.orderId,
      order_description: opts.description,
      ipn_callback_url: `${origin}/api/nowpayments/webhook`,
      success_url: `${origin}/tokens?status=success`,
      cancel_url: `${origin}/tokens?status=cancel`,
    }),
  })
  if (!res.ok) return null
  const j = (await res.json()) as { id?: string | number; invoice_url?: string }
  if (!j.invoice_url) return null
  return { url: j.invoice_url, id: String(j.id ?? '') }
}

// IPN signature: HMAC-SHA512 of the JSON body with keys sorted alphabetically,
// keyed with the IPN secret, compared to the x-nowpayments-sig header.
export function verifyIpn(body: unknown, signature: string, secret: string): boolean {
  if (!signature) return false
  const payload = JSON.stringify(sortDeep(body))
  const digest = createHmac('sha512', secret).update(payload).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature.toLowerCase()))
  } catch {
    return false
  }
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep)
  if (v && typeof v === 'object') {
    const obj = v as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj).sort()) out[k] = sortDeep(obj[k])
    return out
  }
  return v
}
