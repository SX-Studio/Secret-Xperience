import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getAdminProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { rpID } from '@/lib/webauthn';

export async function POST() {
  const profile = await getAdminProfile();
  if (!profile) return new Response('Not found', { status: 404 });

  const admin = createAdminClient();
  const { data: creds } = await admin
    .from('webauthn_credentials')
    .select('credential_id, transports')
    .eq('user_id', profile.id);

  if (!creds || creds.length === 0) {
    // No passkey yet — the client should run registration instead.
    return Response.json({ needsRegister: true });
  }

  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: 'required',
    allowCredentials: creds.map((c) => ({
      id: c.credential_id as string,
      transports: (c.transports ?? []) as AuthenticatorTransport[],
    })),
  });

  await admin.from('webauthn_challenges').insert({
    user_id: profile.id,
    challenge: options.challenge,
    kind: 'authenticate',
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  return Response.json(options);
}
