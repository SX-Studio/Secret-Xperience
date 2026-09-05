import { getProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { scanForCsam, screenWithAi } from '@/lib/moderation/providers';
import { aggregate, type ScanStatus, type AiRisk } from '@/lib/moderation/pipeline';
import { generateImageDerivatives, blurPath, thumbPath } from '@/lib/media';
import { writeAudit } from '@/lib/audit';

const ORIGINALS_BUCKET = 'content-originals';
const PREVIEWS_BUCKET = 'content-previews';

interface IncomingFile {
  kind: 'image' | 'video';
  storagePath: string;
  checksum?: string;
  bytes?: number;
}

// Register uploaded files, run the fail-closed T&S pipeline, generate blurred
// previews (best-effort), and set the content's moderation status.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const profile = await getProfile();
  if (!profile) return new Response('Unauthorized', { status: 401 });

  const admin = createAdminClient();
  const { data: item } = await admin
    .from('content_items')
    .select('id, public_code, creator_id, moderation_status')
    .eq('id', id)
    .maybeSingle();
  if (!item) return new Response('Not found', { status: 404 });
  if (item.creator_id !== profile.id && profile.role !== 'platform_admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const body = (await req.json()) as { files?: IncomingFile[] };
  const files = body?.files ?? [];
  if (files.length === 0) return new Response('No files', { status: 400 });

  await admin.from('content_items').update({ moderation_status: 'processing' }).eq('id', id);

  const scanResults: { csam: ScanStatus; ai: AiRisk }[] = [];

  for (const f of files) {
    const csam = await scanForCsam({ url: f.storagePath });
    const ai = await screenWithAi({ url: f.storagePath });
    scanResults.push({ csam, ai });

    let blur: string | null = null;
    let thumb: string | null = null;

    // Best-effort derivative generation (requires live storage; degrades to null).
    if (f.kind === 'image') {
      try {
        const { data: blob } = await admin.storage.from(ORIGINALS_BUCKET).download(f.storagePath);
        if (blob) {
          const buf = Buffer.from(await blob.arrayBuffer());
          const der = await generateImageDerivatives(buf);
          const bPath = blurPath(item.public_code, f.storagePath);
          const tPath = thumbPath(item.public_code, f.storagePath);
          await admin.storage.from(PREVIEWS_BUCKET).upload(bPath, der.blur, {
            contentType: 'image/jpeg',
            upsert: true,
          });
          await admin.storage.from(PREVIEWS_BUCKET).upload(tPath, der.thumb, {
            contentType: 'image/jpeg',
            upsert: true,
          });
          blur = bPath;
          thumb = tPath;
        }
      } catch {
        // storage not provisioned yet — leave previews null, continue
      }
    }

    await admin.from('content_files').insert({
      content_item_id: id,
      kind: f.kind,
      storage_path: f.storagePath,
      blur_path: blur,
      thumb_path: thumb,
      checksum: f.checksum ?? null,
      bytes: f.bytes ?? null,
      csam_scan: csam,
      ai_scan: ai,
    });
  }

  const decision = aggregate(scanResults);
  const publishedAt = decision.status === 'approved' ? new Date().toISOString() : null;

  await admin
    .from('content_items')
    .update({ moderation_status: decision.status, published_at: publishedAt })
    .eq('id', id);

  await admin.from('moderation_events').insert({
    content_item_id: id,
    actor_id: null, // automated pipeline
    action: 'pipeline',
    from_status: 'processing',
    to_status: decision.status,
    reason: decision.reason,
  });

  await writeAudit({
    actorId: profile.id,
    actorCode: profile.public_code,
    action: 'content.finalize',
    targetType: 'content',
    targetId: item.public_code,
    result: decision.status,
    meta: { reason: decision.reason, files: files.length },
  });

  return Response.json({ status: decision.status, reason: decision.reason });
}
