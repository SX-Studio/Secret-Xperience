// Twilio Verify helper for the Controlekamer SMS-OTP second factor.
// Uses the REST API directly (no SDK dependency). Twilio owns the code lifecycle
// (generation, expiry, attempt limits) — we only ask it to send and to check.

const VERIFY_BASE = 'https://verify.twilio.com/v2/Services'

function sid() { return (process.env.TWILIO_ACCOUNT_SID || '').trim() }
function authToken() { return (process.env.TWILIO_AUTH_TOKEN || '').trim() }
function verifyService() { return (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim() }
export function otpPhone() { return (process.env.CONTROLEKAMER_OTP_PHONE || '').trim() }

// OTP is only enforced when all Twilio settings AND a destination number are present.
export function twilioConfigured(): boolean {
  return Boolean(sid() && authToken() && verifyService() && otpPhone())
}

// Show only the last 2 digits so the desktop can hint where the code went.
export function maskPhone(p: string): string {
  const digits = p.replace(/[^\d]/g, '')
  if (digits.length < 2) return '••'
  return '•••• ' + digits.slice(-2)
}

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${sid()}:${authToken()}`).toString('base64')
}

async function verifyPost(path: string, body: Record<string, string>): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const res = await fetch(`${VERIFY_BASE}/${verifyService()}/${path}`, {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString(),
    })
    const json: any = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: json?.message || `twilio ${res.status}` }
    return { ok: true, status: json?.status }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'twilio request failed' }
  }
}

// Trigger an OTP SMS to the configured admin number.
export async function sendOtp(): Promise<{ ok: boolean; error?: string }> {
  const r = await verifyPost('Verifications', { To: otpPhone(), Channel: 'sms' })
  return { ok: r.ok, error: r.error }
}

// Check a code the admin typed. Returns true only on Twilio status "approved".
export async function checkOtp(code: string): Promise<{ ok: boolean; error?: string }> {
  const r = await verifyPost('VerificationCheck', { To: otpPhone(), Code: code })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: r.status === 'approved', error: r.status === 'approved' ? undefined : 'invalid_code' }
}
