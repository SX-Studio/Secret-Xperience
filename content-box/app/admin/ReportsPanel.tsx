'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ReportItem {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  urgent: boolean;
  created_at: string;
  due_at: string;
}

export default function ReportsPanel({ items }: { items: ReportItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(reportId: string, decision: 'takedown' | 'dismiss') {
    setBusy(reportId + decision);
    try {
      const resolution =
        decision === 'dismiss' ? window.prompt('Reason for dismissing (optional):') || undefined : undefined;
      await fetch('/api/admin/reports/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reportId, decision, resolution }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>
        Reports{' '}
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink3)' }}>
          {items.length}
        </span>
      </h2>
      {items.length === 0 ? (
        <div style={{ color: 'var(--ink3)', fontSize: 13 }}>No open reports.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((r) => {
            const overdue = new Date(r.due_at) < new Date();
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  background: 'var(--surf)',
                  border: `1px solid ${r.urgent ? 'var(--bad)' : 'var(--line)'}`,
                  borderRadius: 12,
                  padding: '10px 12px',
                  boxShadow: 'var(--shadow)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{r.reason}</b>{' '}
                  {r.urgent && (
                    <span
                      className="mono"
                      style={{ fontSize: 10, color: '#fff', background: 'var(--bad)', padding: '2px 6px', borderRadius: 6 }}
                    >
                      URGENT
                    </span>
                  )}{' '}
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
                    {r.target_type}:{r.target_id}
                  </span>
                  <div style={{ fontSize: 12, color: overdue ? 'var(--bad)' : 'var(--ink3)' }}>
                    {r.details ? r.details.slice(0, 80) : '—'} · due {new Date(r.due_at).toLocaleDateString()}
                    {overdue ? ' (OVERDUE)' : ''}
                  </div>
                </div>
                <button disabled={!!busy} onClick={() => decide(r.id, 'takedown')} style={btn('var(--bad)')}>
                  Take down
                </button>
                <button disabled={!!busy} onClick={() => decide(r.id, 'dismiss')} style={btn('var(--surf2)', 'var(--ink)')}>
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const btn = (bg: string, fg = '#fff'): React.CSSProperties => ({
  border: 'none',
  cursor: 'pointer',
  background: bg,
  color: fg,
  fontWeight: 600,
  fontSize: 12,
  borderRadius: 9,
  padding: '7px 11px',
});
