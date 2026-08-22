import crypto from 'node:crypto';

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Raw token is shown once (in the SMS link); only its hash is stored.
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashInviteToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function inviteUrl(rawToken: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/invite/${rawToken}`;
}
