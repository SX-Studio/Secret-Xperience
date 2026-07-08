'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '../../lib/supabase'

type Picked = { file: File; preview: string }

export default function ListingPhotosPage() {
  const supabase = createClient()
  const [authState, setAuthState] = useState<'loading' | 'out' | 'in'>('loading')
  const [listingId, setListingId] = useState('')
  const [listingTitle, setListingTitle] = useState<string | null>(null)
  const [picked, setPicked] = useState<Picked[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [done, setDone] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('listing')
    if (id) setListingId(id)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'in' : 'out')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...picked]
    for (const file of Array.from(list)) {
      if (!file.type.startsWith('image/')) continue
      if (next.length >= 10) break
      next.push({ file, preview: URL.createObjectURL(file) })
    }
    setPicked(next)
    setDone(null)
    setError(null)
  }

  function removeAt(i: number) {
    const next = [...picked]
    URL.revokeObjectURL(next[i].preview)
    next.splice(i, 1)
    setPicked(next)
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= picked.length) return
    const next = [...picked]
    ;[next[i], next[j]] = [next[j], next[i]]
    setPicked(next)
  }

  async function publish() {
    if (!listingId.trim() || picked.length === 0 || busy) return
    setBusy(true)
    setError(null)
    setDone(null)
    try {
      setProgress('Preparing upload…')
      const signRes = await fetch('/api/admin/listing-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          listingId: listingId.trim(),
          files: picked.map(p => ({ name: p.file.name, type: p.file.type })),
        }),
      })
      const sign = await signRes.json()
      if (!signRes.ok) throw new Error(sign.error || 'Could not prepare upload')
      setListingTitle(sign.listingTitle || null)

      const urls: string[] = []
      for (let i = 0; i < picked.length; i++) {
        setProgress(`Uploading photo ${i + 1} of ${picked.length}…`)
        const { path, token, publicUrl } = sign.uploads[i]
        const { error: upErr } = await supabase.storage
          .from('listings')
          .uploadToSignedUrl(path, token, picked[i].file, { contentType: picked[i].file.type })
        if (upErr) throw new Error(`Upload failed (photo ${i + 1}): ${upErr.message}`)
        urls.push(publicUrl)
      }

      setProgress('Attaching photos to the listing…')
      const attachRes = await fetch('/api/admin/listing-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'attach', listingId: listingId.trim(), urls }),
      })
      const attach = await attachRes.json()
      if (!attachRes.ok) throw new Error(attach.error || 'Could not attach photos')

      setDone(urls)
      setProgress('')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
      setProgress('')
    } finally {
      setBusy(false)
    }
  }

  const box: React.CSSProperties = {
    background: '#17121d',
    border: '1px solid #2c2436',
    borderRadius: 14,
    padding: 20,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0e0a12', color: '#e9e2f0', fontFamily: 'system-ui, sans-serif', padding: '40px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 16 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>Listing photos</h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>
          Upload photos and attach them to a listing. This replaces the listing&apos;s current photos. Admin only.
        </p>

        {authState === 'loading' && <div style={box}>Checking session…</div>}
        {authState === 'out' && (
          <div style={box}>
            You are not logged in.{' '}
            <a href={`/login?next=${encodeURIComponent('/admin/listing-photos' + (listingId ? `?listing=${listingId}` : ''))}`} style={{ color: '#d4a94e' }}>
              Log in as admin
            </a>{' '}
            and come back.
          </div>
        )}

        {authState === 'in' && (
          <>
            <div style={box}>
              <label style={{ display: 'block', fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Listing ID</label>
              <input
                value={listingId}
                onChange={e => setListingId(e.target.value)}
                placeholder="e.g. e205952d-231c-4de0-8214-89333db917cf"
                style={{ width: '100%', boxSizing: 'border-box', background: '#0e0a12', border: '1px solid #2c2436', borderRadius: 8, padding: '10px 12px', color: '#e9e2f0', fontSize: 14 }}
              />
              {listingTitle && <div style={{ marginTop: 8, fontSize: 13, color: '#d4a94e' }}>→ {listingTitle}</div>}
            </div>

            <div
              style={{ ...box, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed' }}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
            >
              <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e => addFiles(e.target.files)} />
              <div style={{ fontSize: 15 }}>Tap here to pick photos, or drag &amp; drop</div>
              <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>Order below = order on the card. First photo is the cover. Max 10.</div>
            </div>

            {picked.length > 0 && (
              <div style={{ ...box, display: 'grid', gap: 10 }}>
                {picked.map((p, i) => (
                  <div key={p.preview} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.preview} alt="" style={{ width: 56, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i + 1}. {p.file.name} {i === 0 && <span style={{ color: '#d4a94e' }}>(cover)</span>}
                    </div>
                    <button onClick={() => move(i, -1)} disabled={i === 0 || busy} style={btn}>↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === picked.length - 1 || busy} style={btn}>↓</button>
                    <button onClick={() => removeAt(i)} disabled={busy} style={{ ...btn, color: '#e07a7a' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={publish}
              disabled={busy || !listingId.trim() || picked.length === 0}
              style={{
                background: busy || !listingId.trim() || picked.length === 0 ? '#3a3145' : '#d4a94e',
                color: busy || !listingId.trim() || picked.length === 0 ? '#8a8194' : '#1a1207',
                border: 'none', borderRadius: 10, padding: '14px 18px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {busy ? progress || 'Working…' : `Place ${picked.length || ''} photo${picked.length === 1 ? '' : 's'} on listing`}
            </button>

            {error && <div style={{ ...box, borderColor: '#7a3a3a', color: '#e0a0a0' }}>⚠ {error}</div>}
            {done && (
              <div style={{ ...box, borderColor: '#3a5a3a' }}>
                <div style={{ color: '#9fd49f', marginBottom: 8 }}>✓ {done.length} photos attached{listingTitle ? ` to “${listingTitle}”` : ''}.</div>
                <a href={`/listings/${listingId.trim()}`} style={{ color: '#d4a94e', fontSize: 14 }}>View the listing →</a>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

const btn: React.CSSProperties = {
  background: '#241d2e',
  border: '1px solid #2c2436',
  borderRadius: 8,
  color: '#e9e2f0',
  width: 34,
  height: 34,
  cursor: 'pointer',
}
