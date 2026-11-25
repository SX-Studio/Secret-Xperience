'use client'
import { useState, FormEvent } from 'react'

const S = { bg: '#080808', t: '#e8e0d0', t2: '#888', t3: '#555', gold: '#c5a05a', b: '#c5a05a22', b2: '#ffffff18', serif: "'Cormorant Garamond', serif", sans: "'Poppins', sans-serif" }

const inputStyle: React.CSSProperties = {
  background: '#0d0b08',
  border: '0.5px solid #c5a05a33',
  color: '#e8e0d0',
  fontFamily: "'Poppins', sans-serif",
  fontSize: 14,
  padding: '12px 14px',
  borderRadius: 3,
  width: '100%',
  outline: 'none',
  appearance: 'none' as any,
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSubmitting(true)
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div style={{ background: S.bg, minHeight: '100vh', color: S.t, fontFamily: S.sans }}>
      <style>{`
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #c5a05a44; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #c5a05a88; }
        a { color: #c5a05a; text-decoration: none; }
        a:hover { text-decoration: underline; }
        input, select, textarea {
          background: #0d0b08;
          border: 0.5px solid #c5a05a33;
          color: #e8e0d0;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          padding: 12px 14px;
          border-radius: 3px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
          appearance: none;
        }
        input:focus, select:focus, textarea:focus { border-color: #c5a05a88; }
        input::placeholder, textarea::placeholder { color: #444; }
        select option { background: #111; color: #e8e0d0; }
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: `0.5px solid ${S.b}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: S.serif, fontSize: 18, fontWeight: 600, color: S.t, letterSpacing: '0.04em', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Secret<span style={{ color: S.gold }}>Xperience</span>
        </a>
        <a href="/" style={{ fontSize: 13, color: S.t2 }}>← Back</a>
      </header>

      <div style={{ borderBottom: `0.5px solid #c5a05a18`, padding: '64px 24px 48px', textAlign: 'center', background: 'linear-gradient(180deg, #0d0b08 0%, #080808 100%)' }}>
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.gold, marginBottom: 20 }}>Get in Touch</div>
        <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: S.t, lineHeight: 1.1, marginBottom: 16 }}>Contact Us</h1>
        <p style={{ fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Our support team responds within 24–48 hours. For urgent content concerns, please use our <a href="/report">report page</a>.
        </p>
        <div style={{ marginTop: 24 }}>
          <a href="mailto:support@secretxperience.eu" style={{ fontSize: 16, color: S.gold, fontFamily: S.serif, letterSpacing: '0.02em' }}>support@secretxperience.eu</a>
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '4rem 24px 6rem' }}>
        <div className="sx-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 48, alignItems: 'flex-start' }}>

          {/* Form column */}
          <div>
            {submitted ? (
              <div style={{ border: `0.5px solid #c5a05a44`, borderRadius: 4, padding: '40px 32px', textAlign: 'center', background: '#0a0a0a' }}>
                <div style={{ fontFamily: S.serif, fontSize: 48, color: S.gold, marginBottom: 16, lineHeight: 1 }}>✓</div>
                <h2 style={{ fontFamily: S.serif, fontSize: 28, fontWeight: 400, color: S.t, marginBottom: 12 }}>Message Sent</h2>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.8 }}>
                  Thank you for reaching out. Our support team will review your message and respond to{' '}
                  <strong style={{ color: S.gold }}>{form.email || 'your email'}</strong> within 24–48 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  style={{ marginTop: 24, background: 'none', border: `0.5px solid #c5a05a44`, color: S.gold, cursor: 'pointer', padding: '10px 20px', borderRadius: 3, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: S.sans }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 6 }}>Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Display name or alias"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 6 }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 6 }}>Subject</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" disabled>Select a subject…</option>
                    <option value="general">General Enquiry</option>
                    <option value="advertise">Advertise</option>
                    <option value="report">Report Content</option>
                    <option value="support">Support</option>
                    <option value="press">Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 6 }}>Message</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Describe your question or issue in detail…"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 140 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: S.gold, color: '#080808', border: 'none', cursor: submitting ? 'default' : 'pointer', padding: '14px 28px', borderRadius: 3, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, fontFamily: S.sans, alignSelf: 'flex-start', opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Info column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Company card */}
            <div style={{ border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 10 }}>Company</div>
              <div style={{ fontSize: 14, color: S.t2, lineHeight: 2 }}>
                <strong style={{ color: S.t, display: 'block', marginBottom: 2 }}>3S.lifestyle bv</strong>
                Tangendallaan 23<br />
                1850 Grimbergen<br />
                Belgium<br />
                <span style={{ color: S.t3, fontSize: 12 }}>VAT: BE 0749.661.728</span>
              </div>
            </div>

            {/* Email */}
            <div style={{ border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 8 }}>Email Support</div>
              <a href="mailto:support@secretxperience.eu" style={{ fontFamily: S.serif, fontSize: 15, color: S.gold, wordBreak: 'break-all', display: 'block' }}>
                support@secretxperience.eu
              </a>
            </div>

            {/* Response time */}
            <div style={{ border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 8 }}>Response Time</div>
              <div style={{ fontSize: 14, color: S.t2, lineHeight: 1.7 }}>
                Within 24–48 hours<br />
                <span style={{ color: '#444', fontSize: 12 }}>Mon – Sun, including weekends</span>
              </div>
            </div>

            {/* Report content */}
            <div style={{ border: `0.5px solid ${S.b}`, borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.t3, marginBottom: 8 }}>Report Content</div>
              <div style={{ fontSize: 13, color: S.t2, lineHeight: 1.7, marginBottom: 8 }}>
                To report illegal or harmful content, use our dedicated report page.
              </div>
              <a href="/report" style={{ fontSize: 13, color: S.gold }}>Report content →</a>
            </div>

            {/* Self-service */}
            <div style={{ border: `0.5px solid #c5a05a11`, borderRadius: 4, padding: '20px', background: '#0a0a0a' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>Self-Service</div>
              <a href="/faq" style={{ fontSize: 13, color: S.gold, lineHeight: 1.9, display: 'block' }}>Browse the FAQ →</a>
              <a href="/how-it-works" style={{ fontSize: 13, color: '#c5a05a66', lineHeight: 1.9, display: 'block' }}>How it works →</a>
              <a href="/advertise" style={{ fontSize: 13, color: '#c5a05a66', lineHeight: 1.9, display: 'block' }}>Advertise on the platform →</a>
            </div>

          </div>
        </div>
      </main>

      <footer style={{ borderTop: `0.5px solid ${S.b}`, padding: '2rem 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: S.t2 }}>© 2026 SecretXperience.eu · <a href="/regulations">Regulations</a> · <a href="/medical">Medical Info</a> · <a href="/terms">Terms of Use</a> · <a href="/privacy">Privacy Policy</a> · <a href="/cookies">Cookie Policy</a> · <a href="/dmca">DMCA</a> · <a href="/contact">Contact</a></p>
      </footer>
    </div>
  )
}
