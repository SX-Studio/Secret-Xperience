'use client';

import { useEffect, useState } from 'react';

export interface RentalCardData {
  id: string;
  title: string;
  content_code: string;
  box_name: string | null;
  creator_code: string | null;
  expires_at: string;
  status: string;
}

function fmt(sec: number): string {
  if (sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const p = (n: number) => (n < 10 ? '0' : '') + n;
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export default function RentalCard({ rental }: { rental: RentalCardData }) {
  const [left, setLeft] = useState(() =>
    Math.round((new Date(rental.expires_at).getTime() - Date.now()) / 1000),
  );
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(Math.round((new Date(rental.expires_at).getTime() - Date.now()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [rental.expires_at]);

  const expired = rental.status !== 'active' || left <= 0;

  async function view() {
    setError(null);
    setViewing(true);
    try {
      const res = await fetch(`/api/rentals/${rental.id}/access`);
      if (!res.ok) throw new Error(res.status === 403 ? 'Access expired' : 'Could not open');
      const data = await res.json();
      const first = (data.files as { url: string | null }[]).find((f) => f.url);
      if (first?.url) window.open(first.url, '_blank', 'noopener');
      else setError('Media not available yet');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open');
    } finally {
      setViewing(false);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: 'var(--surf)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: 12,
        boxShadow: 'var(--shadow)',
        opacity: expired ? 0.6 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{rental.title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>
          {rental.box_name ?? '—'} · {rental.creator_code ?? '—'} · {rental.content_code}
        </div>
        {expired ? (
          <div className="mono" style={{ fontSize: 13, color: 'var(--bad)', marginTop: 3 }}>
            ⊘ Access expired
          </div>
        ) : (
          <div
            className="mono"
            style={{ fontSize: 13, color: left < 3600 ? 'var(--bad)' : 'var(--teal)', marginTop: 3 }}
          >
            ◷ {fmt(left)} remaining
          </div>
        )}
        {error && <div style={{ fontSize: 12, color: 'var(--bad)', marginTop: 4 }}>{error}</div>}
      </div>
      {!expired && (
        <button
          onClick={view}
          disabled={viewing}
          style={{
            border: 'none',
            cursor: 'pointer',
            background: 'var(--ember)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            borderRadius: 10,
            padding: '9px 14px',
          }}
        >
          {viewing ? '…' : 'View'}
        </button>
      )}
    </div>
  );
}
