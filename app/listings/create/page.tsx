'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '../../lib/supabase'
import { POSSIBILITY_GROUPS, POSSIBILITY_CATEGORIES } from '../../lib/possibilities'
import { ETHNICITIES, HAIR_COLOURS, BUILDS } from '../../lib/attributes'
import { detectFocalPoint, imageFromFile } from '../../lib/imageFocus'

/* ─── Data ─────────────────────────────────────────────── */

const CATEGORIES = [
  { value: 'escorts',       label: 'Escort',        icon: '✦' },
  { value: 'massage',       label: 'Massage',        icon: '◈' },
  { value: 'companionship', label: 'Companionship',  icon: '◇' },
  { value: 'domination',    label: 'Domination',     icon: '◉' },
  { value: 'adult',         label: 'Adult Services', icon: '▲' },
  { value: 'creators',      label: 'Creators',       icon: '◎' },
  { value: 'nightlife',     label: 'Nightlife',      icon: '◐' },
  { value: 'experiences',   label: 'Experiences',    icon: '◆' },
  { value: 'rentals',       label: 'Rentals',        icon: '□' },
  { value: 'events',        label: 'Event Spaces',   icon: '◳' },
  { value: 'photo',         label: 'Photo / Video',  icon: '◑' },
  { value: 'memberships',   label: 'Memberships',    icon: '◈' },
]

const ESCORT_TYPES = [
  'Independent', 'Private', 'Agency', 'VIP / Elite',
  'Touring', 'Duo / Couple', 'Male', 'Female', 'Non-binary', 'Trans',
]

const COUNTRIES = [
  'Belgium', 'Netherlands', 'France', 'Germany',
  'Luxembourg', 'United Kingdom', 'Switzerland', 'Austria',
  'Spain', 'Italy', 'Other',
]

const MEET_TYPES = [
  { value: 'incall',  label: 'Incall / Private',  desc: 'At your location' },
  { value: 'outcall', label: 'Outcall / Escort',  desc: "At client's location" },
  { value: 'both',    label: 'Both',     desc: 'Either works' },
]

const ALL_SERVICES = ['69','Anal','BDSM','Body Massage','Couples','Cum on Body','Cum on Face','Deep Throat','Doggy Style','Domina','Duo','Erotic Massage','Facesitting','Fetish','Foot Worship','French Kissing','GFE','Golden Shower','Handjob','Kissing','Lap Dance','Massage','Mistress','Oral','Prostate Massage','Rimming','Roleplay','Spanking','Squirting','Strap-on','Striptease','Tantra','Thai Massage','Threesome','Toys']

const SERVICE_TAGS: Record<string, string[]> = {
  escorts:      ALL_SERVICES,
  companionship:ALL_SERVICES,
  massage:      ALL_SERVICES,
  domination:   ALL_SERVICES,
}

const ETHNICITY_OPTIONS = ETHNICITIES
const BUILD_OPTIONS     = BUILDS
const HAIR_OPTIONS      = HAIR_COLOURS

const STATS_CATEGORIES  = ['escorts', 'companionship', 'massage', 'domination']
const WH_CATEGORIES     = ['escorts', 'companionship', 'massage', 'domination', 'nightlife', 'adult']
const WH_DAYS           = ['mon','tue','wed','thu','fri','sat','sun']
const WH_DAY_LABELS     = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

/* ─── Types ─────────────────────────────────────────────── */

interface FormState {
  category:    string
  subcategory: string
  title:       string
  description: string
  city:        string
  country:     string
  price_from:  string
  price_to:    string
  age:         string
  meet_type:   string
  images:      string[]
  image_focus: Record<string, { x: number; y: number }>
  videos:      string[]
  tags:        string[]
  services:    string[]
  ethnicity:   string
  build:       string
  hair:        string
  tier:        string
  website:     string
  contact_phone:  string
  whatsapp_optin: boolean
  wh_mon: string; wh_tue: string; wh_wed: string; wh_thu: string
  wh_fri: string; wh_sat: string; wh_sun: string
}

const LISTING_TIERS = [
  { id: 'basic',    label: 'Basic',            tokens: 0,    days: 1,  desc: 'Standard grid listing — free, always on',          color: '#ffffff44' },
  { id: 'featured', label: 'Featured',         tokens: 50,   days: 7,  desc: 'Gold-border, priority in category grid',           color: '#c5a05a' },
  { id: 'slider',   label: 'Slider Ad',        tokens: 200,  days: 7,  desc: 'Rotating slideshow ad — site-wide visibility',     color: '#7a8aee' },
  { id: 'section',  label: 'Section Premium',  tokens: 240,  days: 7,  desc: 'Full-width banner across your category page',      color: '#5ec8c0' },
  { id: 'premium',  label: 'Premium',          tokens: 300,  days: 30, desc: 'Top of category for 30 days, premium badge',       color: '#e0a0c8' },
  { id: 'homepage', label: 'Homepage Premium', tokens: 1100, days: 30, desc: 'Full-width banner on the homepage — max exposure', color: '#e8c97a' },
]

interface UploadingImage {
  id:       string
  name:     string
  preview:  string
  loading:  boolean
  error?:   string
}

/* ─── Helpers ───────────────────────────────────────────── */

