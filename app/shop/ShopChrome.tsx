import Link from 'next/link'

/**
 * Header and footer for the boutique.
 *
 * `standalone` is true when the page is being served from
 * secretxperience.shop. In that mode the chrome carries no route into the
 * adult marketplace — no logo link home, no Events, no "List your shop", and
 * shop-scoped legal pages instead of the marketplace's. A processor or a
 * customer landing on the storefront should be able to browse the whole domain
 * without arriving at an escort directory; keeping that true is the reason the
 * domain is separate at all. See docs/data-handling-policy.md.
 */

const GOLD = 'var(--gold)'

export function ShopHeader({ standalone, back }: { standalone: boolean; back?: { href: string; label: string } }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', height: '58px',
      position: 'sticky', top: standalone && !back ? '34px' : 0, zIndex: 200,
      background: 'rgba(8,6,18,0.96)', backdropFilter: 'blur(18px)',
      borderBottom: '0.5px solid var(--b)',
    }}>
      {back ? (
        <Link href={back.href} style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="ti ti-arrow-left" /> {back.label}
        </Link>
      ) : <span />}

      <Link
        href="/"
        style={{ fontFamily: 'var(--serif)', fontSize: back ? '20px' : '22px', color: GOLD, letterSpacing: '.02em', textDecoration: 'none', filter: 'drop-shadow(0 0 12px rgba(197,160,90,0.25))' }}
      >
        Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        {standalone && <span style={{ fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--t3)', marginLeft: 8, fontStyle: 'normal' }}>Boutique</span>}
      </Link>

      {back ? <span /> : (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {standalone ? (
            <>
              <Link href="/shipping" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Shipping</Link>
              <Link href="/returns" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Returns</Link>
            </>
          ) : (
            <>
              <Link href="/events" style={{ fontSize: '13px', color: 'var(--t2)', textDecoration: 'none' }}>Events</Link>
              <Link href="/advertise" style={{
                height: '34px', padding: '0 16px',
                background: 'linear-gradient(135deg,var(--gold),var(--goldd))',
                borderRadius: 'var(--r)', color: '#0a0a0a',
                fontSize: '13px', fontWeight: 700,
                textDecoration: 'none', display: 'flex', alignItems: 'center',
              }}>
                List your shop
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export function ShopFooter({ standalone }: { standalone: boolean }) {
  const linkStyle = { color: 'var(--t3)', textDecoration: 'none' } as const
  return (
    <footer style={{ borderTop: '0.5px solid var(--b)', background: 'var(--bg1)', padding: '2rem 1.5rem', textAlign: 'center' }}>
      <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: GOLD, textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
        Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        {standalone && <span style={{ fontSize: '10px', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--t3)', marginLeft: 8, fontStyle: 'normal' }}>Boutique</span>}
      </Link>
      <p style={{ fontSize: '12px', color: 'var(--t3)' }}>
        Adults only (18+)
        {standalone ? (
          <>
            {' '}·{' '}<Link href="/shipping" style={linkStyle}>Shipping</Link>
            {' '}·{' '}<Link href="/returns" style={linkStyle}>Returns</Link>
            {' '}·{' '}<Link href="/terms" style={linkStyle}>Terms of Sale</Link>
            {' '}·{' '}<Link href="/privacy" style={linkStyle}>Privacy</Link>
          </>
        ) : (
          <>
            {' '}·{' '}<Link href="/regulations" style={linkStyle}>Regulations</Link>
            {' '}·{' '}<Link href="/medical" style={linkStyle}>Medical Info</Link>
            {' '}·{' '}<Link href="/terms" style={linkStyle}>Terms</Link>
            {' '}·{' '}<Link href="/privacy" style={linkStyle}>Privacy</Link>
          </>
        )}
      </p>
    </footer>
  )
}
