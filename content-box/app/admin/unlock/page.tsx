'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export default function UnlockPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function unlock() {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      // Ask for authentication options; if no passkey exists yet, register one.
      const optRes = await fetch('/api/admin/webauthn/authenticate/options', { method: 'POST' });
      if (!optRes.ok) throw new Error('Could not start unlock');
      const options = await optRes.json();

      if (options.needsRegister) {
        await registerPasskey();
        return;
      }

      const assertion = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch('/api/admin/webauthn/authenticate/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ response: assertion }),
      });
      if (!verifyRes.ok) throw new Error('Fingerprint not verified');
      window.location.href = '/admin';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unlock failed');
    } finally {
      setBusy(false);
    }
  }

  async function registerPasskey() {
    setError(null);
    setBusy(true);
    try {
      const optRes = await fetch('/api/admin/webauthn/register/options', { method: 'POST' });
      if (!optRes.ok) throw new Error('Could not start registration');
      const options = await optRes.json();
      const attestation = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch('/api/admin/webauthn/register/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ response: attestation, deviceLabel: navigator.userAgent.slice(0, 80) }),
      });
      if (!verifyRes.ok) throw new Error('Could not register fingerprint');
      setInfo('Fingerprint registered.');
      window.location.href = '/admin';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 22 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'var(--app)',
          border: '1px solid var(--line2)',
          borderRadius: 20,
          padding: 26,
          boxShadow: 'var(--shadow)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40 }} aria-hidden>
          ☝︎
        </div>
        <h1 className="serif" style={{ fontSize: 24, fontWeight: 600, margin: '.2em 0 .4em' }}>
          Admin unlock
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--ink2)', marginTop: 0 }}>
          Confirm your fingerprint to open the admin dashboard.
        </p>

        <button onClick={unlock} disabled={busy} style={btnStyle}>
          {busy ? 'Waiting for fingerprint…' : 'Unlock with fingerprint'}
        </button>
        <button
          onClick={registerPasskey}
          disabled={busy}
          style={{ ...btnStyle, background: 'var(--surf2)', color: 'var(--ink)', marginTop: 8 }}
        >
          Register a new fingerprint on this device
        </button>

        {info && <p style={{ color: 'var(--ok)', fontSize: 13, marginTop: 12 }}>{info}</p>}
        {error && <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  background: 'var(--ember)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 11,
  padding: '12px 15px',
};
