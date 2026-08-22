import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/session';
import BuyButtons from './BuyButtons';

export const dynamic = 'force-dynamic';

interface LedgerRow {
  id: number;
  delta_tokens: number;
  reason: string;
  ref_type: string | null;
  balance_after: number;
  created_at: string;
}

export default async function WalletPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/wallet');

  const supabase = await createClient();

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance_tokens, lifetime_tokens')
    .eq('kind', 'user')
    .maybeSingle();

  const balance = wallet?.balance_tokens ?? 0;
  const lifetime = wallet?.lifetime_tokens ?? 0;

  const { data: ledger } = await supabase
    .from('ledger_entries')
    .select('id, delta_tokens, reason, ref_type, balance_after, created_at')
    .order('id', { ascending: false })
    .limit(50);

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)' }}
      >
        User wallet · {profile.public_code}
      </div>

      <div
        style={{
          background: 'linear-gradient(150deg,var(--ember),#7e2a19)',
          borderRadius: 20,
          padding: 22,
          color: '#fff',
          boxShadow: 'var(--shadow)',
          margin: '10px 0 18px',
        }}
      >
        <div className="serif" style={{ fontSize: 46, fontWeight: 600, lineHeight: 1 }}>
          {balance} <span className="mono" style={{ fontSize: 15, opacity: 0.85 }}>tokens</span>
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 4 }}>
          ≈ €{(balance / 100).toFixed(2)} · 100 tokens = €1 · lifetime {lifetime}
        </div>
      </div>

      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)', margin: '0 2px 8px' }}
      >
        Buy tokens
      </div>
      <BuyButtons />

      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)', margin: '18px 2px 8px' }}
      >
        Ledger — immutable
      </div>
      <div style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        {(ledger as LedgerRow[] | null)?.length ? (
          (ledger as LedgerRow[]).map((e) => (
            <div
              key={e.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderBottom: '1px solid var(--line)',
                fontSize: 13,
              }}
            >
              <div style={{ flex: 1, minWidth: 0, color: 'var(--ink2)' }}>
                {e.reason}
                <small
                  className="mono"
                  style={{ display: 'block', color: 'var(--ink3)', fontSize: 11 }}
                >
                  {new Date(e.created_at).toLocaleString()}
                </small>
              </div>
              <div
                className="mono"
                style={{ fontWeight: 500, color: e.delta_tokens > 0 ? 'var(--ok)' : 'var(--ink2)' }}
              >
                {e.delta_tokens > 0 ? '+' : ''}
                {e.delta_tokens}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '18px 14px', color: 'var(--ink3)', fontSize: 13 }}>
            No transactions yet.
          </div>
        )}
      </div>
    </main>
  );
}
