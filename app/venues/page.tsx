'use client'

import Link from 'next/link'
import VenuesShowcase from '../components/VenuesShowcase'
import { venues } from '../data/venues'

export default function VenuesPage() {
  return (
    <div style={{ background: '#080612', minHeight: '100vh', color: '#ece8e1' }}>
      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '64px', position: 'sticky', top: 0, zIndex: 200, background: 'rgba(8,6,18,0.92)', backdropFilter: 'blur(18px)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: '#c5a05a', letterSpacing: '.02em', textDecoration: 'none' }}>
          Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
        </Link>
        <Link href="/" style={{ height: '36px', padding: '0 14px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(236,232,225,0.65)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="ti ti-arrow-left" /> Home
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ padding: '4.5rem 1.5rem 3rem', textAlign: 'center', position: 'relative', overflow: 'hidden', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(197,160,90,0.08) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ font: '700 11px/1 Poppins, sans-serif', letterSpacing: '0.3em', color: '#c5a05a', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Venues · Belgium</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.2rem,5vw,3.4rem)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 1rem' }}>
            Clubs, Saunas &amp; <em style={{ fontStyle: 'italic', color: '#c5a05a' }}>Erotic Massage</em>
          </h1>
          <p style={{ fontSize: '15.5px', color: 'rgba(236,232,225,0.6)', lineHeight: 1.7, maxWidth: '540px', margin: '0 auto' }}>
            A curated directory of {venues.length} adult venues across Belgium — gentlemen&rsquo;s clubs, erotic massage salons, saunas and swingers clubs. Each links directly to its own website.
          </p>
        </div>
      </section>

      {/* DIRECTORY */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        <VenuesShowcase variant="full" />
        <p style={{ marginTop: '3rem', fontSize: '11.5px', color: 'rgba(236,232,225,0.35)', textAlign: 'center', lineHeight: 1.6 }}>
          Listings are provided for information. SecretXperience is not affiliated with these venues; visit each website for current details, hours and pricing.
        </p>
      </div>
    </div>
  )
}
