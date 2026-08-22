import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface BoxRef {
  id: string;
  name: string;
  public_code: string;
}

export default async function BoxesPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/boxes');

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from('box_members')
    .select('role, box:boxes(id, name, public_code)')
    .eq('status', 'active');

  const boxes = (memberships ?? [])
    .map((m) => {
      const b = m.box as BoxRef | BoxRef[] | null;
      return Array.isArray(b) ? b[0] ?? null : b;
    })
    .filter((b): b is BoxRef => Boolean(b));

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="serif" style={{ fontSize: 30, fontWeight: 600, margin: '0 0 16px' }}>
        Your boxes
      </h1>
      {boxes.length === 0 ? (
        <p style={{ color: 'var(--ink3)', fontSize: 14 }}>
          You&apos;re not in any box yet. When someone invites you, it appears here.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {boxes.map((b) => (
            <Link
              key={b.id}
              href={`/box/${b.public_code}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--surf)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: 'var(--shadow)',
                textDecoration: 'none',
                color: 'var(--ink)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg,var(--ember),#8f2f1c)',
                  color: '#fff',
                  fontSize: 20,
                }}
              >
                ✦
              </div>
              <div>
                <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>
                  {b.name}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
                  {b.public_code}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--ember)' }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
