'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface QueueItem {
  id: string;
  public_code: string;
  title: string;
  moderation_status: string;
  box_name: string | null;
  creator_code: string | null;
}
export interface KycItem {
  profile_id: string;
  profile_code: string | null;
  consent_given: boolean;
  created_at: string;
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

export function ModerationPanel({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(contentId: string, decision: string) {
    setBusy(contentId + decision);
    try {
      await fetch('/api/admin/moderation/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contentId, decision }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>
        Moderation queue{' '}
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink3)' }}>
          {items.length}
        </span>
      </h2>
      {items.length === 0 ? (
        <div style={{ color: 'var(--ink3)', fontSize: 13 }}>Nothing awaiting review.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((it) => (
            <div key={it.id} style={row}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{it.title}</b>{' '}
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
                  {it.public_code}
                </span>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
                  {it.box_name ?? '—'} · {it.creator_code ?? '—'} · {it.moderation_status}
                </div>
              </div>
              <button disabled={!!busy} onClick={() => decide(it.id, 'approve')} style={btn('var(--ok)')}>
                Approve
              </button>
              <button disabled={!!busy} onClick={() => decide(it.id, 'reject')} style={btn('var(--bad)')}>
                Reject
              </button>
              <button disabled={!!busy} onClick={() => decide(it.id, 'suspend')} style={btn('var(--warn)')}>
                Suspend
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function KycPanel({ items }: { items: KycItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function decide(profileId: string, decision: 'verify' | 'reject') {
    setBusy(profileId + decision);
    try {
      await fetch('/api/admin/kyc/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profileId, decision }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px' }}>
        KYC review{' '}
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink3)' }}>
          {items.length}
        </span>
      </h2>
      {items.length === 0 ? (
        <div style={{ color: 'var(--ink3)', fontSize: 13 }}>No pending verifications.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((k) => (
            <div key={k.profile_id} style={row}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="mono">{k.profile_code ?? k.profile_id}</span>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
                  {k.consent_given ? '✓ consent given' : '⚠ no consent'} ·{' '}
                  {new Date(k.created_at).toLocaleDateString()}
                </div>
              </div>
              <button disabled={!!busy} onClick={() => decide(k.profile_id, 'verify')} style={btn('var(--ok)')}>
                Verify
              </button>
              <button disabled={!!busy} onClick={() => decide(k.profile_id, 'reject')} style={btn('var(--bad)')}>
                Reject
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  background: 'var(--surf)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: '10px 12px',
  boxShadow: 'var(--shadow)',
  flexWrap: 'wrap',
};
