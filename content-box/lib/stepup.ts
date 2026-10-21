import crypto from 'node:crypto';
import { expectedOrigin } from '@/lib/webauthn';

// Short-lived, HMAC-signed step-up token proving a fresh fingerprint (WebAuthn)
// unlock for a specific admin. Carried in an httpOnly cookie; verified on /admin.
export const STEPUP_COOKIE = 'cb_admin_stepup';
export const STEPUP_TTL_MS = 30 * 60 * 1000; // 30 minutes

function secret(): string {
  const s = process.env.ADMIN_STEPUP_SECRET;
  if (!s || s.length < 16) {
    throw new Error('ADMIN_STEPUP_SECRET missing or too short (>=16 chars)');
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function issueStepUp(uid: string): string {
  const payload = `${uid}.${Date.now() + STEPUP_TTL_MS}`;
  const token = Buffer.from(payload).toString('base64url');
  return `${token}.${sign(payload)}`;
}

// Set-Cookie value for the step-up token. Secure is omitted only for plain-http
// (local dev) so the cookie is actually stored there; always Secure in prod.
export function buildStepUpCookie(uid: string): string {
  const token = issueStepUp(uid);
  const secure = expectedOrigin().startsWith('https') ? ' Secure;' : '';
  return `${STEPUP_COOKIE}=${token}; HttpOnly;${secure} SameSite=Lax; Path=/admin; Max-Age=${Math.floor(
    STEPUP_TTL_MS / 1000,
  )}`;
}

export function verifyStepUp(token: string | undefined | null, uid: string): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const tokenPart = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let payload: string;
  try {
    payload = Buffer.from(tokenPart, 'base64url').toString();
  } catch {
    return false;
  }

  const expected = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  const sep = payload.lastIndexOf('.');
  if (sep <= 0) return false;
  const tokenUid = payload.slice(0, sep);
  const exp = Number(payload.slice(sep + 1));
  if (tokenUid !== uid) return false;
  return Number.isFinite(exp) && Date.now() < exp;
}
