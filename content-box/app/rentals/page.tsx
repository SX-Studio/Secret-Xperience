import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/session';
import RentalCard, { type RentalCardData } from './RentalCard';

export const dynamic = 'force-dynamic';

export default async function RentalsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/rentals');

  const supabase = await createClient();
  const { data } = await supabase
    .from('rentals')
    .select(
      'id, expires_at, status, content:content_items(title, public_code), box:boxes(name), creator:profiles!rentals_creator_id_fkey(public_code)',
    )
    .order('purchased_at', { ascending: false })
    .limit(100);

  const rentals: RentalCardData[] = (data ?? []).map((r) => {
    const content = r.content as { title: string; public_code: string } | { title: string; public_code: string }[] | null;
    const box = r.box as { name: string } | { name: string }[] | null;
    const creator = r.creator as { public_code: string } | { public_code: string }[] | null;
    const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);
    return {
      id: r.id,
      title: one(content)?.title ?? 'Untitled',
      content_code: one(content)?.public_code ?? '',
      box_name: one(box)?.name ?? null,
      creator_code: one(creator)?.public_code ?? null,
      expires_at: r.expires_at,
      status: r.status,
    };
  });

  const activeCount = rentals.filter((r) => r.status === 'active' && new Date(r.expires_at) > new Date()).length;

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, margin: 0 }}>
          My Rentals
        </h1>
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink3)' }}>
          {activeCount} active
        </span>
      </div>

      {rentals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
          <div className="serif" style={{ fontSize: 19, color: 'var(--ink2)', marginBottom: 4 }}>
            Nothing rented yet
          </div>
          <p style={{ fontSize: 13, margin: 0 }}>
            Rent content in a box — it appears here with a 24h timer.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {rentals.map((r) => (
            <RentalCard key={r.id} rental={r} />
          ))}
        </div>
      )}
    </main>
  );
}
