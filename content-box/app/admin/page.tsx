import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getAdminProfile } from '@/lib/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyStepUp, STEPUP_COOKIE } from '@/lib/stepup';
import type { Role } from '@/lib/roles';
import BoxesPanel, { type BoxRow } from './BoxesPanel';
import { ModerationPanel, KycPanel, type QueueItem, type KycItem } from './ReviewPanels';
import PayoutsPanel, { type PayoutItem } from './PayoutsPanel';

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

  const { data: queueData } = await admin
    .from('content_items')
    .select('id, public_code, title, moderation_status, box:boxes(name), creator:profiles(public_code)')
    .in('moderation_status', ['pending_review', 'processing'])
    .order('created_at', { ascending: true })
    .limit(50);

  const queue: QueueItem[] = (queueData ?? []).map((c) => {
    const box = c.box as { name: string } | { name: string }[] | null;
    const creator = c.creator as { public_code: string } | { public_code: string }[] | null;
    const boxName = Array.isArray(box) ? box[0]?.name ?? null : box?.name ?? null;
    const creatorCode = Array.isArray(creator)
      ? creator[0]?.public_code ?? null
      : creator?.public_code ?? null;
    return {
      id: c.id,
      public_code: c.public_code,
      title: c.title,
      moderation_status: c.moderation_status,
      box_name: boxName,
      creator_code: creatorCode,
    };
  });

  const { data: kycData } = await admin
    .from('kyc_verifications')
    .select('profile_id, consent_given, created_at, profile:profiles(public_code)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(50);

  const kycItems: KycItem[] = (kycData ?? []).map((k) => {
    const p = k.profile as { public_code: string } | { public_code: string }[] | null;
    const code = Array.isArray(p) ? p[0]?.public_code ?? null : p?.public_code ?? null;
    return {
      profile_id: k.profile_id,
      profile_code: code,
      consent_given: k.consent_given,
      created_at: k.created_at,
    };
  });

  const { data: payoutData } = await admin
    .from('payout_requests')
    .select('id, amount_tokens, requested_at, creator:profiles!payout_requests_creator_id_fkey(public_code)')
    .eq('status', 'requested')
    .order('requested_at', { ascending: true })
    .limit(50);

  const payouts: PayoutItem[] = (payoutData ?? []).map((p) => {
    const c = p.creator as { public_code: string } | { public_code: string }[] | null;
    const code = Array.isArray(c) ? c[0]?.public_code ?? null : c?.public_code ?? null;
    return { id: p.id, creator_code: code, amount_tokens: p.amount_tokens, requested_at: p.requested_at };
  });

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

      <ModerationPanel items={queue} />
      <KycPanel items={kycItems} />
      <PayoutsPanel items={payouts} />
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
