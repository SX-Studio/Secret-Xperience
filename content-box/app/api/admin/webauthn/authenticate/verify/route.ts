import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { getAdminProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { rpID, expectedOrigin } from '@/lib/webauthn';
import { buildStepUpCookie } from '@/lib/stepup';
import { writeAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const profile = await getAdminProfile();
  if (!profile) return new Response('Not found', { status: 404 });

  const body = (await req.json()) as { response?: AuthenticationResponseJSON };
  if (!body?.response) return new Response('Bad request', { status: 400 });

  const admin = createAdminClient();

  const { data: cred } = await admin
    .from('webauthn_credentials')
    .select('id, credential_id, public_key, counter, transports')
    .eq('user_id', profile.id)
    .eq('credential_id', body.response.id)
    .maybeSingle();
  if (!cred) return new Response('Unknown credential', { status: 400 });

  const { data: challenge } = await admin
    .from('webauthn_challenges')
    .select('id, challenge')
    .eq('user_id', profile.id)
    .eq('kind', 'authenticate')
    .gt('expires_at', new Date().toISOString())
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!challenge) return new Response('No challenge', { status: 400 });

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge as string,
      expectedOrigin: expectedOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: true,
      credential: {
        id: cred.credential_id as string,
        publicKey: new Uint8Array(Buffer.from(cred.public_key as string, 'base64')),
        counter: Number(cred.counter),
        transports: (cred.transports ?? []) as AuthenticatorTransport[],
      },
    });
  } catch {
    return new Response('Verification failed', { status: 400 });
  }

  if (!verification.verified) return new Response('Not verified', { status: 400 });

  await admin
    .from('webauthn_credentials')
    .update({
      counter: verification.authenticationInfo.newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', cred.id);
  await admin.from('webauthn_challenges').delete().eq('id', challenge.id);

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'admin.passkey.authenticate',
    result: 'ok',
  });

  const res = Response.json({ verified: true });
  res.headers.append('Set-Cookie', buildStepUpCookie(profile.id));
  return res;
}
