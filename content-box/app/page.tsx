// Foundations landing (Phase 0). Confirms the app is wired and reports whether
// the standalone Supabase project is configured yet. Real screens (Discover,
// My Rentals, Drop, Wallet) arrive in later phases per docs/content-box-frontend.md.

export const dynamic = 'force-dynamic';

function envReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export default function Page() {
  const ready = envReady();
  const loop = [
    ['DROP', 'Creator posts content → pending review → approved'],
    ['DISCOVER', 'Users browse one blurred feed across creators'],
    ['RENT', 'Pay tokens to unlock for 24 hours'],
    ['EXPIRE', 'Access is revoked automatically after 24h'],
  ];

  return (
    <main
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '64px 22px',
        lineHeight: 1.6,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: 'var(--ember)',
        }}
      >
        Phase 0 · Foundations
      </div>
      <h1
        className="serif"
        style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-.02em', margin: '.2em 0 .3em' }}
      >
        Content Box
      </h1>
      <p style={{ color: 'var(--ink2)', marginTop: 0 }}>
        A temporary multi-creator content marketplace. The core loop:
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 28px' }}>
        {loop.map(([k, v]) => (
          <li
            key={k}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'baseline',
              padding: '9px 0',
              borderTop: '1px solid var(--line)',
              color: 'var(--ink2)',
              fontSize: 14,
            }}
          >
            <b
              className="mono"
              style={{ color: 'var(--ember)', fontSize: 11, width: 78, flex: 'none' }}
            >
              {k}
            </b>
            <span>{v}</span>
          </li>
        ))}
      </ul>

      <div
        style={{
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          padding: '14px 16px',
          boxShadow: 'var(--shadow)',
          fontSize: 13.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: ready ? 'var(--ok)' : 'var(--warn)',
              flex: 'none',
            }}
          />
          <b>{ready ? 'Supabase configured' : 'Supabase not configured yet'}</b>
        </div>
        <p style={{ margin: '8px 0 0', color: 'var(--ink3)' }}>
          {ready
            ? 'Environment variables are set. Ready for auth wiring in Phase 1.'
            : 'Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY (see .env.example and README).'}
        </p>
      </div>
    </main>
  );
}
