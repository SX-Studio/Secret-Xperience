import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getAdminProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { RP_NAME, rpID } from '@/lib/webauthn';

export async function POST() {
  const profile = await getAdminProfile();
  if (!profile) return new Response('Not found', { status: 404 });

  const admin = createAdminClient();
  const { data: creds } = await admin
    .from('webauthn_credentials')
    .select('credential_id, transports')
    .eq('user_id', profile.id);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rpID(),
    userName: profile.public_code,
    userDisplayName: profile.display_name ?? profile.public_code,
    userID: new TextEncoder().encode(profile.id),
    attestationType: 'none',
    excludeCredentials: (creds ?? []).map((c) => ({
      id: c.credential_id as string,
      transports: (c.transports ?? []) as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'required',
      authenticatorAttachment: 'platform', // device biometric (fingerprint/Face)
    },
  });

  await admin.from('webauthn_challenges').insert({
    user_id: profile.id,
    challenge: options.challenge,
    kind: 'register',
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  return Response.json(options);
}
