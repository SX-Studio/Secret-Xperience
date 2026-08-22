import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProfile } from '@/lib/session';
import BoxFeed, { type FeedItem } from './BoxFeed';

export const dynamic = 'force-dynamic';

const PREVIEWS_BUCKET = 'content-previews';
const SIGNED_TTL = 300;

const GRADIENTS = [
  'linear-gradient(135deg,#e85d78,#7b2ff7)',
  'linear-gradient(135deg,#f7971e,#d92662)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#8e2de2,#f9508b)',
  'linear-gradient(135deg,#c94b4b,#4b134f)',
  'linear-gradient(135deg,#0083b0,#ff5f6d)',
  'linear-gradient(135deg,#654ea3,#eaafc8)',
  'linear-gradient(135deg,#d38312,#a83279)',
];

export default async function BoxPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=/box/${code}`);

  const admin = createAdminClient();
  const { data: box } = await admin
    .from('boxes')
    .select('id, name, public_code')
    .eq('public_code', code)
    .maybeSingle();
  if (!box) notFound();

  // Membership gate (verified via the user's own session/RLS).
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('box_members')
    .select('id')
    .eq('box_id', box.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!membership && profile.role !== 'platform_admin') notFound();

  // Approved content in the box (service role: we've confirmed access above).
  const { data: items } = await admin
    .from('content_items')
    .select('id, public_code, title, price_tokens, creator_id, published_at')
    .eq('box_id', box.id)
    .eq('moderation_status', 'approved')
    .order('published_at', { ascending: false })
    .limit(60);

  const itemIds = (items ?? []).map((i) => i.id);
  const creatorIds = Array.from(new Set((items ?? []).map((i) => i.creator_id)));

  const [{ data: files }, { data: creators }, { data: myRentals }] = await Promise.all([
    itemIds.length
      ? admin.from('content_files').select('content_item_id, kind, blur_path').in('content_item_id', itemIds)
      : Promise.resolve({ data: [] as { content_item_id: string; kind: string; blur_path: string | null }[] }),
    creatorIds.length
      ? admin.from('profiles').select('id, public_code').in('id', creatorIds)
      : Promise.resolve({ data: [] as { id: string; public_code: string }[] }),
    admin
      .from('rentals')
      .select('content_item_id')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString()),
  ]);

  const creatorCode = new Map((creators ?? []).map((c) => [c.id, c.public_code]));
  const rentedSet = new Set((myRentals ?? []).map((r) => r.content_item_id));

  const feed: FeedItem[] = [];
  let gi = 0;
  for (const it of items ?? []) {
    const itsFiles = (files ?? []).filter((f) => f.content_item_id === it.id);
    const photos = itsFiles.filter((f) => f.kind === 'image').length;
    const videos = itsFiles.filter((f) => f.kind === 'video').length;
    const firstBlur = itsFiles.find((f) => f.blur_path)?.blur_path ?? null;

    let blurUrl: string | null = null;
    if (firstBlur) {
      try {
        const { data } = await admin.storage.from(PREVIEWS_BUCKET).createSignedUrl(firstBlur, SIGNED_TTL);
        blurUrl = data?.signedUrl ?? null;
      } catch {
        blurUrl = null;
      }
    }

    feed.push({
      id: it.id,
      code: it.public_code,
      title: it.title,
      price: it.price_tokens,
      creatorCode: creatorCode.get(it.creator_id) ?? 'CRT-—',
      photos,
      videos,
      blurUrl,
      grad: GRADIENTS[gi++ % GRADIENTS.length],
      rented: rentedSet.has(it.id),
    });
  }

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance_tokens')
    .eq('kind', 'user')
    .maybeSingle();

  return <BoxFeed boxName={box.name} boxCode={box.public_code} balance={wallet?.balance_tokens ?? 0} items={feed} />;
}
