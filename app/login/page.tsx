'use client'

import { useState, useEffect } from 'react'
import { signIn } from '../lib/auth'
import { createClient } from '../lib/supabase'

type Role = 'user' | 'provider' | 'venue' | 'creator'

const ROLES: { value: Role; label: string; description: string; icon: string }[] = [
  { value: 'user',     label: 'Member',   description: 'Discover & book experiences', icon: 'ti-user' },
  { value: 'provider', label: 'Advertiser', description: 'Offer premium services',      icon: 'ti-sparkles' },
  { value: 'venue',    label: 'Venue',    description: 'List your space',              icon: 'ti-building' },
  { value: 'creator',  label: 'Creator',  description: 'Share exclusive content',      icon: 'ti-camera' },
]

export default function LoginPage() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole]         = useState<Role>('user')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [shake, setShake]       = useState(false)
  const [success, setSuccess]   = useState(false)
  const [successKind, setSuccessKind] = useState<'signup' | 'reset'>('signup')
  const [termsChecked, setTermsChecked]         = useState(false)
  const [newsletterChecked, setNewsletterChecked] = useState(true)

  useEffect(() => {
    if (error) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(t)
    }
  }, [error])

  // Capture a referral code from ?ref= and remember it through signup
  useEffect(() => {
    try {
      const r = new URLSearchParams(window.location.search).get('ref')
      if (r) localStorage.setItem('sx_ref', r.trim().toUpperCase())
    } catch { /* ignore */ }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        const m = error.message?.toLowerCase() || ''
        setError(
          m.includes('invalid login') || m.includes('credentials')
            ? 'Wrong email or password. Please try again.'
            : m.includes('email not confirmed')
            ? 'Please confirm your email first — check your inbox for the link.'
            : error.message || 'Could not sign you in. Please try again.'
        )
      } else {
        // Advertisers/venues/creators with no listings → onboard them straight to create
        const nextUrl = new URLSearchParams(window.location.search).get('next')
        // Relative paths only. A bare startsWith('/') also admits '//evil.com',
        // which the browser treats as protocol-relative and navigates off-site.
        if (nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//')) {
          window.location.href = nextUrl
          return
        }
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
            if (profile && ['provider','venue','creator'].includes(profile.role || '')) {
              const { count } = await supabase.from('listings').select('id', { count: 'exact', head: true }).eq('profile_id', session.user.id)
              if ((count ?? 0) === 0) { window.location.href = '/listings/create'; return }
            }
          }
        } catch { /* fall through to dashboard */ }
        window.location.href = '/dashboard'
      }
    } else {
      // Use server-side route to avoid trigger failures on auth.users insert
      let ref: string | null = null
      try { ref = localStorage.getItem('sx_ref') } catch { /* ignore */ }
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role, newsletter: newsletterChecked, ref }),
      })
      const json = await res.json()
      if (res.ok) { try { localStorage.removeItem('sx_ref') } catch { /* ignore */ } }
      if (!res.ok) {
        setError(json.error || 'Signup failed')
      } else {
        // Account created — sign in immediately
        const { error: signInError } = await signIn(email, password)
        if (signInError) {
          // Account exists but sign-in failed — send them to login tab
          setSuccess(true)
        } else {
          const isAdvertiserRole = ['provider', 'venue', 'creator'].includes(role)
          window.location.href = isAdvertiserRole ? '/listings/create' : '/dashboard'
        }
      }
    }
    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    // Only pass role when signing up — on login the role already exists in the DB
    // and must not be overwritten (e.g. an advertiser logging in via Google).
    // Carry `next` through OAuth so a login started mid-flow (e.g. the
    // cross-domain session bridge at /sso/start) resumes where it left off
    // instead of dropping the user on /dashboard.
    const nextParam = new URLSearchParams(window.location.search).get('next')
    const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : null
    const cb = new URL('/auth/callback', window.location.origin)
    if (mode === 'signup') cb.searchParams.set('role', role)
    if (safeNext) cb.searchParams.set('next', safeNext)
    const callbackUrl = cb.toString()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
  }

  async function handleForgot() {
    setError('')
    if (!email.trim()) { setError('Enter your email above first, then tap “Forgot password?”.'); return }
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message || 'Could not send the reset link. Try again.'); return }
    setSuccessKind('reset')
    setSuccess(true)
  }

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    setError('')
    setSuccess(false)
  }

  return (
    <>
      <style>{`
        
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-7px); }
          30%      { transform: translateX(7px); }
          45%      { transform: translateX(-5px); }
          60%      { transform: translateX(5px); }
          75%      { transform: translateX(-3px); }
          90%      { transform: translateX(3px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes checkDraw {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.5; }
          50%       { transform: translateY(-18px) scale(1.1); opacity: 0.9; }
        }

        .lx-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Poppins', sans-serif;
          background: #08060e;
        }

        /* ── Left panel ── */
        .lx-left {
          width: 50%;
          min-height: 100vh;
          position: relative;
          background: #080610;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 4rem 3.5rem;
        }

        .lx-left-orb1 {
          position: absolute;
          top: -80px;
          left: -80px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(197,160,90,0.13) 0%, transparent 65%);
          pointer-events: none;
        }

        .lx-left-orb2 {
          position: absolute;
          bottom: 60px;
          right: -120px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(197,160,90,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .lx-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .lx-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(197,160,90,0.6);
        }

        @media (max-width: 1023px) {
          .lx-particles { display: none; }
        }

        /* ── Right panel ── */
        .lx-right {
          width: 50%;
          min-height: 100vh;
          background: #08060e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          border-left: 0.5px solid rgba(197,160,90,0.1);
        }

        .lx-form-inner {
          width: 100%;
          max-width: 420px;
          animation: fadeUp 0.4s ease;
        }

        /* ── Tabs ── */
        .lx-tabs-row {
          background: rgba(0,0,0,0.4);
          border-radius: 10px;
          padding: 4px;
          display: flex;
          margin-bottom: 2rem;
          border: 0.5px solid rgba(255,255,255,0.06);
        }

        .lx-tab {
          flex: 1;
          height: 40px;
          border: none;
          background: transparent;
          color: rgba(236,232,225,0.4);
          font: 500 12px/1 'Poppins', sans-serif;
          letter-spacing: 0.08em;
          border-radius: 7px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
        }

        .lx-tab.active {
          background: rgba(197,160,90,0.1);
          color: #c5a05a;
          border: 0.5px solid rgba(197,160,90,0.3);
        }

        /* ── Social button ── */
        .lx-social-btn {
          width: 100%;
          height: 46px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #ece8e1;
          font: 500 13.5px/1 'Poppins', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .lx-social-btn:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.055);
        }

        /* ── Divider ── */
        .lx-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.5rem 0;
        }
        .lx-divider-line {
          flex: 1;
          height: 0.5px;
          background: rgba(255,255,255,0.07);
        }
        .lx-divider-label {
          font: 500 10px 'Poppins', sans-serif;
          letter-spacing: 0.14em;
          color: rgba(236,232,225,0.3);
          text-transform: uppercase;
        }

        /* ── Label ── */
        .lx-label {
          font: 600 10px/1 'Poppins', sans-serif;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(236,232,225,0.35);
          margin-bottom: 7px;
          display: block;
        }

        /* ── Input ── */
        .lx-input {
          height: 46px;
          padding: 0 14px;
          background: rgba(255,255,255,0.03);
          color: #ece8e1;
          border: 0.5px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          font: 400 14px 'Poppins', sans-serif;
          width: 100%;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
          -webkit-appearance: none;
        }
        .lx-input::placeholder { color: rgba(236,232,225,0.22); }
        .lx-input:focus {
          border-color: rgba(197,160,90,0.5);
          box-shadow: 0 0 0 3px rgba(197,160,90,0.07);
        }

        /* ── Password wrap ── */
        .lx-pass-wrap { position: relative; }
        .lx-pass-wrap .lx-input { padding-right: 46px; }

        .lx-eye-btn {
          position: absolute;
          right: 2px;
          top: 50%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(236,232,225,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: color 0.2s;
        }
        .lx-eye-btn:hover { color: rgba(197,160,90,0.7); }

        /* ── Role cards ── */
        .lx-role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .lx-role-card {
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 14px 12px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          text-align: left;
          width: 100%;
        }
        .lx-role-card:hover {
          border-color: rgba(197,160,90,0.35);
          background: rgba(197,160,90,0.03);
        }
        .lx-role-card.selected {
          border-color: rgba(197,160,90,0.55);
          background: rgba(197,160,90,0.07);
        }

        /* ── Submit ── */
        .lx-submit-btn {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #c5a05a 0%, #a0803d 100%);
          color: #080808;
          border: none;
          border-radius: 10px;
          font: 600 13px/1 'Poppins', sans-serif;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          box-shadow: 0 4px 24px rgba(197,160,90,0.22);
          cursor: pointer;
          margin-top: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .lx-submit-btn:disabled { opacity: 0.48; cursor: default; }
        .lx-submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(197,160,90,0.32);
        }
        .lx-submit-btn:not(:disabled):active { transform: translateY(0); }

        /* ── Error pill ── */
        .lx-error {
          background: rgba(212,95,114,0.08);
          color: #d45f72;
          border: 0.5px solid rgba(212,95,114,0.2);
          border-radius: 10px;
          padding: 12px 14px;
          font: 400 13px 'Poppins', sans-serif;
          margin-top: 0.75rem;
          width: 100%;
        }

        /* ── Mobile ── */
        @media (max-width: 1023px) {
          .lx-page { flex-direction: column; }
          .lx-left {
            width: 100%;
            min-height: 200px;
            padding: 2.5rem 1.75rem 2rem;
            justify-content: flex-end;
          }
          .lx-right {
            width: 100%;
            min-height: auto;
            border-left: none;
            border-top: 0.5px solid rgba(197,160,90,0.1);
            padding: 2.5rem 1.5rem 3rem;
          }
        }
      `}</style>

      <div className="lx-page">

        {/* ── LEFT PANEL ── */}
        <div className="lx-left">
          <div className="lx-left-orb1" />
          <div className="lx-left-orb2" />

          {/* Floating particles */}
          <div className="lx-particles">
            {[
              { top: '18%', left: '12%', delay: '0s',    dur: '6s'  },
              { top: '32%', left: '78%', delay: '1.2s',  dur: '7s'  },
              { top: '55%', left: '25%', delay: '2.4s',  dur: '5.5s'},
              { top: '70%', left: '65%', delay: '0.8s',  dur: '8s'  },
              { top: '10%', left: '55%', delay: '3s',    dur: '6.5s'},
              { top: '80%', left: '40%', delay: '1.8s',  dur: '7.5s'},
              { top: '44%', left: '88%', delay: '0.4s',  dur: '5s'  },
              { top: '90%', left: '15%', delay: '2s',    dur: '9s'  },
            ].map((p, i) => (
              <div
                key={i}
                className="lx-particle"
                style={{
                  top: p.top,
                  left: p.left,
                  animation: `float ${p.dur} ease-in-out ${p.delay} infinite`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(197,160,90,0.7)',
              marginBottom: '1.5rem',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
            }}>
              Private — Members Only
            </p>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 400,
              color: '#ece8e1',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              letterSpacing: '0.01em',
            }}>
              An evening that ends<br />
              behind a <strong style={{ fontWeight: 600 }}>closed door.</strong>
            </h1>

            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 14,
              color: 'rgba(236,232,225,0.48)',
              lineHeight: 1.75,
              maxWidth: 400,
              fontWeight: 300,
              marginBottom: '2.5rem',
            }}>
              Belgium&apos;s discreet marketplace for companions, private rentals,
              members&apos; nightlife and adult creators — verified, curated, and quietly run.
            </p>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 12,
                color: 'rgba(197,160,90,0.6)',
                letterSpacing: '0.08em',
              }}>
                ◈ Brussels · since 2019
              </span>
              <span style={{
                fontSize: 11,
                color: 'rgba(236,232,225,0.25)',
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: '0.06em',
              }}>
                18+ · ID verified · GDPR
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lx-right">
          <div className="lx-form-inner">

            {/* Brand */}
            <a href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 500,
                color: '#c5a05a',
                fontStyle: 'italic',
                letterSpacing: '0.02em',
              }}>
                Secret<em style={{ fontWeight: 300 }}>Xperience</em>
              </span>
            </a>

            {/* Tabs */}
            <div className="lx-tabs-row">
              <button
                className={`lx-tab${mode === 'login' ? ' active' : ''}`}
                onClick={() => switchMode('login')}
              >
                Sign in
              </button>
              <button
                className={`lx-tab${mode === 'signup' ? ' active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                Create account
              </button>
            </div>

            {/* Success state */}
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 0 1rem', animation: 'fadeUp 0.45s ease' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(197,160,90,0.12) 0%, transparent 70%)',
                  border: '0.5px solid rgba(197,160,90,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: '0 0 30px rgba(197,160,90,0.1)',
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      stroke="#c5a05a"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="30"
                      style={{ animation: 'checkDraw 0.5s ease 0.15s forwards', strokeDashoffset: 30 }}
                    />
                  </svg>
                </div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26,
                  fontWeight: 400,
                  color: '#ece8e1',
                  marginBottom: '0.6rem',
                }}>
                  Check your inbox
                </p>
                <p style={{
                  color: 'rgba(236,232,225,0.45)',
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}>
                  {successKind === 'reset' ? (
                    <>We sent a password reset link to{' '}
                    <span style={{ color: 'rgba(236,232,225,0.75)' }}>{email}</span>.
                    <br />Click it to choose a new password.</>
                  ) : (
                    <>We sent a confirmation link to{' '}
                    <span style={{ color: 'rgba(236,232,225,0.75)' }}>{email}</span>.
                    <br />Click it to confirm your email and activate your account.</>
                  )}
                </p>
              </div>
            ) : (
              <div style={{ animation: shake ? 'shake 0.45s ease' : 'none' }}>

                {/* Google button */}
                <button className="lx-social-btn" type="button" onClick={handleGoogle}>
                  <svg viewBox="0 0 18 18" width="18" height="18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.6z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.9-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
                    <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0a9 9 0 0 0-8.04 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="lx-divider">
                  <div className="lx-divider-line" />
                  <span className="lx-divider-label">or with email</span>
                  <div className="lx-divider-line" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {mode === 'signup' && (
                    <>
                      {/* Full name */}
                      <div style={{ marginBottom: 14 }}>
                        <label className="lx-label">Full Name</label>
                        <input
                          className="lx-input"
                          placeholder="Your full name"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          required
                          autoComplete="name"
                        />
                      </div>

                      {/* Role selector */}
                      <div style={{ marginBottom: 16 }}>
                        <label className="lx-label">I am a…</label>
                        <div className="lx-role-grid">
                          {ROLES.map(r => (
                            <button
                              key={r.value}
                              type="button"
                              className={`lx-role-card${role === r.value ? ' selected' : ''}`}
                              onClick={() => setRole(r.value)}
                            >
                              <i
                                className={`ti ${r.icon}`}
                                style={{
                                  fontSize: 18,
                                  color: role === r.value ? '#c5a05a' : 'rgba(236,232,225,0.25)',
                                  display: 'block',
                                  marginBottom: 7,
                                  transition: 'color 0.15s',
                                }}
                              />
                              <div style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: role === r.value ? '#c5a05a' : '#ece8e1',
                                marginBottom: 3,
                                letterSpacing: '0.03em',
                                transition: 'color 0.15s',
                              }}>
                                {r.label}
                              </div>
                              <div style={{
                                fontSize: 10.5,
                                color: 'rgba(236,232,225,0.38)',
                                lineHeight: 1.4,
                                fontWeight: 300,
                              }}>
                                {r.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label className="lx-label">Email</label>
                    <input
                      className="lx-input"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: mode === 'signup' ? 14 : 4 }}>
                    <label className="lx-label">Password</label>
                    <div className="lx-pass-wrap">
                      <input
                        className="lx-input"
                        type={showPass ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        className="lx-eye-btn"
                        onClick={() => setShowPass(v => !v)}
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                      >
                        <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`} />
                      </button>
                    </div>
                    {mode === 'login' && (
                      <div style={{ textAlign: 'right', marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={handleForgot}
                          style={{ background: 'none', border: 'none', color: 'var(--gold, #c5a05a)', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Terms + Newsletter (signup only) */}
                  {mode === 'signup' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={termsChecked}
                          onChange={e => setTermsChecked(e.target.checked)}
                          required
                          style={{ width: 16, height: 16, marginTop: 2, accentColor: '#c5a05a', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 12, color: 'rgba(236,232,225,0.45)', lineHeight: 1.55, fontWeight: 300 }}>
                          I&apos;m 18 or older and accept the{' '}
                          <a href="/terms" style={{ color: '#c5a05a', textDecoration: 'none' }}>Members&apos; Code</a>
                          {' '}and{' '}
                          <a href="/privacy" style={{ color: '#c5a05a', textDecoration: 'none' }}>Privacy Policy</a>
                        </span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={newsletterChecked}
                          onChange={e => setNewsletterChecked(e.target.checked)}
                          style={{ width: 16, height: 16, marginTop: 2, accentColor: '#c5a05a', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 12, color: 'rgba(236,232,225,0.45)', lineHeight: 1.55, fontWeight: 300 }}>
                          Send me curated updates — new listings, private events &amp; exclusive offers
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="lx-error">{error}</div>
                  )}

                  {/* Submit */}
                  <button className="lx-submit-btn" type="submit" disabled={loading}>
                    {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
                    {!loading && <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />}
                  </button>
                </form>

                {/* Legal footer */}
                <p style={{
                  fontSize: 11,
                  color: 'rgba(236,232,225,0.25)',
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  lineHeight: 1.65,
                  fontWeight: 300,
                }}>
                  We never share your identity with third parties.<br />
                  GDPR-compliant · data encrypted at rest.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
