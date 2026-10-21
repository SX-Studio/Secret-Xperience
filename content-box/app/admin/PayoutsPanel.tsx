'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface PayoutItem {
  id: string;
  creator_code: string | null;
  amount_tokens: number;
  requested_at: string;
}

export default function PayoutsPanel({ items }: { items: PayoutItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(payoutId: string, decision: 'pay' | 'reject') {
    setBusy(payoutId + decision);
    try {
      let providerRef: string | null = null;
      if (decision === 'pay') {
        providerRef = window.prompt('Paxum transfer reference (optional):') || null;
      }
      await fetch('/api/admin/payouts/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payoutId, decision, providerRef }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>
        Payout requests{' '}
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink3)' }}>
          {items.length}
        </span>
      </h2>
      {items.length === 0 ? (
        <div style={{ color: 'var(--ink3)', fontSize: 13 }}>No open payout requests.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: 'var(--surf)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: '10px 12px',
                boxShadow: 'var(--shadow)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>€{(p.amount_tokens / 100).toFixed(2)}</b>{' '}
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
                  {p.creator_code ?? '—'}
                </span>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
                  {new Date(p.requested_at).toLocaleString()} · {p.amount_tokens} tokens
                </div>
              </div>
              <button
                disabled={!!busy}
                onClick={() => decide(p.id, 'pay')}
                style={btn('var(--ok)')}
              >
                Mark paid
              </button>
              <button
                disabled={!!busy}
                onClick={() => decide(p.id, 'reject')}
                style={btn('var(--bad)')}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const btn = (bg: string): React.CSSProperties => ({
  border: 'none',
  cursor: 'pointer',
  background: bg,
  color: '#fff',
  fontWeight: 600,
  fontSize: 12,
  borderRadius: 9,
  padding: '7px 11px',
});
