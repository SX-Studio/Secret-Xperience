import { randomUUID } from 'node:crypto';
import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { originalPath } from '@/lib/media';

const ORIGINALS_BUCKET = 'content-originals';

// Issue a one-time signed upload URL for a draft's original file. The creator
// (owner of the draft) uploads directly to the PRIVATE bucket with it — the
// original never transits our server.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const body = (await req.json()) as { ext?: string; kind?: 'image' | 'video' };
  const ext = (body?.ext || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
  if (!ext || (body.kind !== 'image' && body.kind !== 'video')) {
    return new Response('Bad request', { status: 400 });
  }

  const admin = createAdminClient();
  const { data: item } = await admin
    .from('content_items')
    .select('id, public_code, creator_id')
    .eq('id', id)
    .maybeSingle();
  if (!item) return new Response('Not found', { status: 404 });
  if (item.creator_id !== profile.id && profile.role !== 'platform_admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const path = originalPath(item.public_code, randomUUID(), ext);
  try {
    const { data, error } = await admin.storage.from(ORIGINALS_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error('no url');
    return Response.json({ path: data.path, token: data.token, bucket: ORIGINALS_BUCKET });
  } catch {
    // Bucket not provisioned yet.
    return new Response('Storage not configured', { status: 503 });
  }
}
