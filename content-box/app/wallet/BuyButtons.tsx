'use client';

import { useState } from 'react';
import { PACKAGES } from '@/lib/packages';

export default function BuyButtons() {
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function buy(packageId: string) {
    setNote(null);
    setBusy(packageId);
    try {
      const res = await fetch('/api/verotel/charge', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.configured === false) {
        setNote('Payments are coming soon — checkout is not enabled yet.');
        return;
      }
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }
      setNote('Could not start checkout.');
    } catch {
      setNote('Could not start checkout.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 8 }}>
        {PACKAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => buy(p.id)}
            disabled={!!busy}
            style={{
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              borderRadius: 13,
              padding: '14px 6px',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            <div className="mono" style={{ fontWeight: 500, fontSize: 15, color: 'var(--gold)' }}>
              ◈ {p.tokens}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>
              €{(p.eurCents / 100).toFixed(0)}
            </div>
          </button>
        ))}
      </div>
      {note && <p style={{ color: 'var(--warn)', fontSize: 13 }}>{note}</p>}
    </>
  );
}
