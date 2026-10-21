import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/session';
import RequestPayoutButton from './RequestPayoutButton';

export const dynamic = 'force-dynamic';

const MIN_TOKENS = 5000; // €50

interface PayoutRow {
  id: string;
  amount_tokens: number;
  status: string;
  requested_at: string;
  provider_ref: string | null;
}

export default async function EarningsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/earnings');

  const supabase = await createClient();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance_tokens, lifetime_tokens')
    .eq('kind', 'creator')
    .maybeSingle();

  const available = wallet?.balance_tokens ?? 0;
  const lifetime = wallet?.lifetime_tokens ?? 0;

  const { data: payouts } = await supabase
    .from('payout_requests')
    .select('id, amount_tokens, status, requested_at, provider_ref')
    .order('requested_at', { ascending: false })
    .limit(50);

  const pending = (payouts ?? [])
    .filter((p) => p.status === 'requested')
    .reduce((s, p) => s + p.amount_tokens, 0);

  const eur = (t: number) => `€${(t / 100).toFixed(2)}`;
  const eligible = available >= MIN_TOKENS;

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)' }}
      >
        Creator earnings · {profile.public_code}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 10,
          margin: '12px 0 18px',
        }}
      >
        <Stat label="Available" value={eur(available)} accent="var(--gold)" />
        <Stat label="Pending" value={eur(pending)} />
        <Stat label="Lifetime" value={eur(lifetime)} />
      </div>

      <RequestPayoutButton eligible={eligible} />

      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--ink3)',
          margin: '20px 2px 8px',
        }}
      >
        Payout history
      </div>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        {(payouts as PayoutRow[] | null)?.length ? (
          (payouts as PayoutRow[]).map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '11px 14px',
                borderBottom: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <div style={{ flex: 1 }}>
                {eur(p.amount_tokens)}
                <small className="mono" style={{ display: 'block', color: 'var(--ink3)', fontSize: 11 }}>
                  {new Date(p.requested_at).toLocaleString()}
                </small>
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  color:
                    p.status === 'paid' ? 'var(--ok)' : p.status === 'rejected' ? 'var(--bad)' : 'var(--warn)',
                }}
              >
                {p.status}
              </span>
            </div>
          ))
        ) : (
          <div style={{ padding: '18px 14px', color: 'var(--ink3)', fontSize: 13 }}>No payouts yet.</div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 13, padding: '12px 10px', boxShadow: 'var(--shadow)' }}>
      <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: accent ?? 'var(--ink)' }}>
        {value}
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)' }}>
        {label}
      </div>
    </div>
  );
}
