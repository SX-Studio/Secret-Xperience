'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Preview {
  valid: boolean;
  status?: string;
  role?: string;
  boxName?: string | null;
}

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/invitations/inspect', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        setPreview(await res.json());
      } catch {
        setPreview({ valid: false });
      }
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setLoggedIn(Boolean(user));
      } catch {
        setLoggedIn(false);
      }
    })();
  }, [token]);

  async function accept() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Could not accept invitation');
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not accept invitation');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 22 }}>
      <div style={card}>
        <div className="mono" style={eyebrow}>
          Content Box · invitation
        </div>

        {preview === null ? (
          <p style={{ color: 'var(--ink3)' }}>Loading…</p>
        ) : done ? (
          <>
            <h1 className="serif" style={h1}>You&apos;re in ✓</h1>
            <p style={{ color: 'var(--ink2)' }}>
              You joined {preview.boxName ?? 'the box'} as {preview.role}.
            </p>
            <a href="/" style={btn}>
              Continue
            </a>
          </>
        ) : !preview.valid ? (
          <>
            <h1 className="serif" style={h1}>Invitation unavailable</h1>
            <p style={{ color: 'var(--ink2)' }}>
              This invitation is {preview.status ?? 'invalid'}. Ask your inviter for a new link.
            </p>
          </>
        ) : (
          <>
            <h1 className="serif" style={h1}>{preview.boxName ?? 'A box'}</h1>
            <p style={{ color: 'var(--ink2)' }}>
              You&apos;ve been invited to join as <b>{preview.role}</b>.
            </p>
            {loggedIn ? (
              <button onClick={accept} disabled={busy} style={btn}>
                {busy ? 'Joining…' : 'Accept invitation'}
              </button>
            ) : (
              <a href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`} style={btn}>
                Sign in to accept
              </a>
            )}
            <p style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 12 }}>
              You must sign in with the phone number this invitation was sent to.
            </p>
          </>
        )}

        {error && <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>
    </main>
  );
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 380,
  background: 'var(--app)',
  border: '1px solid var(--line2)',
  borderRadius: 20,
  padding: 26,
  boxShadow: 'var(--shadow)',
  textAlign: 'center',
};
const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '.2em',
  textTransform: 'uppercase',
  color: 'var(--ember)',
};
const h1: React.CSSProperties = { fontSize: 26, fontWeight: 600, margin: '.3em 0 .4em' };
const btn: React.CSSProperties = {
  display: 'inline-block',
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  background: 'var(--ember)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 11,
  padding: '12px 15px',
  marginTop: 8,
  textDecoration: 'none',
  boxSizing: 'border-box',
};
