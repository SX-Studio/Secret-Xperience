'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface BoxRow {
  id: string;
  public_code: string;
  name: string;
  commission_bps: number;
  member_count: number;
}

export default function BoxesPanel({ boxes }: { boxes: BoxRow[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBox() {
    setError(null);
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/boxes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setName('');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>
        Boxes
      </h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New box name (e.g. African Girls)"
          style={{
            flex: 1,
            background: 'var(--surf)',
            border: '1px solid var(--line2)',
            borderRadius: 11,
            padding: '10px 13px',
            fontSize: 14,
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
        <button onClick={createBox} disabled={busy} style={emberBtn}>
          {busy ? 'Creating…' : 'Create box'}
        </button>
      </div>
      {error && <p style={{ color: 'var(--bad)', fontSize: 13 }}>{error}</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {boxes.length === 0 && (
          <div style={{ color: 'var(--ink3)', fontSize: 13 }}>No boxes yet.</div>
        )}
        {boxes.map((b) => (
          <BoxCard key={b.id} box={b} />
        ))}
      </div>
    </section>
  );
}

function BoxCard({ box }: { box: BoxRow }) {
  const [phone, setPhone] = useState('+32');
  const [role, setRole] = useState('creator');
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function invite() {
    setError(null);
    setLink(null);
    setBusy(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ boxId: box.id, phone, role }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLink(data.inviteUrl as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invite failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        background: 'var(--surf)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <b>{box.name}</b>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
          {box.public_code}
        </span>
        <span style={{ fontSize: 12, color: 'var(--ink3)', marginLeft: 'auto' }}>
          {box.member_count} members · {(box.commission_bps / 100).toFixed(0)}% commission
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+32…"
          inputMode="tel"
          style={{
            flex: '1 1 160px',
            background: 'var(--app)',
            border: '1px solid var(--line2)',
            borderRadius: 10,
            padding: '9px 12px',
            fontSize: 13,
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            background: 'var(--app)',
            border: '1px solid var(--line2)',
            borderRadius: 10,
            padding: '9px 12px',
            fontSize: 13,
            color: 'var(--ink)',
          }}
        >
          <option value="creator">creator</option>
          <option value="user">user</option>
          <option value="box_admin">box_admin</option>
        </select>
        <button onClick={invite} disabled={busy} style={emberBtn}>
          {busy ? 'Inviting…' : 'Invite'}
        </button>
      </div>

      {link && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 4 }}>
            Invite link (send by SMS — one-time, expires in 7 days):
          </div>
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="mono"
            style={{
              width: '100%',
              background: 'var(--app)',
              border: '1px solid var(--line2)',
              borderRadius: 10,
              padding: '9px 12px',
              fontSize: 12,
              color: 'var(--ink2)',
            }}
          />
        </div>
      )}
      {error && <p style={{ color: 'var(--bad)', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </div>
  );
}

const emberBtn: React.CSSProperties = {
  border: 'none',
  cursor: 'pointer',
  background: 'var(--ember)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 10,
  padding: '9px 14px',
};
