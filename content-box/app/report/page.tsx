'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const REASONS = [
  ['csam', 'Minor / CSAM'],
  ['nonconsensual', 'Non-consensual content'],
  ['illegal', 'Other illegal content'],
  ['stolen', 'Stolen content'],
  ['impersonation', 'Impersonation'],
  ['spam', 'Spam'],
  ['other', 'Other'],
] as const;

function ReportForm() {
  const sp = useSearchParams();
  const targetType = sp.get('type') ?? 'content';
  const targetId = sp.get('id') ?? '';
  const [reason, setReason] = useState('nonconsensual');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, details }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={card}>
      <div className="mono" style={eyebrow}>
        Content Box · report
      </div>
      {done ? (
        <>
          <h1 className="serif" style={h1}>Report received</h1>
          <p style={{ color: 'var(--ink2)' }}>
            Thank you. Our moderation team will review it. Urgent categories are prioritised.
          </p>
        </>
      ) : (
        <>
          <h1 className="serif" style={h1}>Report {targetType}</h1>
          <p style={{ color: 'var(--ink3)', fontSize: 12, marginTop: 0 }}>
            {targetId ? `Target: ${targetId}` : 'No target specified'}
          </p>
          <label style={label}>Reason</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} style={input}>
            {REASONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <label style={label}>Details (optional)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            style={{ ...input, resize: 'vertical' }}
          />
          <button onClick={submit} disabled={busy || !targetId} style={btn}>
            {busy ? 'Submitting…' : 'Submit report'}
          </button>
          {error && <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 10 }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 22 }}>
      <Suspense fallback={<div style={card}>Loading…</div>}>
        <ReportForm />
      </Suspense>
    </main>
  );
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 400,
  background: 'var(--app)',
  border: '1px solid var(--line2)',
  borderRadius: 20,
  padding: 26,
  boxShadow: 'var(--shadow)',
};
const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '.2em',
  textTransform: 'uppercase',
  color: 'var(--ember)',
};
const h1: React.CSSProperties = { fontSize: 24, fontWeight: 600, margin: '.3em 0 .2em' };
const label: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink2)',
  margin: '12px 0 6px',
};
const input: React.CSSProperties = {
  width: '100%',
  background: 'var(--surf)',
  border: '1px solid var(--line2)',
  borderRadius: 11,
  padding: '11px 13px',
  fontSize: 14,
  color: 'var(--ink)',
  fontFamily: 'inherit',
  outline: 'none',
};
const btn: React.CSSProperties = {
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  background: 'var(--ember)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 11,
  padding: '12px 15px',
  marginTop: 16,
};
