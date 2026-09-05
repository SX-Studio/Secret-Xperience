'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { looksLikePhone } from '@/lib/phone';

export default function LoginPage() {
  const [phone, setPhone] = useState('+32');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setError(null);
    if (!looksLikePhone(phone)) {
      setError('Enter a valid phone number in international format, e.g. +32477704740');
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
      if (error) throw error;
      setStage('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: code.trim(),
        type: 'sms',
      });
      if (error) throw error;
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next && next.startsWith('/') ? next : '/';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code');
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
        }}
      >
        <div
          className="mono"
          style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ember)' }}
        >
          Content Box
        </div>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 600, margin: '.3em 0 1em' }}>
          Sign in
        </h1>

        {stage === 'phone' ? (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="+32477704740"
              style={inputStyle}
            />
            <button onClick={sendCode} disabled={busy} style={btnStyle}>
              {busy ? 'Sending…' : 'Send code'}
            </button>
          </>
        ) : (
          <>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>
              Code sent to {phone}
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              style={inputStyle}
            />
            <button onClick={verify} disabled={busy} style={btnStyle}>
              {busy ? 'Verifying…' : 'Verify & continue'}
            </button>
            <button
              onClick={() => setStage('phone')}
              style={{ ...btnStyle, background: 'var(--surf2)', color: 'var(--ink)', marginTop: 8 }}
            >
              Use a different number
            </button>
          </>
        )}

        {error && <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 12 }}>{error}</p>}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surf)',
  border: '1px solid var(--line2)',
  borderRadius: 11,
  padding: '11px 13px',
  fontSize: 14,
  color: 'var(--ink)',
  margin: '6px 0 14px',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  background: 'var(--ember)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 11,
  padding: '11px 15px',
};
