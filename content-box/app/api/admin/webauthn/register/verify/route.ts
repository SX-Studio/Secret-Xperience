import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { getAdminProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { rpID, expectedOrigin } from '@/lib/webauthn';
import { buildStepUpCookie } from '@/lib/stepup';
import { writeAudit } from '@/lib/audit';

export async function POST(req: Request) {
  const profile = await getAdminProfile();
  if (!profile) return new Response('Not found', { status: 404 });

  const body = (await req.json()) as { response?: RegistrationResponseJSON; deviceLabel?: string };
  if (!body?.response) return new Response('Bad request', { status: 400 });

  const admin = createAdminClient();
  const { data: challenge } = await admin
    .from('webauthn_challenges')
    .select('id, challenge')
    .eq('user_id', profile.id)
    .eq('kind', 'register')
    .gt('expires_at', new Date().toISOString())
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!challenge) return new Response('No challenge', { status: 400 });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: challenge.challenge as string,
      expectedOrigin: expectedOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: true,
    });
  } catch {
    return new Response('Verification failed', { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return new Response('Not verified', { status: 400 });
  }

  const cred = verification.registrationInfo.credential;
  const { error } = await admin.from('webauthn_credentials').insert({
    user_id: profile.id,
    credential_id: cred.id,
    public_key: Buffer.from(cred.publicKey).toString('base64'),
    counter: cred.counter,
    transports: cred.transports ?? [],
    device_label: body.deviceLabel ?? null,
  });
  if (error) return new Response('Store failed', { status: 500 });

  await admin.from('webauthn_challenges').delete().eq('id', challenge.id);
  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'admin.passkey.register',
    result: 'ok',
  });

  // Registering proves fresh user verification → grant the step-up too.
  const res = Response.json({ verified: true });
  res.headers.append('Set-Cookie', buildStepUpCookie(profile.id));
  return res;
}
