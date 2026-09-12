// WebAuthn / passkey configuration for the admin fingerprint gate.
// RP ID must be the registrable domain (e.g. content24market.space);
// origin must be the full https origin. Locally: rpID 'localhost', origin http://localhost:3000.

export const RP_NAME = 'Content Box Admin';

export function rpID(): string {
  return process.env.NEXT_PUBLIC_RP_ID || 'localhost';
}

export function expectedOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}
