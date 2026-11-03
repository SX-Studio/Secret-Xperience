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
import { SHOP_ORIGIN } from './domains'

const API = 'https://api.nowpayments.io/v1'

export function nowpaymentsConfig() {
  const apiKey = (process.env.NOWPAYMENTS_API_KEY || '').trim()
  const ipnSecret = (process.env.NOWPAYMENTS_IPN_SECRET || '').trim()
  return { configured: Boolean(apiKey && ipnSecret), apiKey, ipnSecret }
}

// Create a hosted invoice; the buyer picks the coin on NOWPayments' page and is
// returned to the storefront's /tokens afterwards. Wallet credit happens later via the IPN webhook.
export async function createInvoice(opts: {
  apiKey: string
  priceEur: number
  orderId: string
  description: string // ASCII, slash-free (keeps IPN signature parity simple)
}): Promise<{ ok: true; url: string; id: string } | { ok: false; reason: string }> {
  // Tokens are sold on the storefront, so the buyer returns there and the IPN is
  // addressed there too: the processor sees one domain end to end. SHOP_ORIGIN is
  // a fixed https constant, so the old NEXT_PUBLIC_SITE_URL sanity check is moot.
  const res = await fetch(`${API}/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': opts.apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: opts.priceEur,
      price_currency: 'eur',
      order_id: opts.orderId,
      order_description: opts.description,
      ipn_callback_url: `${SHOP_ORIGIN}/api/nowpayments/webhook`,
      success_url: `${SHOP_ORIGIN}/tokens?status=success`,
      cancel_url: `${SHOP_ORIGIN}/tokens?status=cancel`,
    }),
  })
  // Carry NOWPayments' own words out. Swallowing the provider's reason is what cost
  // this project two debugging rounds on Bird. The API key is never echoed.
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    return { ok: false, reason: `NOWPayments invoice failed (${res.status})${detail ? `: ${detail.slice(0, 300)}` : ''}` }
  }
  const j = (await res.json().catch(() => null)) as { id?: string | number; invoice_url?: string } | null
  if (!j?.invoice_url) return { ok: false, reason: 'NOWPayments returned no invoice_url' }
  return { ok: true, url: j.invoice_url, id: String(j.id ?? '') }
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