const TOTAL_STEPS = 5

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2.5rem' }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const idx = i + 1
        const done    = idx < current
        const active  = idx === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: done
                ? 'var(--grad-gold, linear-gradient(135deg,#c5a05a,#a0803d))'
                : active
                ? 'transparent'
                : 'transparent',
              border: done
                ? 'none'
                : active
                ? '1px solid var(--gold, #c5a05a)'
                : '0.5px solid var(--b2, rgba(255,255,255,0.12))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.3s',
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--gold, #c5a05a)' : 'var(--t3, rgba(255,255,255,0.2))',
                  lineHeight: 1,
                }}>
                  {idx}
                </span>
              )}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div style={{
                width: '32px',
                height: '0.5px',
                background: done
                  ? 'linear-gradient(90deg,var(--gold,#c5a05a),rgba(197,160,90,0.3))'
                  : 'var(--b, rgba(255,255,255,0.08))',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────── */

export default function CreateListingPage() {
  const [step, setStep]       = useState(1)
  const [user, setUser]       = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [wallet, setWallet]   = useState<{ balance: number } | null>(null)
  // Identity-verification gate: 'loading' until checked, then verified / pending / rejected / none.
  const [verifGate, setVerifGate] = useState<'loading' | 'verified' | 'pending' | 'rejected' | 'none'>('loading')

  const [form, setForm] = useState<FormState>({
    tier:        'basic',
    category:    '',
    subcategory: '',
    title:       '',
    description: '',
    city:        '',
    country:     'Belgium',
    price_from:  '',
    price_to:    '',
    age:         '',
    meet_type:   'both',
    images:      [],
    image_focus: {},
    videos:      [],
    tags:        [],
    services:    [],
    ethnicity:   '',
    build:       '',
    hair:        '',
    website:        '',
    contact_phone:  '',
    whatsapp_optin: false,
    wh_mon: '10-22', wh_tue: '10-22', wh_wed: '10-22', wh_thu: '10-22',
    wh_fri: '10-22', wh_sat: 'off',   wh_sun: 'off',
  })

  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([])
  const [isDragging, setIsDragging]           = useState(false)
  const [draftBanner, setDraftBanner]         = useState(false)
  const [draftSaved, setDraftSaved]           = useState(false)
  // Autosave stays OFF until we know there's no pending draft to restore (or
  // the user has resumed/dismissed it). Otherwise the empty initial form would
  // immediately overwrite a saved draft before the user can click "Resume".
  const autosaveOn = useRef(false)
  const fileInputRef    = useRef<HTMLInputElement>(null)
  const videoInputRef   = useRef<HTMLInputElement>(null)
  const [uploadingVideos, setUploadingVideos] = useState<{ id: string; name: string; loading: boolean; error?: string }[]>([])
  const [isVideoDragging, setIsVideoDragging] = useState(false)

  const uploadVideo = useCallback(async (file: File) => {
    if (form.videos.length + uploadingVideos.filter(v => v.loading).length >= 3) return
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
    if (!allowed.includes(file.type)) { alert(`${file.name} is not a supported format (MP4, WebM, MOV).`); return }
    if (file.size > 30 * 1024 * 1024) { alert(`${file.name} exceeds the 30 MB limit.`); return }
    const uid = Math.random().toString(36).slice(2)
    setUploadingVideos(prev => [...prev, { id: uid, name: file.name, loading: true }])
    try {
      // Upload directly from the browser to the dedicated 'videos' bucket using
      // the user's own auth session. Direct browser→Supabase upload bypasses
      // Vercel's 4.5 MB body limit; the bucket's RLS policy ("Users upload own
      // videos") lets an authenticated user write to their own /<uid>/ folder.
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Your session expired — please sign in again.')

      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase()
      const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('videos')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error

      const publicUrl = supabase.storage.from('videos').getPublicUrl(path).data.publicUrl
      setForm(f => ({ ...f, videos: [...f.videos, publicUrl] }))
      setUploadingVideos(prev => prev.filter(v => v.id !== uid))
    } catch (err: any) {
      setUploadingVideos(prev => prev.map(v => v.id === uid ? { ...v, loading: false, error: err.message } : v))
    }
  }, [form.videos, uploadingVideos])

  const handleVideoFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const remaining = 3 - form.videos.length - uploadingVideos.filter(v => v.loading).length
    Array.from(files).slice(0, remaining).forEach(uploadVideo)
  }, [form.videos.length, uploadingVideos, uploadVideo])

  const removeVideo = (url: string) => setForm(f => ({ ...f, videos: f.videos.filter(v => v !== url) }))

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUser(session.user)
      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      // Identity-verification gate (Verotel compliance): an advertiser can only
      // publish once their ID is approved. Mirror the RLS check on the client
      // so unverified users see a clear "verify first" screen instead of a
      // form that would fail on submit.
      if (prof?.verified === true || prof?.role === 'admin') {
        setVerifGate('verified')
      } else {
        const { data: verif } = await supabase
          .from('identity_verifications').select('status').eq('user_id', session.user.id).maybeSingle()
        setVerifGate(verif?.status === 'approved' ? 'verified'
          : verif?.status === 'pending' ? 'pending'
          : verif?.status === 'rejected' ? 'rejected'
          : 'none')
      }
      // Load token wallet
      const { data: w } = await supabase
        .from('user_wallets').select('balance').eq('user_id', session.user.id).maybeSingle()
      setWallet(w)
      // Check for saved draft. If one exists, hold autosave until the user
      // resumes or dismisses it; otherwise enable autosave right away.
      try {
        const saved = localStorage.getItem('sx_listing_draft')
        if (saved) setDraftBanner(true)
        else autosaveOn.current = true
      } catch(e) { autosaveOn.current = true }
    }
    load()
  }, [])

  function saveDraft() {
    try {
      localStorage.setItem('sx_listing_draft', JSON.stringify({ step, form }))
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
    } catch(e) {}
  }

  function restoreDraft() {
    try {
      const saved = localStorage.getItem('sx_listing_draft')
      if (!saved) return
      const { step: savedStep, form: savedForm } = JSON.parse(saved)
      setForm((prev) => ({
        ...prev,
        ...savedForm,
        tags: Array.isArray(savedForm?.tags) ? savedForm.tags : [],
        services: Array.isArray(savedForm?.services) ? savedForm.services : [],
      }))
      setStep(savedStep || 1)
      setDraftBanner(false)
      autosaveOn.current = true
    } catch(e) { setDraftBanner(false); autosaveOn.current = true }
  }

  // Autosave to localStorage on every form/step change (once enabled — see
  // autosaveOn). Skipping the initial render protects a saved draft from being
  // clobbered by the empty starting form before the user can resume it.
  useEffect(() => {
    if (!autosaveOn.current) return
    try {
      localStorage.setItem('sx_listing_draft', JSON.stringify({ step, form }))
    } catch(e) {}
  }, [form, step])

  const set = (field: keyof FormState, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter(t => t !== tag)
        : [...f.tags, tag],
    }))
  }

  function toggleService(svc: string) {
    setForm(f => ({
      ...f,
      services: f.services.includes(svc)
        ? f.services.filter(s => s !== svc)
        : [...f.services, svc],
    }))
  }

  /* ── Image resize helper (canvas, runs in browser) ── */
  const resizeImage = useCallback((file: File): Promise<File> => {
    const TARGET_W = 800
    const TARGET_H = 1067  // 3:4 portrait — fits all card types
    const QUALITY  = 0.87

    return new Promise((resolve, reject) => {
      const img = new Image()
      const blobUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(blobUrl)
        // Skip upscaling — only downscale if image is larger
        const scale = Math.min(1, Math.max(TARGET_W / img.naturalWidth, TARGET_H / img.naturalHeight))
        const drawW = img.naturalWidth  * scale
        const drawH = img.naturalHeight * scale

        const canvas = document.createElement('canvas')
        canvas.width  = Math.min(TARGET_W, img.naturalWidth)
        canvas.height = Math.min(TARGET_H, img.naturalHeight)
        const ctx = canvas.getContext('2d')!

        // Centre-crop to fill canvas (cover behaviour)
        const scaleX  = canvas.width  / img.naturalWidth
        const scaleY  = canvas.height / img.naturalHeight
        const coverScale = Math.max(scaleX, scaleY)
        const sw = canvas.width  / coverScale
        const sh = canvas.height / coverScale
        const sx = (img.naturalWidth  - sw) / 2
        const sy = (img.naturalHeight - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          blob => {
            if (!blob) { reject(new Error('Resize failed')); return }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          },
          'image/jpeg', QUALITY
        )
      }
      img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file) } // fallback: upload original
      img.src = blobUrl
    })
  }, [])

  /* ── Image upload ── */
  const uploadFile = useCallback(async (rawFile: File) => {
    if (form.images.length + uploadingImages.filter(u => u.loading).length >= 5) return

    // Auto-convert HEIC (iPhone default) to JPEG before further checks.
    let file = rawFile
    const isHeic = rawFile.type === 'image/heic' || rawFile.type === 'image/heif'
      || /\.(heic|heif)$/i.test(rawFile.name)
    if (isHeic) {
      try {
        file = await new Promise<File>((resolve, reject) => {
          const img = new Image()
          const url = URL.createObjectURL(rawFile)
          img.onload = () => {
            URL.revokeObjectURL(url)
            if (img.width === 0) { reject(new Error('decode')); return }
            const canvas = document.createElement('canvas')
            canvas.width = img.width; canvas.height = img.height
            canvas.getContext('2d')!.drawImage(img, 0, 0)
            canvas.toBlob(blob => {
              if (!blob) { reject(new Error('blob')); return }
              resolve(new File([blob], rawFile.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' }))
            }, 'image/jpeg', 0.92)
          }
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load')) }
          img.src = url
        })
      } catch {
        alert(`${rawFile.name} is in HEIC format and could not be converted automatically.\nOn iPhone go to Settings → Camera → Formats → Most Compatible, then re-take the photo.`)
        return
      }
    }

    if (file.size > 4 * 1024 * 1024) {
      alert(`${file.name} exceeds the 4 MB limit.`)
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert(`${rawFile.name} is not a supported format (JPEG, PNG, WebP). iPhone users: go to Settings → Camera → Formats → Most Compatible.`)
      return
    }

    const uid     = Math.random().toString(36).slice(2)
    const preview = URL.createObjectURL(file)
    setUploadingImages(prev => [...prev, { id: uid, name: file.name, preview, loading: true }])

    try {
      const resized = await resizeImage(file)
      // Detect focal point from resized file in parallel with the upload.
      const focusPromise = imageFromFile(resized)
        .then(img => detectFocalPoint(img))
        .catch(() => ({ x: 50, y: 30 } as { x: number; y: number }))
      const fd = new FormData()
      fd.append('file', resized)
      const [res, focus] = await Promise.all([
        fetch('/api/upload', { method: 'POST', body: fd }),
        focusPromise,
      ])
      if (!res.ok) throw new Error('Failed to upload image')
      const { publicUrl } = await res.json()

      setForm(f => ({
        ...f,
        images: [...f.images, publicUrl],
        image_focus: { ...f.image_focus, [publicUrl]: focus },
      }))
      setUploadingImages(prev => prev.filter(u => u.id !== uid))
      URL.revokeObjectURL(preview)
    } catch (err: any) {
      setUploadingImages(prev =>
        prev.map(u => u.id === uid ? { ...u, loading: false, error: err.message } : u)
      )
    }
  }, [form.images, uploadingImages, resizeImage])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const remaining = 5 - form.images.length - uploadingImages.filter(u => u.loading).length
    Array.from(files).slice(0, remaining).forEach(uploadFile)
  }, [form.images.length, uploadingImages, uploadFile])

  const removeImage = (url: string) =>
    setForm(f => ({ ...f, images: f.images.filter(u => u !== url) }))

  const removeUploading = (id: string) =>
    setUploadingImages(prev => prev.filter(u => u.id !== id))

  /* ── Submit ── */
  async function handleSubmit() {
    setLoading(true); setError('')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }

    // Compliance gate: never attempt to publish for an unverified advertiser
    // (RLS blocks it anyway, but show a friendly message instead of a DB error).
    if (verifGate !== 'verified') {
      setError('You need an approved identity verification before you can publish a listing.')
      setLoading(false)
      return
    }

    // Basic tier: enforce one listing per 24 hours
    if (form.tier === 'basic') {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: recent } = await supabase
        .from('listings')
        .select('id')
        .eq('profile_id', session.user.id)
        .eq('tier', 'basic')
        .gte('created_at', since)
        .limit(1)
      if (recent && recent.length > 0) {
        setError('Basic listings are limited to one per 24 hours. Upgrade to Featured, Slider Ad, or Premium to list more.')
        setLoading(false)
        return
      }
    }

    // Build final tags array: service tags + physical stat tags + working hours
    const statTags: string[] = []
    if (STATS_CATEGORIES.includes(form.category)) {
      if (form.ethnicity) statTags.push(`Ethnicity: ${form.ethnicity}`)
      if (form.build)     statTags.push(`Build: ${form.build}`)
      if (form.hair)      statTags.push(`Hair: ${form.hair}`)
    }
    const whTags: string[] = []
    if (WH_CATEGORIES.includes(form.category)) {
      for (const day of WH_DAYS) {
        const val = (form as any)[`wh_${day}`] as string
        if (val && val !== 'off') whTags.push(`wh:${day}:${val}`)
      }
    }
    const finalTags = [...form.tags, ...statTags, ...whTags]

    const tierDays: Record<string, number> = { basic: 1, featured: 7, slider: 7, section: 7, premium: 30, homepage: 30 }
    const tierExpiry = new Date()
    tierExpiry.setDate(tierExpiry.getDate() + (tierDays[form.tier] ?? 1))

    const { data: newListing, error: err } = await supabase.from('listings').insert({
      profile_id:      session.user.id,
      title:           form.title,
      description:     form.description || null,
      category:        form.category,
      subcategory:     form.subcategory || null,
      price_from:      form.price_from ? parseInt(form.price_from) : null,
      price_to:        form.price_to   ? parseInt(form.price_to)   : null,
      age:             form.age        ? parseInt(form.age)        : null,
      currency:        'EUR',
      city:            form.city,
      country:         form.country,
      meet_type:       form.meet_type,
      website:         (() => { try { const u = new URL(form.website.trim()); return ['https:', 'http:'].includes(u.protocol) ? u.href : null } catch { return null } })(),
      images:          form.images.length > 0 ? form.images : null,
      image_focus:     form.image_focus || {},
      videos:          form.videos.length > 0 ? form.videos : null,
      tags:            finalTags.length > 0 ? finalTags : null,
      services:        POSSIBILITY_CATEGORIES.has(form.category) && form.services.length > 0 ? form.services : null,
      contact_phone:   form.contact_phone.trim() || null,
      whatsapp_optin:  form.whatsapp_optin,
      active:          false,   // stays false until moderation approves
      status:          'pending',
      tier:            form.tier,
      tier_expires_at: tierExpiry.toISOString(),
    }).select('id').single()

    if (err) { setError(err.message); setLoading(false); return }
    autosaveOn.current = false
    try { localStorage.removeItem('sx_listing_draft') } catch(e) {}

    // Trigger AI moderation (non-blocking — listing stays pending until resolved)
    if (newListing?.id) {
      // Relative URL — always hits the deployment the user is actually on.
      // (NEXT_PUBLIC_SITE_URL once pointed at a dead vercel.app deployment,
      // which made this call 404 silently and left listings stuck pending.)
      fetch(`/api/moderation/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NEXT_PUBLIC_INTERNAL_SECRET || 'sx-internal'}` },
        body: JSON.stringify({ listingId: newListing.id, title: form.title, description: form.description, category: form.category }),
      }).catch(() => {})
    }

    // Spend tokens for the chosen tier — must succeed before continuing
    if (newListing?.id && form.tier !== 'basic') {
      try {
        const spendRes = await fetch('/api/tokens/spend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: newListing.id, tier: form.tier }),
        })
        const spendData = await spendRes.json().catch(() => ({}))
        if (!spendRes.ok) {
          // Downgrade to basic if token spend fails (insufficient balance etc.)
          await supabase.from('listings').update({ tier: 'basic', tier_expires_at: null }).eq('id', newListing.id)
          if (spendRes.status === 402) {
            setError('Insufficient tokens — listing saved as basic. Top up your wallet to upgrade.')
          } else {
            setError(spendData.error || 'Token spend failed — listing saved as basic tier.')
          }
          setLoading(false)
          return
        }
        if (spendData.warning) {
          setError(spendData.warning)
        }
      } catch (e) {
        await supabase.from('listings').update({ tier: 'basic', tier_expires_at: null }).eq('id', newListing.id)
        setError('Could not process token payment — listing saved as basic tier.')
        setLoading(false)
        return
      }
    }

    // Check if advertiser has Stripe connected
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, role')
      .eq('id', session.user.id)
      .single()

    if (!profile?.stripe_connect_account_id && ['provider','venue','creator'].includes(profile?.role || '')) {
      // Store flag to show Connect prompt after redirect
      localStorage.setItem('sx_show_connect_prompt', '1')
    }

    setSuccess(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 1800)
  }

  /* ── Step validation ── */
  function canAdvance(): boolean {
    if (step === 1) return !!form.category
    if (step === 2) return form.title.trim().length >= 3
    if (step === 3) return !!form.city.trim()
    if (step === 4) return true  // photos optional
    return true
  }

  /* ── Shared input style ── */
  const inp: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg3, rgba(255,255,255,0.03))',
    border: '0.5px solid var(--b2, rgba(255,255,255,0.12))',
    borderRadius: 'var(--r, 8px)',
    color: 'var(--t, #ece8e1)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--sans, "Poppins", sans-serif)',
    fontWeight: 300,
    letterSpacing: '0.02em',
    transition: 'border-color var(--t-fast, 0.15s), box-shadow var(--t-fast, 0.15s)',
    boxSizing: 'border-box' as const,
  }

  const inpField: React.CSSProperties = {
    ...inp,
    height: '44px',
    padding: '0 14px',
  }

  const label: React.CSSProperties = {
    display: 'block',
    font: '600 10px/1 var(--sans, "Poppins", sans-serif)',
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: 'var(--t3, rgba(255,255,255,0.3))',
    marginBottom: '6px',
  }

  const fieldWrap: React.CSSProperties = { marginBottom: '1.25rem' }

  /* ─── Success screen ─── */
  if (success) return (
    <>
      <style>{`
        
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg, #050505)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--sans, "Poppins", sans-serif)',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--t, #ece8e1)', animation: 'fadeUp 0.5s ease' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(197,160,90,0.15),rgba(197,160,90,0.05))',
            border: '0.5px solid rgba(197,160,90,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l4.5 4.5L19 7" stroke="#c5a05a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{
            fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
            fontWeight: 300,
            fontSize: '32px',
            color: 'var(--gold, #c5a05a)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.01em',
          }}>
            Listing submitted for review
          </h2>
          <p style={{
            color: 'var(--t2, rgba(255,255,255,0.4))',
            fontSize: '14px',
            fontWeight: 300,
            letterSpacing: '0.03em',
            marginBottom: '2rem',
          }}>
            Your advertisement is under review and will go live shortly. You'll be notified once approved.
          </p>
          <span style={{
            fontSize: '12px',
            color: 'var(--t3, rgba(255,255,255,0.18))',
            fontWeight: 300,
            letterSpacing: '0.06em',
          }}>
            Redirecting to dashboard…
          </span>
        </div>
      </div>
    </>
  )

  /* ─── Identity-verification gate ─── */
  // Block the create flow until the advertiser's ID is approved. This mirrors the
  // RLS policy that enforces the same rule server-side (Verotel compliance).
  if (verifGate !== 'loading' && verifGate !== 'verified') {
    const gate = {
      none:     { icon: 'ti-id-badge-2', title: 'Verify your identity to publish', body: 'For everyone’s safety, all advertisers must confirm their identity and age before a listing can go live. It takes about two minutes — upload a photo ID and a selfie, and our team reviews it.', cta: 'Verify my identity', href: '/verify' },
      pending:  { icon: 'ti-clock-hour-4', title: 'Verification in review', body: 'Thanks — we’ve received your documents and our team is reviewing them. You’ll be notified the moment you’re approved, and then you can publish your advertisement.', cta: 'Check verification status', href: '/verify' },
      rejected: { icon: 'ti-alert-triangle', title: 'Verification needs attention', body: 'We couldn’t verify your last submission. Please resubmit with a clear photo ID and selfie, or contact support if you think this is a mistake.', cta: 'Resubmit documents', href: '/verify' },
    }[verifGate]
    return (
      <>
        <style>{`@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ minHeight: '100vh', background: 'var(--bg, #050505)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'var(--sans, "Poppins", sans-serif)' }}>
          <div style={{ maxWidth: 460, textAlign: 'center', color: 'var(--t, #ece8e1)', animation: 'fadeUp 0.5s ease' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 1.5rem', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(197,160,90,0.15),rgba(197,160,90,0.05))', border: '0.5px solid rgba(197,160,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ti ${gate.icon}`} style={{ fontSize: 30, color: 'var(--gold, #c5a05a)' }} />
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', var(--serif, serif)", fontSize: 30, fontWeight: 400, marginBottom: '0.75rem', lineHeight: 1.15 }}>{gate.title}</h1>
            <p style={{ color: 'var(--t2, rgba(255,255,255,0.5))', fontSize: 14, fontWeight: 300, lineHeight: 1.6, marginBottom: '2rem' }}>{gate.body}</p>
            <a href={gate.href} style={{ display: 'inline-block', padding: '13px 30px', background: 'linear-gradient(90deg,#c5a05a,#e8c97a)', borderRadius: 12, color: '#0a0a0a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{gate.cta} →</a>
            <div style={{ marginTop: '1.25rem' }}>
              <a href="/dashboard" style={{ color: 'var(--t3, rgba(255,255,255,0.35))', fontSize: 13, textDecoration: 'none' }}>← Back to dashboard</a>
            </div>
          </div>
        </div>
      </>
    )
  }

  /* ─── Main render ─── */
  return (
    <>
      <style>{`

        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .cl-category-card {
          position: relative;
          padding: 1.25rem 1rem;
          background: var(--bg2, rgba(255,255,255,0.02));
          border: 0.5px solid var(--b2, rgba(255,255,255,0.08));
          border-radius: var(--r, 8px);
          cursor: pointer;
          text-align: center;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          user-select: none;
        }
        .cl-category-card:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.3));
          background: var(--gbg, rgba(197,160,90,0.04));
          transform: translateY(-2px);
        }
        .cl-category-card.selected {
          border-color: var(--gbrd, rgba(197,160,90,0.7));
          background: var(--gbg, rgba(197,160,90,0.07));
        }
        .cl-category-card.selected .cl-cat-icon {
          color: var(--gold, #c5a05a);
        }

        .cl-inp:focus {
          border-color: var(--gold, rgba(197,160,90,0.5)) !important;
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.06)) !important;
        }

        .cl-meet-btn {
          flex: 1;
          padding: 12px 10px;
          background: var(--bg2, rgba(255,255,255,0.02));
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: border-color 0.2s, background 0.2s;
          user-select: none;
        }
        .cl-meet-btn:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.3));
          background: var(--gbg, rgba(197,160,90,0.04));
        }
        .cl-meet-btn.selected {
          border-color: var(--gbrd, rgba(197,160,90,0.65));
          background: var(--gbg, rgba(197,160,90,0.07));
        }

        .cl-btn-gold {
          background: var(--grad-gold, linear-gradient(135deg,#c5a05a 0%,#a0803d 100%));
          border: none;
          border-radius: var(--r, 8px);
          color: var(--t-on-gold, #080808);
          padding: 12px 28px;
          cursor: pointer;
          font: 600 13px/1 var(--sans, 'Poppins', sans-serif);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: var(--shadow-gold, 0 4px 24px rgba(197,160,90,0.25));
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.15s;
          position: relative;
          overflow: hidden;
        }
        .cl-btn-gold::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,rgba(255,255,255,0.14) 0%,transparent 60%);
          pointer-events: none;
        }
        .cl-btn-gold:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: var(--shadow-gold-h, 0 8px 32px rgba(197,160,90,0.35));
        }
        .cl-btn-gold:disabled { opacity: 0.35; cursor: not-allowed; }

        .cl-btn-ghost {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          color: var(--t2, rgba(255,255,255,0.4));
          padding: 12px 24px;
          cursor: pointer;
          font: 400 13px/1 var(--sans, 'Poppins', sans-serif);
          letter-spacing: 0.04em;
          transition: border-color 0.2s, color 0.2s;
        }
        .cl-btn-ghost:hover {
          border-color: var(--b3, rgba(255,255,255,0.2));
          color: var(--t, rgba(255,255,255,0.65));
        }

        select option { background: var(--bg2, #1a1a1a); color: var(--t, #ece8e1); }

        /* Tag chips */
        .cl-tag-chip {
          padding: 6px 13px;
          border-radius: 20px;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
          background: var(--bg2, rgba(255,255,255,0.02));
          color: var(--t2, rgba(255,255,255,0.4));
          font-family: var(--sans, 'Poppins', sans-serif);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, color 0.18s;
          user-select: none;
          white-space: nowrap;
        }
        .cl-tag-chip:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.35));
          color: rgba(197,160,90,0.7);
        }
        .cl-tag-chip.selected {
          border-color: var(--gbrd, rgba(197,160,90,0.65));
          background: var(--gbg, rgba(197,160,90,0.08));
          color: var(--gold, #c5a05a);
        }

        .cl-upload-zone {
          border: 0.5px dashed var(--b3, rgba(197,160,90,0.25));
          border-radius: var(--rl, 13px);
          padding: 3rem;
          text-align: center;
          background: var(--bg2, rgba(197,160,90,0.02));
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .cl-upload-zone:hover,
        .cl-upload-zone.dragging {
          border-color: var(--gbrd, rgba(197,160,90,0.7));
          background: var(--gbg, rgba(197,160,90,0.05));
        }

        .cl-thumb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          margin-top: 1rem;
        }
        .cl-thumb {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
        }
        .cl-thumb img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .cl-thumb-remove {
          position: absolute;
          top: 5px; right: 5px;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(5,5,5,0.85);
          border: 0.5px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          line-height: 1;
        }
        .cl-thumb-remove:hover { background: rgba(180,60,80,0.85); }

        /* Section headings */
        .cl-section-heading {
          font-family: var(--serif, 'Cormorant Garamond', serif);
          font-size: 26px;
          font-weight: 500;
          color: var(--t, #ece8e1);
          margin: 2.5rem 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 0.5px solid var(--b, rgba(255,255,255,0.07));
        }

        @media (max-width: 480px) {
          .cl-category-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cl-price-grid    { grid-template-columns: 1fr !important; }
          .cl-location-grid { grid-template-columns: 1fr !important; }
          .cl-stats-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg, #050505)', color: 'var(--t, #ece8e1)' }}>

        {/* ── Nav ── */}
        <nav style={{
          background: 'rgba(5,5,5,0.95)',
          borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.06))',
          height: '60px',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
              fontSize: '20px',
              fontWeight: 400,
              color: 'var(--gold, #c5a05a)',
              letterSpacing: '0.04em',
            }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
          </a>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="cl-btn-ghost"
            style={{ padding: '7px 16px', fontSize: '12px', letterSpacing: '0.06em' }}
          >
            Dashboard
          </button>
        </nav>

        {/* ── Body ── */}
        <div style={{
          maxWidth: '860px',
          margin: '0 auto',
          padding: '2rem 1.5rem 6rem',
          animation: 'fadeUp 0.35s ease',
        }}>

          {/* Page title */}
          <h1 style={{
            fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
            fontSize: '36px',
            fontWeight: 500,
            color: 'var(--t, #ece8e1)',
            marginBottom: '2rem',
          }}>
            Create a listing
          </h1>

          {/* Header sub */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              fontFamily: 'var(--sans, "Poppins", sans-serif)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--gold, rgba(197,160,90,0.5))',
              marginBottom: '10px',
              fontWeight: 500,
            }}>
              New listing — Step {step} of {TOTAL_STEPS}
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* Draft restore banner */}
          {draftBanner && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--gbg, rgba(197,160,90,0.07))',
              border: '0.5px solid var(--gbrd, rgba(197,160,90,0.25))',
              borderRadius: 'var(--r, 8px)', padding: '10px 14px', marginBottom: '1.5rem',
              fontFamily: 'var(--sans, "Poppins", sans-serif)', fontSize: '13px',
            }}>
              <span style={{ color: 'var(--t2, rgba(255,255,255,0.55))', fontWeight: 300 }}>Resume draft? You have unsaved progress.</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" onClick={restoreDraft} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold, #c5a05a)', fontSize: '13px', fontFamily: 'var(--sans, "Poppins", sans-serif)', fontWeight: 500, padding: 0 }}>Resume</button>
                <button type="button" onClick={() => { localStorage.removeItem('sx_listing_draft'); setDraftBanner(false); autosaveOn.current = true }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3, rgba(255,255,255,0.25))', fontSize: '13px', fontFamily: 'var(--sans, "Poppins", sans-serif)', fontWeight: 300, padding: 0 }}>Dismiss</button>
              </div>
            </div>
          )}

          {/* ─── Step 1: Category ─── */}
          {step === 1 && (
            <div>
              <h2 className="cl-section-heading">Choose a category</h2>
              <div
                className="cl-category-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginBottom: '2rem',
                }}
              >
                {CATEGORIES.map(cat => (
                  <div
                    key={cat.value}
                    className={`cl-category-card${form.category === cat.value ? ' selected' : ''}`}
                    onClick={() => set('category', cat.value)}
                  >
                    <span
                      className="cl-cat-icon"
                      style={{
                        fontSize: '18px',
                        color: form.category === cat.value ? 'var(--gold, #c5a05a)' : 'var(--t3, rgba(255,255,255,0.18))',
                        lineHeight: 1,
                        transition: 'color 0.2s',
                      }}
                    >
                      {cat.icon}
                    </span>
                    <span style={{
                      fontFamily: 'var(--sans, "Poppins", sans-serif)',
                      fontSize: '12px',
                      fontWeight: form.category === cat.value ? 500 : 400,
                      color: form.category === cat.value ? 'var(--gold, #c5a05a)' : 'var(--t2, rgba(255,255,255,0.5))',
                      letterSpacing: '0.04em',
                      lineHeight: 1.3,
                      transition: 'color 0.2s',
                    }}>
                      {cat.label}
                    </span>
                    {form.category === cat.value && (
                      <div style={{
                        position: 'absolute',
                        top: '8px', right: '8px',
                        width: '7px', height: '7px',
                        borderRadius: '50%',
                        background: 'var(--gold, #c5a05a)',
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Subcategory for escorts */}
              {form.category === 'escorts' && (
                <div style={fieldWrap}>
                  <label style={label}>Escort type (optional)</label>
                  <select
                    value={form.subcategory}
                    onChange={e => set('subcategory', e.target.value)}
                    className="cl-inp"
                    style={{ ...inpField }}
                  >
                    <option value="">Select type…</option>
                    {ESCORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 2: Basic info ─── */}
          {step === 2 && (
            <div>
              <h2 className="cl-section-heading">Describe your service</h2>
              <div style={fieldWrap}>
                <label style={label}>Title *</label>
                <input
                  className="cl-inp"
                  style={inpField}
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Sophia A. — Independent Escort Brussels"
                  maxLength={120}
                />
                <div style={{
                  fontSize: '11px',
                  color: 'var(--t3, rgba(255,255,255,0.18))',
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  marginTop: '6px',
                  fontWeight: 300,
                }}>
                  {form.title.length} / 120
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={label}>Description</label>
                <textarea
                  className="cl-inp"
                  style={{ ...inp, padding: '12px 14px', resize: 'vertical', lineHeight: 1.7, minHeight: '120px' }}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe your service, availability, and what clients can expect…"
                  rows={5}
                />
              </div>

              {/* ── Tags / Services ── */}
              {SERVICE_TAGS[form.category] && (
                <div style={fieldWrap}>
                  <label style={label}>Services &amp; Tags</label>
                  <p style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '12px',
                    color: 'var(--t3, rgba(255,255,255,0.22))',
                    fontWeight: 300,
                    letterSpacing: '0.02em',
                    marginBottom: '10px',
                  }}>
                    Select all that apply — shown on your advertisement.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SERVICE_TAGS[form.category].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={`cl-tag-chip${form.tags.includes(tag) ? ' selected' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {form.tags.length > 0 && (
                    <p style={{
                      fontFamily: 'var(--sans, "Poppins", sans-serif)',
                      fontSize: '11px',
                      color: 'var(--gold, rgba(197,160,90,0.5))',
                      marginTop: '8px',
                      fontWeight: 300,
                      letterSpacing: '0.04em',
                    }}>
                      {form.tags.length} selected
                    </p>
                  )}
                </div>
              )}

              {/* ── Possibilities (grouped service menu) ── */}
              {POSSIBILITY_CATEGORIES.has(form.category) && (
                <div style={fieldWrap}>
                  <label style={label}>Possibilities</label>
                  <p style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '12px',
                    color: 'var(--t3, rgba(255,255,255,0.22))',
                    fontWeight: 300,
                    letterSpacing: '0.02em',
                    marginBottom: '14px',
                  }}>
                    Tick everything you offer. These appear as a clear checklist on your advertisement.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {POSSIBILITY_GROUPS.map(group => (
                      <div key={group.key}>
                        <div style={{
                          fontFamily: 'var(--sans, "Poppins", sans-serif)',
                          fontSize: '11px',
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: 'var(--gold, #c5a05a)',
                          fontWeight: 600,
                          marginBottom: '10px',
                        }}>
                          {group.label}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '7px' }}>
                          {group.items.map(item => {
                            const checked = form.services.includes(item)
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleService(item)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '9px',
                                  padding: '9px 12px',
                                  textAlign: 'left',
                                  background: checked ? 'rgba(197,160,90,0.08)' : 'transparent',
                                  border: `0.5px solid ${checked ? 'var(--gold, #c5a05a)' : 'var(--b2, rgba(255,255,255,0.12))'}`,
                                  borderRadius: 'var(--r, 8px)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                              >
                                <span style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '5px',
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: checked ? 'var(--gold, #c5a05a)' : 'transparent',
                                  border: `1px solid ${checked ? 'var(--gold, #c5a05a)' : 'rgba(255,255,255,0.2)'}`,
                                  color: '#0a0a0a',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}>
                                  {checked ? '✓' : ''}
                                </span>
                                <span style={{
                                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                                  fontSize: '13px',
                                  fontWeight: 300,
                                  color: checked ? 'var(--t, #ece8e1)' : 'var(--t2, rgba(236,232,225,0.6))',
                                  lineHeight: 1.3,
                                }}>
                                  {item}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.services.length > 0 && (
                    <p style={{
                      fontFamily: 'var(--sans, "Poppins", sans-serif)',
                      fontSize: '11px',
                      color: 'var(--gold, rgba(197,160,90,0.5))',
                      marginTop: '14px',
                      fontWeight: 300,
                      letterSpacing: '0.04em',
                    }}>
                      {form.services.length} possibilit{form.services.length === 1 ? 'y' : 'ies'} selected
                    </p>
                  )}
                </div>
              )}

              {/* ── Physical Stats (escorts / companionship / massage / domination) ── */}
              {STATS_CATEGORIES.includes(form.category) && (
                <div style={fieldWrap}>
                  <label style={label}>Physical Stats <span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <p style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '12px',
                    color: 'var(--t3, rgba(255,255,255,0.22))',
                    fontWeight: 300,
                    letterSpacing: '0.02em',
                    marginBottom: '12px',
                  }}>
                    These are appended as tags on your advertisement.
                  </p>
                  <div className="cl-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {/* Ethnicity */}
                    <div>
                      <label style={{ ...label, marginBottom: '4px' }}>Ethnicity</label>
                      <select
                        className="cl-inp"
                        style={inpField}
                        value={form.ethnicity}
                        onChange={e => set('ethnicity', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {ETHNICITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Build */}
                    <div>
                      <label style={{ ...label, marginBottom: '4px' }}>Build</label>
                      <select
                        className="cl-inp"
                        style={inpField}
                        value={form.build}
                        onChange={e => set('build', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {BUILD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Hair */}
                    <div>
                      <label style={{ ...label, marginBottom: '4px' }}>Hair Color</label>
                      <select
                        className="cl-inp"
                        style={inpField}
                        value={form.hair}
                        onChange={e => set('hair', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {HAIR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 3: Location, Pricing, Meet type ─── */}
          {step === 3 && (
            <div>
              {/* Location */}
              <h2 className="cl-section-heading">Location &amp; Pricing</h2>
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--t3, rgba(255,255,255,0.2))',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Location
                </p>
                <div
                  className="cl-location-grid"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                >
                  <div>
                    <label style={label}>City *</label>
                    <input
                      className="cl-inp"
                      style={inpField}
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="Brussels"
                    />
                  </div>
                  <div>
                    <label style={label}>Country</label>
                    <select
                      className="cl-inp"
                      style={inpField}
                      value={form.country}
                      onChange={e => set('country', e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--t3, rgba(255,255,255,0.2))',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Pricing (EUR)
                </p>
                {/* Pricing tier card */}
                <div style={{
                  background: 'var(--bg2, rgba(255,255,255,0.02))',
                  border: '0.5px solid var(--b2, rgba(255,255,255,0.08))',
                  borderRadius: 'var(--rl, 13px)',
                  padding: '1.25rem',
                }}>
                  {STATS_CATEGORIES.includes(form.category) && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={label}>Your age</label>
                      <input
                        type="number"
                        min="18"
                        max="99"
                        className="cl-inp"
                        style={{ ...inpField, width: '120px' }}
                        value={form.age}
                        onChange={e => set('age', e.target.value)}
                        placeholder="25"
                      />
                    </div>
                  )}
                  <div
                    className="cl-price-grid"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                  >
                    <div>
                      <label style={label}>Starting from (€)</label>
                      <input
                        type="number"
                        min="0"
                        className="cl-inp"
                        style={inpField}
                        value={form.price_from}
                        onChange={e => set('price_from', e.target.value)}
                        placeholder="200"
                      />
                    </div>
                    <div>
                      <label style={label}>Up to (€)</label>
                      <input
                        type="number"
                        min="0"
                        className="cl-inp"
                        style={inpField}
                        value={form.price_to}
                        onChange={e => set('price_to', e.target.value)}
                        placeholder="1 200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Meet type */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--t3, rgba(255,255,255,0.2))',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}>
                  Meet type
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {MEET_TYPES.map(mt => (
                    <button
                      key={mt.value}
                      type="button"
                      className={`cl-meet-btn${form.meet_type === mt.value ? ' selected' : ''}`}
                      onClick={() => set('meet_type', mt.value)}
                    >
                      <span style={{
                        fontFamily: 'var(--sans, "Poppins", sans-serif)',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: form.meet_type === mt.value ? 'var(--gold, #c5a05a)' : 'var(--t2, rgba(255,255,255,0.55))',
                        letterSpacing: '0.04em',
                        transition: 'color 0.2s',
                      }}>
                        {mt.label}
                      </span>
                      <span style={{
                        fontFamily: 'var(--sans, "Poppins", sans-serif)',
                        fontSize: '10px',
                        color: 'var(--t3, rgba(255,255,255,0.22))',
                        fontWeight: 300,
                        letterSpacing: '0.03em',
                      }}>
                        {mt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Working Hours — shown for service/nightlife categories */}
              {WH_CATEGORIES.includes(form.category) && (
                <div style={{ marginTop: '1.75rem' }}>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3, rgba(255,255,255,0.2))', fontWeight: 600, marginBottom: '1rem' }}>
                    Working Hours <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 300, opacity: 0.6 }}>(optional)</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {WH_DAYS.map((day, i) => {
                      const key = `wh_${day}` as keyof FormState
                      const val = (form[key] as string) ?? (i < 5 ? '10-22' : 'off')
                      const isOn = val !== 'off'
                      const parts = isOn ? val.split('-') : ['10', '22']
                      const startH = parts[0] ?? '10'
                      const endH   = parts[1] ?? '22'
                      const hourOpts = Array.from({length:24},(_,h)=>String(h).padStart(2,'0'))
                      return (
                        <div key={day} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'32px', fontSize:'11px', color:'rgba(255,255,255,0.4)', fontFamily:'var(--sans)', fontWeight:600, letterSpacing:'0.06em', flexShrink:0 }}>{WH_DAY_LABELS[i]}</div>
                          <button type="button"
                            style={{ width:'28px', height:'28px', borderRadius:'6px', border:'0.5px solid rgba(255,255,255,0.12)', background: isOn ? 'rgba(197,160,90,0.12)' : 'transparent', color: isOn ? 'var(--gold,#c5a05a)' : 'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                            onClick={() => set(key, isOn ? 'off' : '10-22')}>
                            {isOn ? '✓' : '–'}
                          </button>
                          {isOn ? (
                            <>
                              <select value={startH} className="cl-inp" style={{ flex:1, padding:'7px 8px', fontSize:'12px', background:'var(--bg2,rgba(255,255,255,0.04))', border:'0.5px solid var(--b,rgba(255,255,255,0.1))', borderRadius:'6px', color:'var(--t,#ece8e1)', outline:'none' }}
                                onChange={e => set(key, `${e.target.value}-${endH}`)}>
                                {hourOpts.map(h => <option key={h} value={h}>{h}:00</option>)}
                              </select>
                              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', flexShrink:0 }}>to</span>
                              <select value={endH} className="cl-inp" style={{ flex:1, padding:'7px 8px', fontSize:'12px', background:'var(--bg2,rgba(255,255,255,0.04))', border:'0.5px solid var(--b,rgba(255,255,255,0.1))', borderRadius:'6px', color:'var(--t,#ece8e1)', outline:'none' }}
                                onChange={e => set(key, `${startH}-${e.target.value}`)}>
                                {hourOpts.map(h => <option key={h} value={h}>{h}:00</option>)}
                              </select>
                            </>
                          ) : (
                            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.15)', fontFamily:'var(--sans)' }}>Closed</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Website URL — shown for non-personal categories */}
              {!['escorts','companionship','massage','domination','experiences'].includes(form.category) && (
                <div style={{ marginTop: '1.75rem' }}>
                  <label style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--t3, rgba(255,255,255,0.2))',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}>
                    Website URL <span style={{ opacity: 0.5, fontWeight: 300, fontSize: '9px' }}>(optional)</span>
                  </label>
                  <input
                    className="cl-inp"
                    style={{
                      width: '100%',
                      background: 'var(--bg2, rgba(255,255,255,0.04))',
                      border: '0.5px solid var(--b, rgba(255,255,255,0.1))',
                      borderRadius: 'var(--r, 8px)',
                      padding: '12px 14px',
                      color: 'var(--t, #ece8e1)',
                      fontFamily: 'var(--sans, "Poppins", sans-serif)',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    type="url"
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                    placeholder="https://www.yoursite.com"
                  />
                </div>
              )}

              {/* WhatsApp contact opt-in */}
              <div style={{ marginTop: '1.5rem', background: 'rgba(37,211,102,0.04)', border: '0.5px solid rgba(37,211,102,0.2)', borderRadius: 'var(--r)', padding: '1.25rem' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: '0.75rem', fontWeight: 600 }}>WhatsApp contact (optional)</div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--t3)', marginBottom: '6px' }}>
                    Phone number <span style={{ opacity: 0.5, fontWeight: 300 }}>(with country code, e.g. +32 470 …)</span>
                  </label>
                  <input
                    className="cl-input"
                    type="tel"
                    autoComplete="tel"
                    value={form.contact_phone}
                    onChange={e => set('contact_phone', e.target.value)}
                    placeholder="+32 470 000 000"
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.whatsapp_optin}
                    onChange={e => setForm(f => ({ ...f, whatsapp_optin: e.target.checked }))}
                    style={{ marginTop: '2px', accentColor: '#25d366', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.5 }}>
                    I consent to being contacted by SecretXperience via WhatsApp about platform features, promotions and account support.
                    You can opt out at any time by replying STOP.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ─── Step 4: Photo upload ─── */}
          {step === 4 && (
            <div>
              <h2 className="cl-section-heading">Add Photos</h2>
              {form.images.length === 0 && uploadingImages.length === 0 && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(245,168,38,0.08)', border: '0.5px solid rgba(245,168,38,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: '1rem' }}>
                  <i className="ti ti-alert-triangle" style={{ color: '#f5a826', fontSize: 18, flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 13, color: 'var(--t2, #b8b4ad)', lineHeight: 1.5 }}>
                    Listings without photos get far fewer views. Add at least one clear photo to stand out.
                  </div>
                </div>
              )}
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />

              {/* Upload zone */}
              <div
                className={`cl-upload-zone${isDragging ? ' dragging' : ''}`}
                onClick={() => {
                  if (form.images.length + uploadingImages.filter(u => u.loading).length < 5)
                    fileInputRef.current?.click()
                }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault()
                  setIsDragging(false)
                  handleFiles(e.dataTransfer.files)
                }}
              >
                <i className="ti ti-cloud-upload" style={{ fontSize: 48, color: 'var(--t3, rgba(255,255,255,0.25))', display: 'block', marginBottom: '1rem' }} />
                <span style={{
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--t2, rgba(255,255,255,0.65))',
                  letterSpacing: '0.03em',
                }}>
                  Add Photos
                </span>
                <span style={{
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--t2, rgba(255,255,255,0.25))',
                  letterSpacing: '0.04em',
                }}>
                  Up to 5 photos · JPEG, PNG, WebP · 4 MB each
                </span>
                {form.images.length + uploadingImages.filter(u => u.loading).length >= 5 && (
                  <span style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'var(--gold, rgba(197,160,90,0.5))',
                    letterSpacing: '0.06em',
                  }}>
                    Maximum reached
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {(form.images.length > 0 || uploadingImages.length > 0) && (
                <div className="cl-thumb-grid">
                  {/* Uploaded images */}
                  {form.images.map(url => (
                    <div key={url} className="cl-thumb">
                      <img src={url} alt="listing photo" />
                      <button
                        type="button"
                        className="cl-thumb-remove"
                        onClick={() => removeImage(url)}
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {/* Uploading / errored */}
                  {uploadingImages.map(u => (
                    <div key={u.id} className="cl-thumb" style={{ background: 'var(--bg2, rgba(255,255,255,0.03))' }}>
                      <img src={u.preview} alt={u.name} style={{ opacity: 0.4 }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: '6px',
                      }}>
                        {u.loading ? (
                          <div style={{
                            width: '24px', height: '24px',
                            border: '2px solid rgba(197,160,90,0.25)',
                            borderTop: '2px solid #c5a05a',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                        ) : (
                          <>
                            <span style={{ fontSize: '18px' }}>⚠</span>
                            <button
                              type="button"
                              className="cl-thumb-remove"
                              style={{ position: 'relative', top: 'unset', right: 'unset' }}
                              onClick={() => removeUploading(u.id)}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Count indicator */}
              <p style={{
                fontFamily: 'var(--sans, "Poppins", sans-serif)',
                fontSize: '11px',
                color: 'var(--t3, rgba(255,255,255,0.2))',
                fontWeight: 300,
                marginTop: '1rem',
                textAlign: 'right',
                letterSpacing: '0.04em',
              }}>
                {form.images.length} / 5 photos added
              </p>

              {/* ── Video upload ── */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
                <h3 style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--t2)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                  Videos <span style={{ fontWeight: 300, fontSize: 12, color: 'var(--t3)', marginLeft: 6 }}>optional · up to 3 · MP4 / WebM / MOV · 30 MB each</span>
                </h3>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => handleVideoFiles(e.target.files)}
                />
                {/* Video upload zone */}
                <div
                  className={`cl-upload-zone${isVideoDragging ? ' dragging' : ''}`}
                  style={{ minHeight: 100, opacity: form.videos.length + uploadingVideos.filter(v => v.loading).length >= 3 ? 0.4 : 1 }}
                  onClick={() => {
                    if (form.videos.length + uploadingVideos.filter(v => v.loading).length < 3)
                      videoInputRef.current?.click()
                  }}
                  onDragOver={e => { e.preventDefault(); setIsVideoDragging(true) }}
                  onDragLeave={() => setIsVideoDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsVideoDragging(false); handleVideoFiles(e.dataTransfer.files) }}
                >
                  <i className="ti ti-video-plus" style={{ fontSize: 36, color: 'var(--t3)', display: 'block', marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 500 }}>
                    {form.videos.length + uploadingVideos.filter(v => v.loading).length >= 3 ? 'Maximum reached' : 'Add Videos'}
                  </span>
                </div>

                {/* Video list */}
                {(form.videos.length > 0 || uploadingVideos.length > 0) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {form.videos.map((url, i) => (
                      <div key={url} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                        <i className="ti ti-video" style={{ color: 'var(--gold)', fontSize: 16, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Video {i + 1}</span>
                        <button type="button" onClick={() => removeVideo(url)} style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.6)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
                      </div>
                    ))}
                    {uploadingVideos.map(v => (
                      <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: v.error ? 'rgba(226,83,107,0.07)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${v.error ? 'rgba(226,83,107,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '10px 14px' }}>
                        <i className={`ti ${v.error ? 'ti-alert-circle' : 'ti-video'}`} style={{ color: v.error ? '#e2536b' : 'var(--t3)', fontSize: 16, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, color: v.error ? '#e2536b' : 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.error ? `${v.name} — ${v.error}` : v.name}</span>
                        {v.loading ? (
                          <div style={{ width: 16, height: 16, border: '2px solid rgba(197,160,90,0.25)', borderTop: '2px solid #c5a05a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                        ) : (
                          <button type="button" onClick={() => setUploadingVideos(prev => prev.filter(u => u.id !== v.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.6)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 300, marginTop: 8, textAlign: 'right', letterSpacing: '0.04em' }}>
                  {form.videos.length} / 3 videos added
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 5: Review & Submit ─── */}
          {step === 5 && (
            <div>
              <h2 className="cl-section-heading">Review &amp; Publish</h2>

              {/* ── Tier picker ── */}
              <div style={{ marginBottom:'2rem' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--t,#ece8e1)', letterSpacing:'0.04em' }}>Choose your advertisement tier</p>
                  {wallet ? (
                    <a href="/tokens" target="_blank" rel="noopener" style={{ fontSize:12, color:'var(--gold,#c5a05a)', textDecoration:'none' }}>
                      ◈ {wallet.balance} tokens available
                    </a>
                  ) : (
                    <a href="/tokens" target="_blank" rel="noopener" style={{ fontSize:12, color:'var(--gold,#c5a05a)', textDecoration:'none' }}>Buy tokens →</a>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                  {LISTING_TIERS.map(t => {
                    const active = form.tier === t.id
                    const canAfford = !wallet || wallet.balance >= t.tokens || t.id === 'basic'
                    return (
                      <button key={t.id} type="button"
                        onClick={() => setForm(f => ({ ...f, tier: t.id }))}
                        style={{
                          background: active ? `${t.color}18` : 'var(--bg2,rgba(255,255,255,0.02))',
                          border: `0.5px solid ${active ? t.color : 'rgba(255,255,255,0.08)'}`,
                          borderRadius:12, padding:'1rem', textAlign:'left', cursor:'pointer',
                          transition:'all .15s', opacity: canAfford ? 1 : 0.45,
                        }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                          <span style={{ fontSize:13, fontWeight:600, color: active ? t.color : 'var(--t,#ece8e1)' }}>{t.label}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:t.color, background:`${t.color}18`, borderRadius:6, padding:'2px 7px' }}>
                            {t.id === 'basic' ? 'Free' : `${t.tokens} ◈`}
                          </span>
                        </div>
                        <p style={{ fontSize:11, color:'var(--t3,rgba(255,255,255,0.25))', lineHeight:1.5, marginBottom:'0.3rem' }}>{t.desc}</p>
                        <p style={{ fontSize:10, color:'var(--t3,rgba(255,255,255,0.2))' }}>{t.id === 'basic' ? 'Always on' : `${t.days} days`}</p>
                      </button>
                    )
                  })}
                </div>
                {form.tier !== 'basic' && wallet && wallet.balance < (LISTING_TIERS.find(t => t.id === form.tier)?.tokens ?? 0) && (
                  <p style={{ fontSize:12, color:'#e05a5a', marginTop:'0.5rem' }}>
                    Insufficient tokens for this tier.{' '}
                    <a href="/tokens" target="_blank" rel="noopener" style={{ color:'var(--gold,#c5a05a)' }}>Buy tokens →</a>
                  </p>
                )}
              </div>

              {/* Review card */}
              <div style={{
                background: 'var(--bg2, rgba(255,255,255,0.02))',
                border: '0.5px solid var(--b2, rgba(255,255,255,0.08))',
                borderRadius: 'var(--rl, 13px)',
                padding: '1.5rem',
                marginBottom: '2rem',
              }}>
                {/* Category badge */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'var(--gbg, rgba(197,160,90,0.08))',
                    border: '0.5px solid var(--gbrd, rgba(197,160,90,0.25))',
                    color: 'var(--gold, rgba(197,160,90,0.7))',
                    fontSize: '10px',
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {CATEGORIES.find(c => c.value === form.category)?.label || form.category}
                    {form.subcategory && ` · ${form.subcategory}`}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--serif, "Cormorant Garamond", serif)',
                  fontSize: '22px',
                  fontWeight: 400,
                  color: 'var(--t, #ece8e1)',
                  marginBottom: '0.75rem',
                  letterSpacing: '0.01em',
                }}>
                  {form.title || <span style={{ color: 'var(--t3, rgba(255,255,255,0.2))', fontStyle: 'italic' }}>No title</span>}
                </h3>

                {/* Description preview */}
                {form.description && (
                  <p style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '13px',
                    color: 'var(--t2, rgba(255,255,255,0.4))',
                    fontWeight: 300,
                    lineHeight: 1.65,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                  }}>
                    {form.description}
                  </p>
                )}

                {/* Meta row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  paddingTop: '1rem',
                  borderTop: '0.5px solid var(--b, rgba(255,255,255,0.07))',
                }}>
                  {form.city && (
                    <span style={{
                      fontFamily: 'var(--sans, "Poppins", sans-serif)',
                      fontSize: '12px',
                      color: 'var(--t2, rgba(255,255,255,0.35))',
                      fontWeight: 300,
                    }}>
                      📍 {form.city}, {form.country}
                    </span>
                  )}
                  {(form.price_from || form.price_to) && (
                    <span style={{
                      fontFamily: 'var(--sans, "Poppins", sans-serif)',
                      fontSize: '12px',
                      color: 'var(--gold, rgba(197,160,90,0.6))',
                      fontWeight: 400,
                    }}>
                      {form.price_from && form.price_to
                        ? `€${form.price_from} – €${form.price_to}`
                        : form.price_from
                        ? `from €${form.price_from}`
                        : `up to €${form.price_to}`}
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '12px',
                    color: 'var(--t3, rgba(255,255,255,0.28))',
                    fontWeight: 300,
                    textTransform: 'capitalize',
                  }}>
                    {MEET_TYPES.find(m => m.value === form.meet_type)?.label}
                  </span>
                  {form.images.length > 0 && (
                    <span style={{
                      fontFamily: 'var(--sans, "Poppins", sans-serif)',
                      fontSize: '12px',
                      color: 'var(--t3, rgba(255,255,255,0.28))',
                      fontWeight: 300,
                    }}>
                      {form.images.length} photo{form.images.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Photo strip preview */}
                {form.images.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '1rem',
                    overflowX: 'auto',
                    paddingBottom: '4px',
                  }}>
                    {form.images.map(url => (
                      <img
                        key={url}
                        src={url}
                        alt=""
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '0.5px solid var(--b2, rgba(255,255,255,0.1))',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Admin toggles — only for admins */}
              {profile?.role === 'admin' && (
                <div style={{
                  background: 'var(--gbg, rgba(197,160,90,0.04))',
                  border: '0.5px solid var(--gbrd, rgba(197,160,90,0.18))',
                  borderRadius: 'var(--r, 8px)',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                }}>
                  <p style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--gold, rgba(197,160,90,0.5))',
                    fontWeight: 600,
                    marginBottom: '1rem',
                  }}>
                    Admin flags
                  </p>
                  <p style={{
                    fontFamily: 'var(--sans, "Poppins", sans-serif)',
                    fontSize: '12px',
                    color: 'var(--t3, rgba(255,255,255,0.25))',
                    fontWeight: 300,
                  }}>
                    Verified, Premium and Trending flags can be toggled from the admin panel after publishing.
                  </p>
                </div>
              )}

              {error && (
                <div style={{
                  background: 'var(--pbg, rgba(184,77,114,0.08))',
                  border: '0.5px solid rgba(184,77,114,0.3)',
                  borderRadius: 'var(--r, 8px)',
                  padding: '12px 16px',
                  marginBottom: '1.25rem',
                  fontFamily: 'var(--sans, "Poppins", sans-serif)',
                  fontSize: '13px',
                  color: 'var(--pink, #d45f72)',
                  fontWeight: 400,
                }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div style={{
            display: 'flex',
            justifyContent: step === 1 ? 'flex-end' : 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '0.5px solid var(--b, rgba(255,255,255,0.06))',
          }}>
            {step > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  className="cl-btn-ghost"
                  onClick={() => { setError(''); setStep(s => s - 1) }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontFamily: 'var(--sans, "Poppins", sans-serif)', fontSize: '12px', fontWeight: 300,
                    color: draftSaved ? 'var(--gold, #c5a05a)' : 'var(--t3, rgba(255,255,255,0.22))',
                    letterSpacing: '0.04em', transition: 'color 0.2s',
                  }}
                >
                  {draftSaved ? 'Saved ✓' : 'Save progress'}
                </button>
              </div>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className="cl-btn-gold"
                disabled={!canAdvance()}
                onClick={() => { setError(''); setStep(s => s + 1) }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="cl-btn-gold"
                disabled={loading || !canAdvance()}
                onClick={handleSubmit}
                style={{ minWidth: '160px' }}
              >
                {loading ? 'Publishing…' : 'Publish listing'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Sticky footer (Save draft / Publish) ── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem 1.5rem',
        background: 'linear-gradient(0deg, var(--bg, #050505) 60%, transparent 100%)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        zIndex: 50,
        pointerEvents: 'none',
      }}>
        <button
          type="button"
          className="cl-btn-ghost"
          style={{ pointerEvents: 'auto' }}
          onClick={saveDraft}
        >
          {draftSaved ? 'Saved ✓' : 'Save draft'}
        </button>
        {step === TOTAL_STEPS && (
          <button
            type="button"
            className="cl-btn-gold"
            disabled={loading || !canAdvance()}
            onClick={handleSubmit}
            style={{ pointerEvents: 'auto', minWidth: '140px' }}
          >
            {loading ? 'Publishing…' : 'Publish listing'}
          </button>
        )}
      </div>
    </>
  )
}
