import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, HOUR } from '@/lib/ratelimit';
import { writeAudit } from '@/lib/audit';

// Creator submits KYC. Consent is mandatory (card-network requirement).
// Sets status 'pending'; a real provider webhook / admin review flips it to
// 'verified'. Never self-verifies.
export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  if (!(await checkRateLimit(`kyc:${profile.id}`, 10, HOUR))) {
    return new Response('Too many attempts, try later', { status: 429 });
  }

  const body = (await req.json()) as { provider?: string; providerRef?: string; consent?: boolean };
  if (body?.consent !== true) return new Response('Consent required', { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from('kyc_verifications').upsert(
    {
      profile_id: profile.id,
      provider: body.provider ?? null,
      provider_ref: body.providerRef ?? null,
      status: 'pending',
      consent_given: true,
      consent_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id' },
  );
  if (error) return new Response('Submit failed', { status: 500 });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'kyc.submit',
    result: 'pending',
  });

  return Response.json({ ok: true, status: 'pending' });
}
