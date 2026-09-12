'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestPayoutButton({ eligible }: { eligible: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function request() {
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch('/api/payouts/request', { method: 'POST' });
      if (res.status === 422) {
        setMsg('You need at least €50 available to request a payout.');
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch {
      setMsg('Could not request payout.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={request}
        disabled={busy || !eligible}
        style={{
          width: '100%',
          border: 'none',
          cursor: eligible ? 'pointer' : 'not-allowed',
          background: eligible ? 'var(--ember)' : 'var(--surf2)',
          color: eligible ? '#fff' : 'var(--ink3)',
          fontWeight: 600,
          fontSize: 14,
          borderRadius: 11,
          padding: '12px 15px',
        }}
      >
        {busy ? 'Requesting…' : eligible ? 'Request payout' : 'Minimum €50 to request'}
      </button>
      {msg && <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 8 }}>{msg}</p>}
    </>
  );
}
