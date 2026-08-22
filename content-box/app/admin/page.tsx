import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getAdminProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyStepUp, STEPUP_COOKIE } from '@/lib/stepup';
import type { Role } from '@/lib/roles';
import BoxesPanel, { type BoxRow } from './BoxesPanel';

export const dynamic = 'force-dynamic';

interface AuditRow {
  id: number;
  actor_code: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  result: string | null;
  created_at: string;
}

export default async function AdminDashboard() {
  const profile = await getAdminProfile();
  if (!profile) notFound();

  // Second gate: fresh fingerprint step-up.
  const jar = await cookies();
  if (!verifyStepUp(jar.get(STEPUP_COOKIE)?.value, profile.id)) {
    redirect('/admin/unlock');
  }

  const admin = createAdminClient();

  const roles: Role[] = ['user', 'creator', 'box_admin', 'platform_admin'];
  const roleCounts = await Promise.all(
    roles.map(async (r) => {
      const { count } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', r);
      return [r, count ?? 0] as const;
    }),
  );

  const { count: auditCount } = await admin
    .from('audit_log')
    .select('*', { count: 'exact', head: true });

  const { data: boxData } = await admin
    .from('boxes')
    .select('id, public_code, name, commission_bps')
    .order('created_at', { ascending: false })
    .limit(50);

  const boxes: BoxRow[] = await Promise.all(
    (boxData ?? []).map(async (b) => {
      const { count } = await admin
        .from('box_members')
        .select('*', { count: 'exact', head: true })
        .eq('box_id', b.id);
      return { ...b, member_count: count ?? 0 } as BoxRow;
    }),
  );

  const { data: recent } = await admin
    .from('audit_log')
    .select('id, actor_code, action, target_type, target_id, result, created_at')
    .order('id', { ascending: false })
    .limit(20);

  const totalUsers = roleCounts.reduce((s, [, c]) => s + c, 0);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 22px' }}>
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ember)' }}
      >
        Platform console · {profile.public_code}
      </div>
      <h1 className="serif" style={{ fontSize: 34, fontWeight: 600, margin: '.2em 0 1em' }}>
        Admin dashboard
      </h1>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <Stat label="Accounts" value={totalUsers} />
        {roleCounts.map(([r, c]) => (
          <Stat key={r} label={r.replace('_', ' ')} value={c} />
        ))}
        <Stat label="Audit events" value={auditCount ?? 0} />
      </section>

      <BoxesPanel boxes={boxes} />

      <h2 className="serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>
        Recent audit log
      </h2>
      <div
        style={{
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {(recent as AuditRow[] | null)?.length ? (
          (recent as AuditRow[]).map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                gap: 10,
                padding: '11px 14px',
                borderBottom: '1px solid var(--line)',
                fontSize: 13,
                alignItems: 'baseline',
              }}
            >
              <span className="mono" style={{ color: 'var(--ink3)', fontSize: 11, width: 150, flex: 'none' }}>
                {new Date(r.created_at).toLocaleString()}
              </span>
              <span style={{ fontWeight: 600 }}>{r.action}</span>
              <span style={{ color: 'var(--ink3)', flex: 1, minWidth: 0 }}>
                {r.target_type ? `${r.target_type}:${r.target_id ?? ''}` : ''}
              </span>
              <span className="mono" style={{ color: 'var(--ink3)', fontSize: 11 }}>
                {r.actor_code ?? ''}
              </span>
              <span className="mono" style={{ color: 'var(--ok)', fontSize: 11 }}>
                {r.result ?? ''}
              </span>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px 14px', color: 'var(--ink3)', fontSize: 13 }}>No audit events yet.</div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: 'var(--surf)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        padding: '14px 16px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
        {value}
      </div>
      <div
        className="mono"
        style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)' }}
      >
        {label}
      </div>
    </div>
  );
}
