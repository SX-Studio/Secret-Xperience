import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';

const ORIGINALS_BUCKET = 'content-originals';
const SIGNED_TTL_SECONDS = 300; // 5 min

// Backend-authoritative access. Returns short-lived signed URLs to the ORIGINAL
// files ONLY while the rental is valid. Expiry is enforced lazily here even if
// the cron sweep hasn't run.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const admin = createAdminClient();
  const { data: rental } = await admin
    .from('rentals')
    .select('id, user_id, content_item_id, status, expires_at')
    .eq('id', id)
    .maybeSingle();

  if (!rental || rental.user_id !== profile.id) return new Response('Not found', { status: 404 });

  const expired = new Date(rental.expires_at) <= new Date();
  if (rental.status !== 'active' || expired) {
    if (expired && rental.status === 'active') {
      await admin.from('rentals').update({ status: 'expired' }).eq('id', rental.id);
    }
    return new Response('Rental expired', { status: 403 });
  }

  const { data: files } = await admin
    .from('content_files')
    .select('id, kind, storage_path')
    .eq('content_item_id', rental.content_item_id);

  const urls: { id: number; kind: string; url: string | null }[] = [];
  for (const f of files ?? []) {
    let url: string | null = null;
    try {
      const { data } = await admin.storage
        .from(ORIGINALS_BUCKET)
        .createSignedUrl(f.storage_path, SIGNED_TTL_SECONDS);
      url = data?.signedUrl ?? null;
    } catch {
      url = null; // storage not provisioned yet
    }
    urls.push({ id: f.id, kind: f.kind, url });
  }

  return Response.json({ expiresAt: rental.expires_at, files: urls });
}
