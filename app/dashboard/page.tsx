'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { signOut } from '../lib/auth'
import { createClient } from '../lib/supabase'
import PhoneVerify from '../components/PhoneVerify/PhoneVerify'
import { ETHNICITIES, ETHNIC_VALUES, HAIR_COLOURS, HAIR_VALUES, BUILDS as CANONICAL_BUILDS, BUILD_VALUES } from '../lib/attributes'
import { focusPosition, detectFocalPoint, imageFromFile } from '../lib/imageFocus'

/* ── Country list (ISO 3166-1 alpha-2) for privacy / geo-blocking ── */
const COUNTRIES = [
  {code:'AF',name:'Afghanistan'},{code:'AL',name:'Albania'},{code:'DZ',name:'Algeria'},{code:'AD',name:'Andorra'},
  {code:'AO',name:'Angola'},{code:'AG',name:'Antigua and Barbuda'},{code:'AR',name:'Argentina'},{code:'AM',name:'Armenia'},
  {code:'AU',name:'Australia'},{code:'AT',name:'Austria'},{code:'AZ',name:'Azerbaijan'},{code:'BS',name:'Bahamas'},
  {code:'BH',name:'Bahrain'},{code:'BD',name:'Bangladesh'},{code:'BB',name:'Barbados'},{code:'BY',name:'Belarus'},
  {code:'BE',name:'Belgium'},{code:'BZ',name:'Belize'},{code:'BJ',name:'Benin'},{code:'BT',name:'Bhutan'},
  {code:'BO',name:'Bolivia'},{code:'BA',name:'Bosnia and Herzegovina'},{code:'BW',name:'Botswana'},{code:'BR',name:'Brazil'},
  {code:'BN',name:'Brunei'},{code:'BG',name:'Bulgaria'},{code:'BF',name:'Burkina Faso'},{code:'BI',name:'Burundi'},
  {code:'CV',name:'Cabo Verde'},{code:'KH',name:'Cambodia'},{code:'CM',name:'Cameroon'},{code:'CA',name:'Canada'},
  {code:'CF',name:'Central African Republic'},{code:'TD',name:'Chad'},{code:'CL',name:'Chile'},{code:'CN',name:'China'},
  {code:'CO',name:'Colombia'},{code:'KM',name:'Comoros'},{code:'CG',name:'Congo'},{code:'CD',name:'Congo (DRC)'},
  {code:'CR',name:'Costa Rica'},{code:'HR',name:'Croatia'},{code:'CU',name:'Cuba'},{code:'CY',name:'Cyprus'},
  {code:'CZ',name:'Czech Republic'},{code:'DK',name:'Denmark'},{code:'DJ',name:'Djibouti'},{code:'DM',name:'Dominica'},
  {code:'DO',name:'Dominican Republic'},{code:'EC',name:'Ecuador'},{code:'EG',name:'Egypt'},{code:'SV',name:'El Salvador'},
  {code:'GQ',name:'Equatorial Guinea'},{code:'ER',name:'Eritrea'},{code:'EE',name:'Estonia'},{code:'SZ',name:'Eswatini'},
  {code:'ET',name:'Ethiopia'},{code:'FJ',name:'Fiji'},{code:'FI',name:'Finland'},{code:'FR',name:'France'},
  {code:'GA',name:'Gabon'},{code:'GM',name:'Gambia'},{code:'GE',name:'Georgia'},{code:'DE',name:'Germany'},
  {code:'GH',name:'Ghana'},{code:'GR',name:'Greece'},{code:'GD',name:'Grenada'},{code:'GT',name:'Guatemala'},
  {code:'GN',name:'Guinea'},{code:'GW',name:'Guinea-Bissau'},{code:'GY',name:'Guyana'},{code:'HT',name:'Haiti'},
  {code:'HN',name:'Honduras'},{code:'HU',name:'Hungary'},{code:'IS',name:'Iceland'},{code:'IN',name:'India'},
  {code:'ID',name:'Indonesia'},{code:'IR',name:'Iran'},{code:'IQ',name:'Iraq'},{code:'IE',name:'Ireland'},
  {code:'IL',name:'Israel'},{code:'IT',name:'Italy'},{code:'JM',name:'Jamaica'},{code:'JP',name:'Japan'},
  {code:'JO',name:'Jordan'},{code:'KZ',name:'Kazakhstan'},{code:'KE',name:'Kenya'},{code:'KI',name:'Kiribati'},
  {code:'KW',name:'Kuwait'},{code:'KG',name:'Kyrgyzstan'},{code:'LA',name:'Laos'},{code:'LV',name:'Latvia'},
  {code:'LB',name:'Lebanon'},{code:'LS',name:'Lesotho'},{code:'LR',name:'Liberia'},{code:'LY',name:'Libya'},
  {code:'LI',name:'Liechtenstein'},{code:'LT',name:'Lithuania'},{code:'LU',name:'Luxembourg'},{code:'MG',name:'Madagascar'},
  {code:'MW',name:'Malawi'},{code:'MY',name:'Malaysia'},{code:'MV',name:'Maldives'},{code:'ML',name:'Mali'},
  {code:'MT',name:'Malta'},{code:'MH',name:'Marshall Islands'},{code:'MR',name:'Mauritania'},{code:'MU',name:'Mauritius'},
  {code:'MX',name:'Mexico'},{code:'FM',name:'Micronesia'},{code:'MD',name:'Moldova'},{code:'MC',name:'Monaco'},
  {code:'MN',name:'Mongolia'},{code:'ME',name:'Montenegro'},{code:'MA',name:'Morocco'},{code:'MZ',name:'Mozambique'},
  {code:'MM',name:'Myanmar'},{code:'NA',name:'Namibia'},{code:'NR',name:'Nauru'},{code:'NP',name:'Nepal'},
  {code:'NL',name:'Netherlands'},{code:'NZ',name:'New Zealand'},{code:'NI',name:'Nicaragua'},{code:'NE',name:'Niger'},
  {code:'NG',name:'Nigeria'},{code:'NO',name:'Norway'},{code:'OM',name:'Oman'},{code:'PK',name:'Pakistan'},
  {code:'PW',name:'Palau'},{code:'PA',name:'Panama'},{code:'PG',name:'Papua New Guinea'},{code:'PY',name:'Paraguay'},
  {code:'PE',name:'Peru'},{code:'PH',name:'Philippines'},{code:'PL',name:'Poland'},{code:'PT',name:'Portugal'},
  {code:'QA',name:'Qatar'},{code:'RO',name:'Romania'},{code:'RU',name:'Russia'},{code:'RW',name:'Rwanda'},
  {code:'KN',name:'Saint Kitts and Nevis'},{code:'LC',name:'Saint Lucia'},{code:'VC',name:'Saint Vincent and the Grenadines'},
  {code:'WS',name:'Samoa'},{code:'SM',name:'San Marino'},{code:'ST',name:'Sao Tome and Principe'},{code:'SA',name:'Saudi Arabia'},
  {code:'SN',name:'Senegal'},{code:'RS',name:'Serbia'},{code:'SC',name:'Seychelles'},{code:'SL',name:'Sierra Leone'},
  {code:'SG',name:'Singapore'},{code:'SK',name:'Slovakia'},{code:'SI',name:'Slovenia'},{code:'SB',name:'Solomon Islands'},
  {code:'SO',name:'Somalia'},{code:'ZA',name:'South Africa'},{code:'SS',name:'South Sudan'},{code:'ES',name:'Spain'},
  {code:'LK',name:'Sri Lanka'},{code:'SD',name:'Sudan'},{code:'SR',name:'Suriname'},{code:'SE',name:'Sweden'},
  {code:'CH',name:'Switzerland'},{code:'SY',name:'Syria'},{code:'TW',name:'Taiwan'},{code:'TJ',name:'Tajikistan'},
  {code:'TZ',name:'Tanzania'},{code:'TH',name:'Thailand'},{code:'TL',name:'Timor-Leste'},{code:'TG',name:'Togo'},
  {code:'TO',name:'Tonga'},{code:'TT',name:'Trinidad and Tobago'},{code:'TN',name:'Tunisia'},{code:'TR',name:'Turkey'},
  {code:'TM',name:'Turkmenistan'},{code:'TV',name:'Tuvalu'},{code:'UG',name:'Uganda'},{code:'UA',name:'Ukraine'},
  {code:'AE',name:'United Arab Emirates'},{code:'GB',name:'United Kingdom'},{code:'US',name:'United States'},
  {code:'UY',name:'Uruguay'},{code:'UZ',name:'Uzbekistan'},{code:'VU',name:'Vanuatu'},{code:'VE',name:'Venezuela'},
  {code:'VN',name:'Vietnam'},{code:'YE',name:'Yemen'},{code:'ZM',name:'Zambia'},{code:'ZW',name:'Zimbabwe'},
]

/* ── Listing edit constants ── */
const ESCORT_TYPES_OPT = ['Women','Men','Trans Woman','Trans Man','Non-Binary','Couples','Fetish']
const ORIENTATION_OPT  = ['Straight','Gay','Bisexual','For All']
const ETHNICITY_OPT    = ETHNICITIES
const HAIR_OPT         = HAIR_COLOURS
const BUILD_OPT        = CANONICAL_BUILDS
const NATIONALITY_OPT  = ['Belgian','Dutch','German','French','Spanish','Italian','British','American','Brazilian','Colombian','Czech','Polish','Romanian','Ukrainian','Russian','Other']
const LANGUAGE_OPT     = ['English','French','Dutch','German','Spanish','Italian','Portuguese','Arabic','Russian','Polish','Czech']
const ESCORT_SVCS      = ['69','Anal','BDSM','Body Massage','Couples','Cum on Body','Cum on Face','Deep Throat','Doggy Style','Domina','Duo','Erotic Massage','Facesitting','Fetish','Foot Worship','French Kissing','GFE','Golden Shower','Handjob','Kissing','Lap Dance','Massage','Mistress','Oral','Prostate Massage','Rimming','Roleplay','Spanking','Squirting','Strap-on','Striptease','Tantra','Thai Massage','Threesome','Toys']
const MASSAGE_SVCS     = ESCORT_SVCS
const ESCORT_CATS      = new Set(['escorts','companionship','massage','domination','experiences','adult'])
const WH_DAYS          = ['mon','tue','wed','thu','fri','sat','sun']
const WH_DAY_LABELS    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function getServiceOptions(category: string): string[] {
  if (category === 'massage') return MASSAGE_SVCS
  return ESCORT_SVCS
}

function parseListingTags(tags: string[] | null | undefined) {
  const res: any = {
    age: '', height: '', weight: '',
    nationality: '', ethnicity: '', hair: '', build: '',
    escort_type: '', orientation: '',
    languages: [] as string[], services: [] as string[],
    wh_mon: '10-22', wh_tue: '10-22', wh_wed: '10-22',
    wh_thu: '10-22', wh_fri: '10-22', wh_sat: 'off', wh_sun: 'off',
  }
  if (!tags) return res
  const HAIR_V = HAIR_VALUES
  const BUILD_V = BUILD_VALUES
  const ETHNIC_V = ETHNIC_VALUES
  const NAT_V = ['belgian','dutch','german','french','spanish','italian','british','american','brazilian','colombian','czech','polish','romanian','ukrainian','russian']
  const LANG_V = ['english','french','dutch','german','spanish','italian','portuguese','arabic','russian','polish','czech']
  for (const tag of tags) {
    const l = tag.toLowerCase().trim()
    if (l.startsWith('type:'))        { res.escort_type = l.slice(5).trim(); continue }
    if (l.startsWith('orientation:')) { res.orientation = l.slice(12).trim(); continue }
    if (l.startsWith('wh:')) {
      const p = l.split(':')
      if (p.length === 3 && WH_DAYS.includes(p[1])) { res[`wh_${p[1]}`] = p[2] }
      continue
    }
    const m = tag.match(/^(ethnicity|build|hair|nationality):\s*(.+)$/i)
    if (m) { res[m[1].toLowerCase()] = m[2].toLowerCase().trim(); continue }
    const hm = l.match(/^(\d{3})\s*cm$/i); if (hm) { res.height = hm[1]; continue }
    const wm = l.match(/^(\d{2,3})\s*kg$/i); if (wm) { res.weight = wm[1]; continue }
    const am = l.match(/^(\d{2})$/); if (am) { res.age = am[1]; continue }
    if (HAIR_V.has(l))  { res.hair = l; continue }
    if (BUILD_V.has(l)) { res.build = l; continue }
    if (ETHNIC_V.has(l)) { res.ethnicity = l; continue }
    if (NAT_V.includes(l))   { res.nationality = l; continue }
    if (LANG_V.includes(l))  { res.languages.push(l); continue }
    res.services.push(tag)
  }
  return res
}

function buildTagsFromDraft(draft: any): string[] {
  const tags: string[] = []
  if (draft.escort_type) tags.push(`type:${draft.escort_type.toLowerCase()}`)
  if (draft.orientation) tags.push(`orientation:${draft.orientation.toLowerCase()}`)
  if (draft.height) tags.push(`${draft.height} cm`)
  if (draft.weight) tags.push(`${draft.weight} kg`)
  if (draft.age) tags.push(String(draft.age))
  if (draft.hair) tags.push(draft.hair.toLowerCase())
  if (draft.build) tags.push(draft.build.toLowerCase())
  if (draft.ethnicity) tags.push(draft.ethnicity.toLowerCase())
  if (draft.nationality) tags.push(draft.nationality.toLowerCase())
  for (const lang of (draft.languages || [])) tags.push(lang.toLowerCase())
  for (const svc of (draft.services || [])) tags.push(svc)
  for (const day of WH_DAYS) {
    const val = draft[`wh_${day}`]
    if (val) tags.push(`wh:${day}:${val}`)
  }
  return tags
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: active ? '#3ecf8e' : 'rgba(255,255,255,0.2)',
      boxShadow: active ? '0 0 6px rgba(62,207,142,0.5)' : 'none',
      flexShrink: 0,
    }} />
  )
}

function BookingBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    pending:   { bg: 'rgba(245,168,38,0.1)',  color: '#f5a826', border: 'rgba(245,168,38,0.3)',  label: 'Pending'   },
    confirmed: { bg: 'rgba(62,207,142,0.1)',  color: '#3ecf8e', border: 'rgba(62,207,142,0.3)',  label: 'Confirmed' },
    cancelled: { bg: 'rgba(212,95,114,0.1)',  color: '#d45f72', border: 'rgba(212,95,114,0.3)',  label: 'Cancelled' },
  }
  const s = map[status?.toLowerCase()] ?? map['pending']
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '3px 10px',
      borderRadius: '20px',
      background: s.bg,
      color: s.color,
      border: `0.5px solid ${s.border}`,
      fontFamily: 'var(--sans)',
    }}>
      {s.label}
    </span>
  )
}

function TrendIcon({ up }: { up?: boolean }) {
  if (up === undefined) return null
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
      {up ? (
        <path d="M2 9l3.5-3.5L8 8l3.5-3.5" stroke="#3ecf8e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M2 3l3.5 3.5L8 4l3.5 3.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  )
}

export default function DashboardPage() {
  const [user, setUser]             = useState<any>(null)
  const [profile, setProfile]       = useState<any>(null)
  const [listings, setListings]     = useState<any[]>([])
  const [bookings, setBookings]     = useState<any[]>([])
  const [favorites, setFavorites]   = useState<any[]>([])
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})
  const [loading, setLoading]       = useState(true)
  const [idVerifStatus, setIdVerifStatus] = useState<'not_submitted'|'pending'|'approved'|'rejected'>('not_submitted')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft]     = useState<any>({})
  const [savingProfile, setSavingProfile]   = useState(false)
  const [editingListing, setEditingListing] = useState<any | null>(null)
  const [listingDraft, setListingDraft]     = useState<any>({})
  const [savingListing, setSavingListing]   = useState(false)
  const [boostingListing, setBoostingListing] = useState<any | null>(null)
  const [boostPlan, setBoostPlan]             = useState<'6h' | 'week' | 'month'>('6h')
  const [boostLoading, setBoostLoading]       = useState(false)
  const [notification, setNotification]       = useState<string | null>(null)
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setNotificationWithTimeout = useCallback((msg: string | null, ms = 4000) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current)
    setNotification(msg)
    if (msg) notifTimerRef.current = setTimeout(() => setNotification(null), ms)
  }, [])
  const [connectLoading, setConnectLoading]   = useState(false)
  const [connectLoginLoading, setConnectLoginLoading] = useState(false)
  const [unreadMessages, setUnreadMessages]   = useState(0)
  const [activatingListing, setActivatingListing] = useState<string | null>(null)

  // Privacy / geo-blocking state
  const [blockedCountries, setBlockedCountries] = useState<string[]>([])
  const [blockedCountryPick, setBlockedCountryPick] = useState('')
  const [savingBlocked, setSavingBlocked] = useState(false)

  // Photo editor state
  const [photoEditing, setPhotoEditing] = useState<{ imgIdx: number; url: string } | null>(null)
  const [photoZoom, setPhotoZoom]       = useState(1)
  const [photoRotate, setPhotoRotate]   = useState(0)
  const [photoPanX, setPhotoPanX]       = useState(0)
  const [photoPanY, setPhotoPanY]       = useState(0)
  const [photoSaving, setPhotoSaving]   = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  // Thumbnail focal-point picker state
  const [focusEditing, setFocusEditing] = useState<{ url: string } | null>(null)
  const [focusXY, setFocusXY] = useState<{ x: number; y: number }>({ x: 50, y: 20 })
  const previewCanvasRef  = useRef<HTMLCanvasElement | null>(null)
  const photoImgRef       = useRef<HTMLImageElement | null>(null)
  const photoDragRef      = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null)
  const photoFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/login'
        return
      }

      setUser(session.user)

      const [{ data: profile }, { data: listings }, { data: bookings }, { data: idVerif }, { data: favData }, { count: unreadCount }, { data: walletData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('listings').select('*').eq('profile_id', session.user.id),
        supabase.from('bookings').select('*, listing:listings(title,category)').or(`client_id.eq.${session.user.id},provider_id.eq.${session.user.id}`).order('created_at', { ascending: false }).limit(20),
        supabase.from('identity_verifications').select('status').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('favorites').select('listing_id, listings(id,title,category,city,country,price_from,images,image_focus,active,tier)').eq('user_id', session.user.id),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', session.user.id).eq('read', false),
        supabase.from('user_wallets').select('balance').eq('user_id', session.user.id).maybeSingle(),
      ])
      if (idVerif?.status) setIdVerifStatus(idVerif.status as any)
      setUnreadMessages(unreadCount || 0)

      setProfile(profile)
      setBlockedCountries(profile?.blocked_countries || [])
      setListings(listings || [])
      setBookings(bookings || [])
      setFavorites((favData || []).map((f: any) => f.listings).filter(Boolean))
      if (walletData?.balance != null) setTokenBalance(walletData.balance)

      // Fetch view counts for all listings (secondary query)
      const listingIds = (listings || []).map((l: any) => l.id)
      if (listingIds.length > 0) {
        const { data: views } = await supabase.from('listing_views').select('listing_id').in('listing_id', listingIds)
        const counts: Record<string, number> = {}
        for (const v of (views || [])) { counts[v.listing_id] = (counts[v.listing_id] || 0) + 1 }
        setViewCounts(counts)
      }
      setLoading(false)

      const params = new URLSearchParams(window.location.search)
      if (params.get('booking') === 'success') {
        setNotificationWithTimeout('Booking confirmed! Payment received.')
        window.history.replaceState({}, '', '/dashboard')
      } else if (params.get('boost') === 'success') {
        setNotificationWithTimeout('✦ Your advertisement is now featured! It will appear at the top of results.')
        window.history.replaceState({}, '', '/dashboard')
      } else if (params.get('connect') === 'success') {
        setNotificationWithTimeout('✓ Stripe payouts connected! You\'ll receive payments directly.')
        window.history.replaceState({}, '', '/dashboard')
      } else if (params.get('connect') === 'refresh') {
        // Re-trigger onboarding if the link expired
        setTimeout(() => handleConnectStripe(), 500)
        window.history.replaceState({}, '', '/dashboard')
      }

      if (localStorage.getItem('sx_show_connect_prompt') === '1') {
        localStorage.removeItem('sx_show_connect_prompt')
        if (!profile?.stripe_connect_account_id) {
          setNotificationWithTimeout('🎉 Listing created! Connect Stripe to start receiving payments from bookings.')
        }
      }
    }
    load()
  }, [])

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  async function saveProfile() {
    setSavingProfile(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSavingProfile(false); return }
    const updates: any = {
      full_name: profileDraft.full_name,
      bio: profileDraft.bio,
      availability: profileDraft.availability,
      city: profileDraft.city,
      country: profileDraft.country,
      phone: profileDraft.phone,
    }
    if (profileDraft.age) updates.age = parseInt(profileDraft.age) || null
    if (profileDraft.languages) updates.languages = profileDraft.languages.split(',').map((s: string) => s.trim()).filter(Boolean)
    const { error: profileErr } = await supabase.from('profiles').update(updates).eq('id', session.user.id)
    if (profileErr) { setNotificationWithTimeout('Could not save profile — please try again.'); setSavingProfile(false); return }
    setProfile((p: any) => ({ ...p, ...updates }))
    setEditingProfile(false)
    setSavingProfile(false)
    setNotificationWithTimeout('Profile saved.')
  }

  async function saveBlockedCountries() {
    setSavingBlocked(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSavingBlocked(false); return }
    const { error } = await supabase.from('profiles').update({ blocked_countries: blockedCountries }).eq('id', session.user.id)
    setSavingBlocked(false)
    if (error) { setNotificationWithTimeout('Could not save privacy settings — please try again.'); return }
    setProfile((p: any) => ({ ...p, blocked_countries: blockedCountries }))
    setNotificationWithTimeout('Privacy settings saved.')
  }

  async function saveListing() {
    if (!editingListing) return
    setSavingListing(true)
    const supabase = createClient()
    const tags = buildTagsFromDraft(listingDraft)
    const updates: any = {
      title:       listingDraft.title,
      description: listingDraft.description,
      category:    listingDraft.category,
      city:        listingDraft.city,
      country:     listingDraft.country,
      meet_type:   listingDraft.meet_type,
      active:      listingDraft.active,
      images:         (listingDraft.images || []).filter(Boolean),
      image_focus:    pruneFocus(listingDraft.image_focus, listingDraft.images),
      tags:           tags.length > 0 ? tags : null,
      contact_phone:  listingDraft.contact_phone?.trim() || null,
      whatsapp_optin: !!listingDraft.whatsapp_optin,
    }
    if (listingDraft.price_from !== '' && listingDraft.price_from !== undefined) updates.price_from = parseFloat(listingDraft.price_from) || null
    if (listingDraft.price_to !== '' && listingDraft.price_to !== undefined) updates.price_to = parseFloat(listingDraft.price_to) || null
    const { error: listingErr } = await supabase.from('listings').update(updates).eq('id', editingListing.id)
    if (listingErr) { setNotificationWithTimeout('Could not save listing — please try again.'); setSavingListing(false); return }
    setListings((prev: any[]) => prev.map(l => l.id === editingListing.id ? { ...l, ...updates } : l))
    setEditingListing(null)
    setSavingListing(false)
    setNotificationWithTimeout('Listing saved.')
  }

  async function handleConnectStripe() {
    setConnectLoading(true)
    const res = await fetch('/api/connect/onboard', { method: 'POST' })
    const json = await res.json()
    if (json.url) { window.location.href = json.url }
    else { setConnectLoading(false) }
  }

  async function handleConnectDashboard() {
    setConnectLoginLoading(true)
    const res = await fetch('/api/connect/login', { method: 'POST' })
    const json = await res.json()
    if (json.url) { window.location.href = json.url }
    else { setConnectLoginLoading(false) }
  }

  async function startBoost() {
    if (!boostingListing) return
    setBoostLoading(true)
    if (boostPlan === '6h') {
      // Token-based flash boost — no Stripe redirect
      const res = await fetch('/api/listings/flash-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: boostingListing.id }),
      })
      const json = await res.json()
      setBoostLoading(false)
      setBoostingListing(null)
      if (json.ok) {
        setTokenBalance(b => (b ?? 0) - 20)
        setNotificationWithTimeout('✦ Flash boost active! Your advertisement is at the top for 6 hours.')
      } else {
        setNotification(json.error || 'Boost failed — check your token balance.')
      }
    } else {
      const res = await fetch('/api/featured-boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: boostingListing.id, plan: boostPlan }),
      })
      const json = await res.json()
      if (json.url) { window.location.href = json.url }
      else { setBoostLoading(false) }
    }
  }

  async function reactivateListing(listingId: string) {
    setActivatingListing(listingId)
    try {
      const res = await fetch('/api/listings/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      const json = await res.json()
      if (json.ok) {
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, active: true, status: 'approved' } : l))
        setNotificationWithTimeout('✓ Your advertisement is live again.')
      } else {
        setNotification(json.error || 'Could not set listing live.')
      }
    } catch {
      setNotificationWithTimeout('Network error — please try again.')
    } finally {
      setActivatingListing(null)
    }
  }

  // ── Photo editor helpers ──────────────────────────────────────────────

  const drawPhotoPreview = useCallback((
    canvas: HTMLCanvasElement | null,
    img: HTMLImageElement | null,
    zoom: number, rotate: number, panX: number, panY: number,
  ) => {
    if (!canvas || !img || !img.naturalWidth) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const outW = canvas.width
    const outH = canvas.height
    const panScale = outW / 300
    ctx.clearRect(0, 0, outW, outH)
    ctx.save()
    ctx.translate(outW / 2 + panX * panScale, outH / 2 + panY * panScale)
    ctx.rotate(rotate * Math.PI / 180)
    const isRotated90 = Math.round(Math.abs(rotate) / 90) % 2 !== 0
    const baseW = isRotated90 ? img.naturalHeight : img.naturalWidth
    const baseH = isRotated90 ? img.naturalWidth : img.naturalHeight
    const baseScale = Math.max(300 / baseW, 400 / baseH) * panScale
    ctx.scale(zoom * baseScale, zoom * baseScale)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    ctx.restore()
  }, [])

  // Load image when editor opens and reset transform
  useEffect(() => {
    if (!photoEditing) { photoImgRef.current = null; return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      photoImgRef.current = img
      drawPhotoPreview(previewCanvasRef.current, img, photoZoom, photoRotate, photoPanX, photoPanY)
    }
    img.src = photoEditing.url
  }, [photoEditing?.url]) // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw on transform change
  useEffect(() => {
    if (!photoEditing) return
    drawPhotoPreview(previewCanvasRef.current, photoImgRef.current, photoZoom, photoRotate, photoPanX, photoPanY)
  }, [photoZoom, photoRotate, photoPanX, photoPanY, drawPhotoPreview]) // eslint-disable-line react-hooks/exhaustive-deps

  async function applyPhotoEdit() {
    if (!photoEditing || !photoImgRef.current) return
    setPhotoSaving(true)
    try {
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = 800
      exportCanvas.height = 1067
      drawPhotoPreview(exportCanvas, photoImgRef.current, photoZoom, photoRotate, photoPanX, photoPanY)
      // Start focus detection on the canvas immediately, in parallel with toBlob+upload.
      const focusPromise = detectFocalPoint(exportCanvas).catch(() => ({ x: 50, y: 30 } as { x: number; y: number }))
      await new Promise<void>((resolve, reject) => {
        exportCanvas.toBlob(async (blob) => {
          if (!blob) { reject(new Error('toBlob returned null')); return }
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
          const fd = new FormData()
          fd.append('file', file)
          const [res, focus] = await Promise.all([
            fetch('/api/upload', { method: 'POST', body: fd }),
            focusPromise,
          ])
          const json = await res.json()
          if (json.publicUrl) {
            setListingDraft((d: any) => {
              const imgs = [...(d.images || [])]
              imgs[photoEditing.imgIdx] = json.publicUrl
              return {
                ...d,
                images: imgs,
                image_focus: { ...(d.image_focus || {}), [json.publicUrl]: focus },
              }
            })
          }
          resolve()
        }, 'image/jpeg', 0.87)
      })
    } catch {
      setNotificationWithTimeout('Could not export photo. Try re-uploading instead.')
    }
    setPhotoSaving(false)
    setPhotoEditing(null)
  }

  async function resizeImageForDashboard(file: File): Promise<File> {
    const TARGET_W = 800; const TARGET_H = 1067; const QUALITY = 0.87
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        if (img.naturalWidth <= TARGET_W && img.naturalHeight <= TARGET_H) { resolve(file); return }
        const scaleW = TARGET_W / img.naturalWidth
        const scaleH = TARGET_H / img.naturalHeight
        const scale = Math.min(scaleW, scaleH)
        const w = Math.round(img.naturalWidth * scale)
        const h = Math.round(img.naturalHeight * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file),
          'image/jpeg', QUALITY
        )
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
      img.src = url
    })
  }

  async function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    const resized = await resizeImageForDashboard(file)

    // Detect focal point from the resized file in parallel with the upload.
    const focusPromise = imageFromFile(resized)
      .then(img => detectFocalPoint(img))
      .catch(() => ({ x: 50, y: 30 } as { x: number; y: number }))

    const fd = new FormData()
    fd.append('file', resized)
    const [res, focus] = await Promise.all([
      fetch('/api/upload', { method: 'POST', body: fd }),
      focusPromise,
    ])
    const json = await res.json()
    if (json.publicUrl) {
      setListingDraft((d: any) => {
        const imgs = (d.images || []).filter(Boolean)
        return {
          ...d,
          images: [...imgs, json.publicUrl].slice(0, 5),
          image_focus: { ...(d.image_focus || {}), [json.publicUrl]: focus },
        }
      })
    } else {
      setNotification(json.error || 'Upload failed — please try again.')
    }
    setPhotoUploading(false)
    if (photoFileInputRef.current) photoFileInputRef.current.value = ''
  }

  // ── Thumbnail focal-point helpers ─────────────────────────────────────
  // Keep only focus entries whose image still exists in the listing.
  function pruneFocus(focus: any, images: any[]): Record<string, { x: number; y: number }> {
    const valid = new Set((images || []).filter(Boolean))
    const out: Record<string, { x: number; y: number }> = {}
    if (focus && typeof focus === 'object') {
      for (const url of Object.keys(focus)) {
        if (valid.has(url) && focus[url] && typeof focus[url].x === 'number') out[url] = focus[url]
      }
    }
    return out
  }

  function openFocusPicker(url: string) {
    const existing = listingDraft.image_focus?.[url]
    setFocusXY(existing && typeof existing.x === 'number' ? { x: existing.x, y: existing.y } : { x: 50, y: 20 })
    setFocusEditing({ url })
  }

  function handleFocusClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)))
    const y = Math.round(Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)))
    setFocusXY({ x, y })
  }

  function saveFocus() {
    if (!focusEditing) return
    setListingDraft((d: any) => ({
      ...d,
      image_focus: { ...(d.image_focus || {}), [focusEditing.url]: { x: focusXY.x, y: focusXY.y } },
    }))
    setFocusEditing(null)
  }

  function resetFocus() {
    if (!focusEditing) return
    setListingDraft((d: any) => {
      const next = { ...(d.image_focus || {}) }
      delete next[focusEditing.url]
      return { ...d, image_focus: next }
    })
    setFocusEditing(null)
  }

  // ── End photo editor helpers ──────────────────────────────────────────

  const displayName: string = profile?.full_name || user?.email?.split('@')[0] || 'there'
  const initials = getInitials(profile?.full_name || user?.email || '')

  if (loading) return (
    <>
      <style>{``}</style>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg, #050505)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '0.5px solid rgba(197,160,90,0.3)',
          borderTopColor: 'var(--gold, #c5a05a)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{
          color: 'var(--t3, rgba(255,255,255,0.2))',
          fontSize: '13px',
          fontFamily: 'var(--sans)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Loading
        </span>
      </div>
    </>
  )

  const activeListings = listings.filter(l => l.active).length
  const myBookings       = bookings.filter(b => b.client_id === user?.id)
  const incomingBookings = bookings.filter(b => b.provider_id === user?.id)
  const isAdvertiser = profile?.role === 'provider' || profile?.role === 'venue' || profile?.role === 'creator'

  return (
    <>
      <style>{`
        
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg, #080808); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .db-nav-btn-ghost {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          color: var(--t2, rgba(255,255,255,0.45));
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), color var(--t-base, 0.22s) var(--ease-out), background var(--t-base, 0.22s) var(--ease-out);
        }
        .db-nav-btn-ghost:hover {
          border-color: var(--b3, rgba(255,255,255,0.2));
          color: var(--t, #ece8e1);
          background: rgba(255,255,255,0.03);
        }

        .db-nav-btn-gold {
          background: var(--grad-gold, linear-gradient(135deg, #c5a05a 0%, #a0803d 100%));
          border: none;
          border-radius: var(--r, 8px);
          color: var(--t-on-gold, #080808);
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: var(--shadow-gold);
          transition: opacity var(--t-base, 0.22s) var(--ease-out), transform var(--t-fast, 0.15s) var(--ease-out);
          position: relative;
          overflow: hidden;
        }
        .db-nav-btn-gold::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 60%);
          pointer-events: none;
        }
        .db-nav-btn-gold:hover { opacity: 0.88; transform: translateY(-1px); }

        .db-stat-card {
          background: var(--bg1, #111111);
          border: 0.5px solid var(--b, rgba(255,255,255,0.08));
          border-radius: var(--rl, 13px);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), transform var(--t-base, 0.22s) var(--ease-out);
        }
        .db-stat-card:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.35));
          transform: translateY(-2px);
        }

        .db-stat-eyebrow {
          font: 600 9px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--t3, rgba(255,255,255,0.28));
          margin-bottom: 4px;
        }

        .db-stat-number {
          font-family: var(--serif);
          font-size: 32px;
          font-weight: 500;
          color: var(--gold, #c5a05a);
          line-height: 1;
          letter-spacing: -0.01em;
        }

        .db-stat-caption {
          font: 300 11px/1 var(--sans);
          color: var(--t3, rgba(255,255,255,0.25));
          letter-spacing: 0.04em;
        }

        .db-card {
          background: var(--bg1, #111111);
          border: 0.5px solid var(--b, rgba(255,255,255,0.08));
          border-radius: var(--rl, 13px);
          padding: 1.625rem;
        }

        .db-listing-item {
          background: var(--bg1, rgba(255,255,255,0.02));
          border: 0.5px solid var(--b, rgba(255,255,255,0.07));
          border-radius: var(--rl, 13px);
          padding: 1rem 1.125rem;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), background var(--t-base, 0.22s) var(--ease-out);
        }
        .db-listing-item:hover {
          border-color: var(--b3, rgba(255,255,255,0.12));
          background: var(--bg2, rgba(255,255,255,0.03));
        }
        .db-listing-top { display: flex; gap: 12px; align-items: flex-start; }
        .db-listing-info { flex: 1; min-width: 0; }
        .db-listing-title {
          font-family: var(--serif); font-size: 16px; font-weight: 400;
          color: var(--t, #ece8e1); letter-spacing: 0.01em;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          margin-bottom: 5px;
        }
        .db-listing-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .db-listing-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .db-listing-badges { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
        .db-listing-actions { display: flex; gap: 6px; align-items: center; margin-left: auto; flex-shrink: 0; }

        .db-icon-btn {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--t2, rgba(255,255,255,0.4));
          font-size: 15px;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), color var(--t-fast, 0.15s) var(--ease-out), background var(--t-fast, 0.15s) var(--ease-out);
          flex-shrink: 0;
        }
        .db-icon-btn:hover {
          border-color: var(--gold, #c5a05a);
          color: var(--gold, #c5a05a);
          background: var(--gbg, rgba(197,160,90,0.07));
        }
        .db-icon-btn.danger:hover {
          border-color: rgba(226,83,107,0.5);
          color: var(--danger, #e2536b);
          background: rgba(226,83,107,0.07);
        }

        .db-edit-btn {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          color: var(--t2, rgba(255,255,255,0.35));
          padding: 5px 12px;
          cursor: pointer;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), color var(--t-fast, 0.15s) var(--ease-out);
          white-space: nowrap;
        }
        .db-edit-btn:hover {
          border-color: var(--gbrd, rgba(197,160,90,0.35));
          color: var(--gold, #c5a05a);
        }

        .db-category-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 20px;
          background: var(--gbg, rgba(197,160,90,0.07));
          border: 0.5px solid var(--gbrd, rgba(197,160,90,0.2));
          color: var(--goldl, rgba(197,160,90,0.7));
          font: 500 11px/1 var(--sans);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .db-quick-btn-gold {
          background: var(--grad-gold, linear-gradient(135deg, #c5a05a 0%, #a0803d 100%));
          border: none;
          border-radius: var(--r, 8px);
          color: var(--t-on-gold, #080808);
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: var(--shadow-gold);
          transition: opacity var(--t-base, 0.22s) var(--ease-out), transform var(--t-fast, 0.15s) var(--ease-out);
          position: relative;
          overflow: hidden;
        }
        .db-quick-btn-gold::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .db-quick-btn-gold:hover { opacity: 0.88; transform: translateY(-1px); }

        .db-quick-btn-dark {
          background: transparent;
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          color: var(--t, #ece8e1);
          padding: 12px 20px;
          cursor: pointer;
          font: 600 13px/1 var(--sans);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: border-color var(--t-base, 0.22s) var(--ease-out), color var(--t-base, 0.22s) var(--ease-out), background var(--t-base, 0.22s) var(--ease-out);
        }
        .db-quick-btn-dark:hover {
          border-color: var(--b3, rgba(255,255,255,0.2));
          color: var(--t, #ece8e1);
          background: rgba(255,255,255,0.04);
        }

        .db-section-title {
          font-family: var(--serif);
          font-size: 26px;
          font-weight: 500;
          color: var(--t, #ece8e1);
        }

        .db-section-label {
          font: 600 9px/1 var(--sans);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--t3, rgba(255,255,255,0.22));
        }

        .db-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 14px;
          text-align: center;
        }

        .db-booking-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 1rem 1.125rem;
          background: var(--bg1, rgba(255,255,255,0.02));
          border: 0.5px solid var(--b, rgba(255,255,255,0.07));
          border-radius: var(--rl, 13px);
          transition: border-color var(--t-base, 0.22s) var(--ease-out);
        }
        .db-booking-row:hover { border-color: var(--b3, rgba(255,255,255,0.12)); }

        .db-status-pill-active {
          background: var(--tbg, rgba(38,212,160,0.1));
          color: var(--verified, #26d4a0);
          border: 0.5px solid rgba(38,212,160,0.3);
          border-radius: 20px;
          padding: 3px 10px;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .db-status-pill-paused {
          background: var(--gbg, rgba(197,160,90,0.1));
          color: var(--gold, #c5a05a);
          border: 0.5px solid rgba(197,160,90,0.3);
          border-radius: 20px;
          padding: 3px 10px;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .db-status-pill-inactive {
          background: var(--wbg, rgba(184,77,114,0.1));
          color: var(--wine, #b84d72);
          border: 0.5px solid rgba(184,77,114,0.3);
          border-radius: 20px;
          padding: 3px 10px;
          font: 600 10px/1 var(--sans);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .db-input {
          height: 44px;
          padding: 0 14px;
          background: var(--bg3, #0a0a0a);
          color: var(--t, #ece8e1);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          font: 400 14px/1 var(--sans);
          width: 100%;
          outline: none;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), box-shadow var(--t-fast, 0.15s) var(--ease-out);
        }
        .db-input:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }

        .db-textarea {
          padding: 10px 14px;
          background: var(--bg3, #0a0a0a);
          color: var(--t, #ece8e1);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          font: 400 14px/1.5 var(--sans);
          width: 100%;
          outline: none;
          resize: vertical;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), box-shadow var(--t-fast, 0.15s) var(--ease-out);
        }
        .db-textarea:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }

        .db-select {
          height: 44px;
          padding: 0 14px;
          background: var(--bg3, #0a0a0a);
          color: var(--t, #ece8e1);
          border: 0.5px solid var(--b2, rgba(255,255,255,0.1));
          border-radius: var(--r, 8px);
          font: 400 14px/1 var(--sans);
          width: 100%;
          outline: none;
          cursor: pointer;
          transition: border-color var(--t-fast, 0.15s) var(--ease-out), box-shadow var(--t-fast, 0.15s) var(--ease-out);
        }
        .db-select:focus {
          border-color: var(--gold, #c5a05a);
          box-shadow: 0 0 0 3px var(--gbg, rgba(197,160,90,0.12));
        }

        .db-chip-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .db-chip {
          padding: 5px 12px; border-radius: 20px; font: 500 12px/1 var(--sans);
          letter-spacing: 0.04em; cursor: pointer; border: 0.5px solid var(--b2, rgba(255,255,255,0.12));
          background: transparent; color: var(--t2, rgba(255,255,255,0.4));
          transition: all 0.15s; white-space: nowrap;
        }
        .db-chip:hover { border-color: var(--gbrd); color: var(--gold); }
        .db-chip.selected { border-color: var(--gbrd, rgba(197,160,90,0.5)); background: var(--gbg, rgba(197,160,90,0.1)); color: var(--gold, #c5a05a); }
        .db-wh-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .db-wh-day { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .db-wh-label { font: 600 10px/1 var(--sans); color: var(--t3); letter-spacing: 0.06em; text-align: center; }
        .db-wh-toggle { width: 36px; height: 36px; border-radius: 50%; border: 0.5px solid; cursor: pointer; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .db-wh-toggle.on  { background: rgba(26,143,106,0.15); border-color: rgba(26,143,106,0.4); color: #26d4a0; }
        .db-wh-toggle.off { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.2); }
        .db-wh-time { width: 100%; font: 400 10px/1 var(--sans); background: var(--bg3); border: 0.5px solid var(--b2); border-radius: 5px; color: var(--t2); text-align: center; padding: 3px 4px; outline: none; }
        .db-form-section { margin-bottom: 1.5rem; }
        .db-form-section-title { font: 600 9px/1 var(--sans); letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold, #c5a05a); margin-bottom: 1rem; padding-bottom: 6px; border-bottom: 0.5px solid rgba(197,160,90,0.15); }
        .db-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .db-form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .db-photo-url { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .db-photo-url input { flex: 1; }
        .db-photo-num { font: 600 10px/1 var(--sans); color: var(--t3); min-width: 14px; text-align: right; }

        .db-photo-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px; }
        @media (max-width: 480px) { .db-photo-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

        .db-photo-thumb {
          position: relative; border-radius: 8px; overflow: hidden;
          background: #111; border: 0.5px solid rgba(255,255,255,0.08);
          display: flex; flex-direction: column;
        }
        .db-photo-thumb-img-wrap { position: relative; aspect-ratio: 3/4; flex-shrink: 0; }
        .db-photo-thumb img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; display: block; }
        .db-photo-thumb-add {
          aspect-ratio: 3/4; border-radius: 8px; border: 0.5px dashed rgba(197,160,90,0.3);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
          cursor: pointer; background: rgba(197,160,90,0.03); transition: all 0.15s;
        }
        .db-photo-thumb-add:hover { border-color: rgba(197,160,90,0.6); background: rgba(197,160,90,0.07); }

        .db-photo-actions {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.82));
          display: flex; justify-content: center; gap: 3px; padding: 14px 4px 5px;
        }
        .db-photo-act-btn {
          width: 24px; height: 24px; border-radius: 5px; border: 0.5px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.55); color: rgba(255,255,255,0.75); cursor: pointer;
          font-size: 12px; display: flex; align-items: center; justify-content: center;
          transition: border-color 0.12s, color 0.12s, background 0.12s; flex-shrink: 0;
        }
        .db-photo-act-btn:hover { border-color: var(--gold); color: var(--gold); background: rgba(0,0,0,0.75); }
        .db-photo-act-btn.danger:hover { border-color: #e2536b; color: #e2536b; }
        .db-photo-order-badge {
          position: absolute; top: 4px; left: 4px; background: rgba(0,0,0,0.65); border-radius: 4px;
          padding: 2px 5px; font: 600 9px/1 var(--sans); color: rgba(255,255,255,0.5); letter-spacing: 0.06em;
        }
        @media (max-width: 480px) {
          .db-photo-actions {
            position: static; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            padding: 6px 4px; gap: 4px; border-top: 0.5px solid rgba(255,255,255,0.08);
          }
          .db-photo-act-btn {
            width: 100%; height: 40px; border-radius: 6px; font-size: 15px; flex: 1;
            border-color: rgba(255,255,255,0.12);
          }
          .db-photo-act-btn.danger { border-color: rgba(226,83,107,0.3); color: #e2536b; }
        }

        .db-pe-modal {
          position: fixed; inset: 0; z-index: 1100;
          background: rgba(0,0,0,0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .db-pe-panel {
          background: #0d0d0d; border: 0.5px solid rgba(197,160,90,0.3); border-radius: 18px;
          padding: 1.5rem; width: 100%; max-width: 380px; box-shadow: 0 32px 96px rgba(0,0,0,0.8);
        }
        .db-pe-canvas {
          display: block; border-radius: 10px; overflow: hidden;
          cursor: grab; touch-action: none; user-select: none;
          border: 0.5px solid rgba(255,255,255,0.07);
          background: #000; width: 100%; aspect-ratio: 3/4;
          max-height: 55vh; object-fit: contain;
        }
        .db-pe-canvas:active { cursor: grabbing; }
        .db-pe-slider { width: 100%; accent-color: var(--gold, #c5a05a); height: 4px; cursor: pointer; }
        .db-pe-rotate-btn {
          flex: 1; padding: 8px 0; background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1); border-radius: 8px;
          color: rgba(255,255,255,0.55); cursor: pointer; font-size: 16px;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .db-pe-rotate-btn:hover { border-color: var(--gold); color: var(--gold); background: rgba(197,160,90,0.07); }

        @media (max-width: 640px) {
          .db-stats-grid { grid-template-columns: 1fr !important; }
          .db-quick-actions { flex-direction: column !important; }
          .db-quick-actions button { width: 100%; }
          .db-nav-right { gap: 6px !important; }
          .db-create-btn-label { display: none; }
          .db-form-row, .db-form-row-3 { grid-template-columns: 1fr; }
          .db-wh-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg, #080808)', color: 'var(--t, #ece8e1)' }}>

        {/* ── Notification banner ── */}
        {notification && (
          <div style={{
            background: 'var(--gbg, rgba(197,160,90,0.1))',
            border: '0.5px solid var(--gbrd, rgba(197,160,90,0.3))',
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            padding: '12px 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--gold, #c5a05a)', fontFamily: 'var(--sans)' }}>{notification}</span>
            <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'var(--gold, #c5a05a)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav style={{
          background: 'rgba(10,10,10,0.95)',
          borderBottom: '0.5px solid var(--b, rgba(255,255,255,0.07))',
          padding: '0 2rem',
          height: '60px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          {/* Wordmark */}
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: '20px',
              fontWeight: 400,
              color: 'var(--gold, #c5a05a)',
              letterSpacing: '0.04em',
            }}>
              Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em>
            </span>
          </a>

          {/* Right side */}
          <div className="db-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Admin panel link */}
            {profile?.role === 'admin' && (
              <a
                href="/admin"
                style={{
                  color: 'var(--gold, rgba(197,160,90,0.65))',
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'var(--sans)',
                  fontWeight: 600,
                  padding: '3px 10px',
                  background: 'var(--gbg, rgba(197,160,90,0.1))',
                  border: '0.5px solid var(--gbrd, rgba(197,160,90,0.3))',
                  borderRadius: '20px',
                  transition: 'opacity 0.2s',
                }}
              >
                Admin
              </a>
            )}

            {/* Create listing */}
            <button
              className="db-nav-btn-gold"
              onClick={() => window.location.href = '/listings/create'}
            >
              <span>+ </span>
              <span className="db-create-btn-label">Create listing</span>
            </button>

            {/* Avatar initials */}
            <div
              title={displayName}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(197,160,90,0.2), rgba(197,160,90,0.08))',
                border: '0.5px solid var(--gbrd, rgba(197,160,90,0.35))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'default',
              }}
            >
              <span style={{
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--gold, #c5a05a)',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}>
                {initials}
              </span>
            </div>

            {/* Sign out */}
            <button className="db-nav-btn-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </nav>

        {/* ── Page content ── */}
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '3rem 1.5rem 5rem',
          animation: 'fadeUp 0.4s ease',
        }}>

          {/* ── Hero greeting ── */}
          <div style={{ marginBottom: '3rem' }}>
            <h1 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 300,
              color: 'var(--t, #ece8e1)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              marginBottom: '10px',
            }}>
              {getGreeting()},{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ color: 'var(--gold, #c5a05a)' }}>{displayName.split(' ')[0]}</span>
                <span style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: 0,
                  right: 0,
                  height: '0.5px',
                  background: 'linear-gradient(90deg, rgba(197,160,90,0.7), rgba(197,160,90,0.1))',
                }} />
              </span>
            </h1>
            <p style={{
              color: 'var(--t3, rgba(255,255,255,0.28))',
              fontSize: '13px',
              fontWeight: 300,
              letterSpacing: '0.04em',
              fontFamily: 'var(--sans)',
            }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {profile?.role && (
                <>
                  {' · '}
                  <span style={{ textTransform: 'capitalize' }}>{profile.role}</span>
                  {profile?.verified && (
                    <span style={{ marginLeft: '8px', color: 'var(--verified, #3ecf8e)', fontSize: '13px' }}>✓ Verified</span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* ── Stats row ── */}
          <div
            className="db-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            {[
              { label: 'Listings',  value: listings.length,         sub: `${activeListings} active`,         up: activeListings > 0 },
              { label: 'Bookings',  value: bookings.length,         sub: 'total bookings',                   up: bookings.length > 0 },
              { label: 'Messages',  value: unreadMessages,           sub: 'unread',                           up: unreadMessages > 0 },
              { label: 'Tokens',    value: tokenBalance ?? '—',      sub: 'wallet balance',                   up: (tokenBalance ?? 0) > 0 },
            ].map(stat => (
              <div key={stat.label} className="db-stat-card">
                <div className="db-stat-eyebrow">{stat.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="db-stat-number">
                    {stat.value}
                  </span>
                  <TrendIcon up={stat.up} />
                </div>
                <div className="db-stat-caption">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── Profile Completeness ── */}
          {(() => {
            const fields = [
              { label: 'Name',         done: !!profile?.full_name },
              { label: 'Bio',          done: !!profile?.bio && profile.bio.length > 20 },
              { label: 'City',         done: !!profile?.city },
              { label: 'Languages',    done: Array.isArray(profile?.languages) && profile.languages.length > 0 },
              { label: 'Listing',      done: listings.length > 0 },
              { label: 'Identity verified', done: idVerifStatus === 'approved' },
              { label: 'Stripe connected', done: !!profile?.stripe_connect_account_id },
            ]
            const done = fields.filter(f => f.done).length
            const pct  = Math.round((done / fields.length) * 100)
            if (pct === 100) return null
            const missing = fields.filter(f => !f.done)
            return (
              <div className="db-card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg,rgba(197,160,90,0.04),transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t)', marginBottom: 3 }}>Profile {pct}% complete</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>Complete your profile to attract more clients</div>
                  </div>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--gold)', fontWeight: 400 }}>{pct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden', marginBottom: '0.875rem' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--gold),#e8c97e)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {missing.map(f => (
                    <span key={f.label} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg2)', border: '0.5px solid var(--b)', color: 'var(--t3)', fontFamily: 'var(--sans)' }}>
                      + {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ── Identity Verification Card ── */}
          {(() => {
            const cfg = {
              not_submitted: { icon: 'ti-id',           color: 'var(--gold,#c5a05a)',    bg: 'rgba(197,160,90,0.08)',   border: 'var(--gbrd,rgba(197,160,90,0.25))', label: 'Verify your identity',   sub: 'Submit your ID to unlock advertisement. Required before you can publish.', btn: 'Start verification →', btnStyle: 'db-quick-btn-gold' },
              pending:       { icon: 'ti-clock',         color: 'rgba(245,168,38,0.9)',  bg: 'rgba(245,168,38,0.08)',   border: 'rgba(245,168,38,0.3)',              label: 'Verification under review', sub: 'We\'re reviewing your documents. Usually within 24–48 hours.',       btn: null,                   btnStyle: '' },
              approved:      { icon: 'ti-shield-check',  color: 'var(--verified,#3ecf8e)', bg: 'rgba(62,207,142,0.08)', border: 'rgba(62,207,142,0.2)',              label: 'Identity verified ✓',    sub: 'Your identity is confirmed. You can publish listings.',               btn: null,                   btnStyle: '' },
              rejected:      { icon: 'ti-shield-x',      color: '#e05a5a',               bg: 'rgba(224,90,90,0.08)',    border: 'rgba(224,90,90,0.25)',              label: 'Verification rejected',  sub: 'Your submission was rejected. Please re-submit with clearer documents.', btn: 'Re-submit →',         btnStyle: 'db-quick-btn-gold' },
            }[idVerifStatus]
            return (
              <div className="db-card" style={{ marginBottom: '1.5rem', border: `0.5px solid ${cfg.border}` }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <i className={`ti ${cfg.icon}`} style={{ color:cfg.color, fontSize:'20px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:'15px', fontWeight:500, color:'var(--t,#ece8e1)', marginBottom:'3px' }}>{cfg.label}</div>
                      <div style={{ fontSize:'12px', color:'var(--t2,#8c8880)', lineHeight:1.4 }}>{cfg.sub}</div>
                    </div>
                  </div>
                  {cfg.btn && (
                    <button className={cfg.btnStyle} onClick={() => window.location.href = '/verify'}>
                      {cfg.btn}
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Phone verification temporarily disabled */}

          {/* ── Role Selector (members only) — 'client' is the legacy member value */}
          {(profile?.role === 'user' || profile?.role === 'client') && (
            <div className="db-card" style={{ marginBottom: '1.5rem', border: '0.5px solid var(--gbrd, rgba(197,160,90,0.25))' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t)', marginBottom: '4px' }}>How do you want to use SecretXperience?</div>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>Choose your account type to unlock the right tools for you.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {[
                  { role: 'provider', icon: 'ti-user-heart', label: 'Advertiser', desc: 'Escorts, companions, massage, experiences & more' },
                  { role: 'venue',    icon: 'ti-building',   label: 'Venue Host', desc: 'Nightlife venues, hotels, and event spaces' },
                  { role: 'creator',  icon: 'ti-camera',     label: 'Content Creator', desc: 'Adult content, subscriptions & digital media' },
                ].map(opt => (
                  <button
                    key={opt.role}
                    onClick={async () => {
                      const supabase = (await import('../lib/supabase')).createClient()
                      const { error } = await supabase.from('profiles').update({ role: opt.role }).eq('id', user.id)
                      if (!error) {
                        setProfile((p: any) => ({ ...p, role: opt.role }))
                        setNotification(`✓ Account type set to ${opt.label}. You can now create listings and request verification.`)
                      }
                    }}
                    style={{
                      background: 'rgba(197,160,90,0.05)', border: '0.5px solid rgba(197,160,90,0.2)',
                      borderRadius: '10px', padding: '14px', textAlign: 'left', cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(197,160,90,0.5)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(197,160,90,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(197,160,90,0.2)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(197,160,90,0.05)' }}
                  >
                    <i className={`ti ${opt.icon}`} style={{ color: 'var(--gold)', fontSize: '22px', display: 'block', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t)', marginBottom: '4px' }}>{opt.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t2)', lineHeight: 1.4 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Verification Card ── */}
          {(profile?.role === 'provider' || profile?.role === 'venue' || profile?.role === 'creator') && !profile?.verified && (
            <div className="db-card" style={{ marginBottom: '1.5rem', border: profile?.verification_status === 'pending' ? '0.5px solid rgba(245,168,38,0.3)' : '0.5px solid var(--gbrd, rgba(197,160,90,0.25))' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(197,160,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="ti ti-shield-check" style={{ color: 'var(--gold)', fontSize: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--t)', marginBottom: '3px' }}>
                      {profile?.verification_status === 'pending' ? 'Verification pending' : 'Get verified'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.4 }}>
                      {profile?.verification_status === 'pending'
                        ? 'Our team is reviewing your profile. Usually within 24–48 hours.'
                        : 'Verified advertisers get a ✓ badge, appear higher in results, and earn more trust.'}
                    </div>
                  </div>
                </div>
                {profile?.verification_status !== 'pending' && (
                  <button
                    onClick={async () => {
                      const supabase = (await import('../lib/supabase')).createClient()
                      await supabase.from('profiles').update({ verification_status: 'pending', verification_requested_at: new Date().toISOString() }).eq('id', user.id)
                      setProfile((p: any) => ({ ...p, verification_status: 'pending' }))
                      setNotificationWithTimeout('✓ Verification request submitted. We\'ll review your profile within 48 hours.')
                    }}
                    className="db-quick-btn-gold"
                  >
                    Request verification →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Stripe Payouts Card ── */}
          {(profile?.role === 'provider' || profile?.role === 'venue' || profile?.role === 'creator') && (
            <div className="db-card" style={{ marginBottom: '1.5rem', border: profile?.stripe_connect_account_id ? '0.5px solid rgba(62,207,142,0.2)' : '0.5px solid var(--gbrd, rgba(197,160,90,0.25))' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: profile?.stripe_connect_account_id ? 'rgba(62,207,142,0.1)' : 'var(--gbg, rgba(197,160,90,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {profile?.stripe_connect_account_id ? (
                      <i className="ti ti-circle-check" style={{ color: 'var(--verified, #3ecf8e)', fontSize: '20px' }} aria-hidden="true" />
                    ) : (
                      <i className="ti ti-credit-card" style={{ color: 'var(--gold, #c5a05a)', fontSize: '20px' }} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--t, #ece8e1)', fontFamily: 'var(--sans)', marginBottom: '3px' }}>
                      {profile?.stripe_connect_account_id ? 'Payouts connected' : 'Set up payouts'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t2, #8c8880)', fontFamily: 'var(--sans)', lineHeight: 1.4 }}>
                      {profile?.stripe_connect_account_id
                        ? 'You receive 85% of each booking. Platform fee: 15%.'
                        : 'Connect Stripe to receive payments from bookings. Takes 2 minutes.'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {profile?.stripe_connect_account_id ? (
                    <button
                      onClick={handleConnectDashboard}
                      disabled={connectLoginLoading}
                      style={{ padding: '8px 16px', background: 'transparent', border: '0.5px solid rgba(62,207,142,0.4)', borderRadius: 'var(--r, 8px)', color: 'var(--verified, #3ecf8e)', cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: 'var(--sans)' }}
                    >
                      {connectLoginLoading ? 'Opening…' : 'View Stripe dashboard →'}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectStripe}
                      disabled={connectLoading}
                      className="db-quick-btn-gold"
                    >
                      {connectLoading ? 'Redirecting…' : 'Connect Stripe →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── My Advertisements ── */}
          <div className="db-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.375rem',
            }}>
              <span className="db-section-title">My advertisements</span>
              <button
                className="db-edit-btn"
                onClick={() => window.location.href = '/listings/create'}
                style={{
                  borderColor: 'var(--gbrd, rgba(197,160,90,0.25))',
                  color: 'var(--goldl, rgba(197,160,90,0.6))',
                }}
              >
                + New
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="db-empty-state">
                <i className="ti ti-clipboard-list" aria-hidden="true" style={{ fontSize: 48, color: 'var(--t3)', display: 'block', marginBottom: '1rem' }}></i>
                <p style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: 'var(--t, #ece8e1)',
                  marginBottom: '4px',
                }}>
                  No advertisements yet
                </p>
                <p style={{
                  color: 'var(--t3, rgba(255,255,255,0.28))',
                  fontSize: '13px',
                  fontWeight: 300,
                  fontFamily: 'var(--sans)',
                  letterSpacing: '0.03em',
                }}>
                  Create your first listing to start receiving bookings.
                </p>
                <button
                  className="db-quick-btn-gold"
                  onClick={() => window.location.href = '/listings/create'}
                  style={{ marginTop: '4px' }}
                >
                  Create a listing
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {listings.map(listing => (
                  <div key={listing.id} className="db-listing-item">

                    {/* ── Top: thumbnail + title/meta ── */}
                    <div className="db-listing-top">
                      {listing.images?.[0] && (
                        <div style={{ flexShrink: 0, width: 52, height: 64, borderRadius: 8, overflow: 'hidden', background: 'var(--bg3)' }}>
                          <img src={listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(listing.image_focus, listing.images[0]), display: 'block' }} />
                        </div>
                      )}
                      <div className="db-listing-info">
                        <div className="db-listing-title">{listing.title || '—'}</div>
                        <div className="db-listing-meta">
                          {listing.category && <span className="db-category-pill">{listing.category}</span>}
                          {listing.city && <span style={{ fontSize: '13px', color: 'var(--t3)', fontWeight: 300 }}>{listing.city}</span>}
                          {viewCounts[listing.id] != null && (
                            <span style={{ fontSize: '12px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <i className="ti ti-eye" style={{ fontSize: 11 }} /> {viewCounts[listing.id].toLocaleString()} view{viewCounts[listing.id] !== 1 ? 's' : ''}
                            </span>
                          )}
                          {(listing.price_from || listing.price_to) && (
                            <span style={{ fontSize: '13px', color: 'var(--goldl, rgba(197,160,90,0.55))', fontWeight: 300 }}>
                              {listing.price_from && listing.price_to
                                ? `€${listing.price_from}–€${listing.price_to}`
                                : listing.price_from ? `from €${listing.price_from}` : `up to €${listing.price_to}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Bottom: status badges + action buttons ── */}
                    <div className="db-listing-bottom">
                      <div className="db-listing-badges">
                        {listing.featured_until && new Date(listing.featured_until) > new Date() && (
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: 'var(--gbg)', color: 'var(--gold)', border: '0.5px solid var(--gbrd)', fontWeight: 500 }}>
                            ✦ Featured · {new Date(listing.featured_until).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                          </span>
                        )}
                        {listing.verified && <span className="db-status-pill-active">✓ Verified</span>}
                        {listing.status === 'pending' && <span className="db-status-pill-paused">⏳ Under review</span>}
                        {listing.status === 'rejected' && (
                          <span className="db-status-pill-inactive" style={{ color: '#e05a5a', borderColor: 'rgba(224,90,90,0.35)' }}>✗ Rejected</span>
                        )}
                        <span className={listing.active ? 'db-status-pill-active' : 'db-status-pill-inactive'}>
                          {listing.active ? 'Live' : 'Inactive'}
                        </span>
                      </div>

                      <div className="db-listing-actions">
                        {!listing.active && listing.status !== 'rejected' && listing.status !== 'pending' && (
                          <button
                            onClick={() => reactivateListing(listing.id)}
                            disabled={activatingListing === listing.id}
                            title="Set your advertisement live again — free"
                            style={{ padding: '5px 12px', borderRadius: 'var(--r, 8px)', border: '0.5px solid rgba(38,212,160,0.5)', background: activatingListing === listing.id ? 'rgba(38,212,160,0.08)' : 'rgba(38,212,160,0.12)', color: 'var(--verified, #1dc9a0)', cursor: activatingListing === listing.id ? 'default' : 'pointer', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', transition: 'all .15s', opacity: activatingListing === listing.id ? 0.6 : 1 }}
                          >
                            {activatingListing === listing.id ? '…' : 'Set live'}
                          </button>
                        )}
                        <button
                          className="db-icon-btn"
                          title="Edit photos"
                          onClick={() => {
                            const parsed = parseListingTags(listing.tags)
                            setListingDraft({
                              title: listing.title || '', description: listing.description || '',
                              category: listing.category || '', city: listing.city || '',
                              country: listing.country || '', price_from: listing.price_from ?? '',
                              price_to: listing.price_to ?? '', meet_type: listing.meet_type || 'incall',
                              active: listing.active ?? true,
                              images: Array.isArray(listing.images) ? [...listing.images] : [],
                              image_focus: listing.image_focus && typeof listing.image_focus === 'object' ? { ...listing.image_focus } : {},
                              contact_phone: listing.contact_phone || '',
                              whatsapp_optin: !!listing.whatsapp_optin,
                              ...parsed,
                            })
                            setEditingListing(listing)
                            setTimeout(() => {
                              document.getElementById('listing-photos-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }, 120)
                          }}
                        >
                          <i className="ti ti-photo" aria-hidden="true" />
                        </button>
                        <button
                          className="db-icon-btn"
                          title="Edit advertisement"
                          onClick={() => {
                            const parsed = parseListingTags(listing.tags)
                            setListingDraft({
                              title: listing.title || '', description: listing.description || '',
                              category: listing.category || '', city: listing.city || '',
                              country: listing.country || '', price_from: listing.price_from ?? '',
                              price_to: listing.price_to ?? '', meet_type: listing.meet_type || 'incall',
                              active: listing.active ?? true,
                              images: Array.isArray(listing.images) ? [...listing.images] : [],
                              image_focus: listing.image_focus && typeof listing.image_focus === 'object' ? { ...listing.image_focus } : {},
                              contact_phone: listing.contact_phone || '',
                              whatsapp_optin: !!listing.whatsapp_optin,
                              ...parsed,
                            })
                            setEditingListing(listing)
                          }}
                        >
                          <i className="ti ti-edit" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Incoming Booking Requests (advertiser view) ── */}
          {isAdvertiser && (
            <div className="db-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.375rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="db-section-title">Incoming requests</span>
                {incomingBookings.filter(b => b.status === 'pending').length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(245,168,38,0.12)', color: '#f5a826', border: '0.5px solid rgba(245,168,38,0.3)', borderRadius: 20, padding: '3px 10px', fontFamily: 'var(--sans)', letterSpacing: '0.08em' }}>
                    {incomingBookings.filter(b => b.status === 'pending').length} pending
                  </span>
                )}
              </div>
              {incomingBookings.length === 0 ? (
                <div className="db-empty-state">
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gbg)', border: '0.5px solid var(--gbrd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: '22px', color: 'var(--gold)' }} />
                  </div>
                  <p style={{ color: 'var(--t3)', fontSize: '13px', fontWeight: 300, fontFamily: 'var(--sans)', letterSpacing: '0.03em' }}>
                    No booking requests yet. Once clients book your advertisements they will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {incomingBookings.slice(0, 8).map((booking, i) => (
                    <div key={booking.id ?? i} className="db-booking-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', fontWeight: 400, color: 'var(--t)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {(booking.listing as any)?.title || booking.listing_id || 'Booking'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--t3)', fontFamily: 'var(--sans)', fontWeight: 300, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {booking.date && <span>{booking.date}{booking.time ? ` · ${booking.time}` : ''}</span>}
                          {booking.duration_hours && <span>{booking.duration_hours}h</span>}
                          {booking.total_amount > 0 && <span style={{ color: 'var(--gold)' }}>€{booking.total_amount}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={async () => {
                                const sb = (await import('../lib/supabase')).createClient()
                                await sb.from('bookings').update({ status: 'confirmed' }).eq('id', booking.id)
                                setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'confirmed' } : b))
                              }}
                              style={{ padding: '5px 12px', borderRadius: 8, border: '0.5px solid rgba(62,207,142,0.4)', background: 'rgba(62,207,142,0.08)', color: '#3ecf8e', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', letterSpacing: '0.04em' }}
                            >Confirm</button>
                            <button
                              onClick={async () => {
                                const sb = (await import('../lib/supabase')).createClient()
                                await sb.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
                                setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b))
                              }}
                              style={{ padding: '5px 12px', borderRadius: 8, border: '0.5px solid rgba(226,83,107,0.3)', background: 'transparent', color: '#e2536b', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', letterSpacing: '0.04em' }}
                            >Decline</button>
                          </>
                        )}
                        <BookingBadge status={booking.status ?? 'pending'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── My Bookings (client view) ── */}
          {myBookings.length > 0 && (
            <div className="db-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.375rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="db-section-title">My bookings</span>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--sans)', fontWeight: 300 }}>{myBookings.length} total</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myBookings.slice(0, 6).map((booking, i) => (
                  <div key={booking.id ?? i} className="db-booking-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '15px', fontWeight: 400, color: 'var(--t)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {(booking.listing as any)?.title || 'Booking'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--t3)', fontFamily: 'var(--sans)', fontWeight: 300, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {booking.date && <span>{booking.date}{booking.time ? ` · ${booking.time}` : ''}</span>}
                        {booking.duration_hours && <span>{booking.duration_hours}h</span>}
                        {booking.total_amount > 0 && <span style={{ color: 'var(--gold)' }}>€{booking.total_amount}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <BookingBadge status={booking.status ?? 'pending'} />
                      {booking.status === 'confirmed' && (
                        <a href="/messages" style={{ padding: '5px 12px', borderRadius: 8, border: '0.5px solid var(--b2)', background: 'transparent', color: 'var(--t2)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', letterSpacing: '0.04em', textDecoration: 'none' }}>
                          Message
                        </a>
                      )}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          onClick={async () => {
                            if (!confirm('Cancel this booking?')) return
                            const res = await fetch('/api/bookings/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id }) })
                            if (res.ok) setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b))
                          }}
                          style={{ padding: '5px 12px', borderRadius: 8, border: '0.5px solid rgba(212,95,114,0.3)', background: 'transparent', color: '#d45f72', fontSize: 12, fontWeight: 600, fontFamily: 'var(--sans)', letterSpacing: '0.04em', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Saved Listings ── */}
          {favorites.length > 0 && (
            <div className="db-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.375rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="db-section-title">Saved listings</span>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--sans)', fontWeight: 300 }}>{favorites.length} saved</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
                {favorites.map((l: any) => (
                  <a key={l.id} href={`/listings/${l.id}`} style={{ textDecoration: 'none', display: 'block', background: 'var(--bg2)', border: '0.5px solid var(--b2)', borderRadius: 10, overflow: 'hidden', transition: 'border-color .15s' }}>
                    <div style={{ height: 100, background: 'var(--bg3)', position: 'relative', overflow: 'hidden' }}>
                      {l.images?.[0]
                        ? <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: focusPosition(l.image_focus, l.images[0]) }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 32, fontStyle: 'italic', color: 'rgba(197,160,90,0.25)' }}>{(l.title||'Xx').slice(0,2)}</div>
                      }
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(176,67,89,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-heart-filled" style={{ fontSize: 11, color: '#fff' }} />
                      </div>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t)', fontFamily: 'var(--sans)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--sans)', fontWeight: 300, marginTop: 2 }}>{l.city} · {l.price_from ? `€${l.price_from}` : 'POA'}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Quick Actions ── */}
          <div className="db-card">
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="db-section-title">Quick actions</span>
            </div>
            <div
              className="db-quick-actions"
              style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
            >
              <button
                className="db-quick-btn-gold"
                onClick={() => window.location.href = '/listings/create'}
              >
                + Create listing
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/messages'}
              >
                View messages
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/tokens'}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                ◈ {tokenBalance != null ? `${tokenBalance} tokens` : 'Buy tokens'}
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/'}
              >
                Browse platform
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/discover'}
              >
                ✦ Discover
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/refer'}
              >
                ⇄ Refer & earn
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => window.location.href = '/creators/studio'}
              >
                ✶ Creator Studio
              </button>
              <button
                className="db-quick-btn-dark"
                onClick={() => { setProfileDraft({ full_name: profile?.full_name || '', bio: profile?.bio || '', availability: profile?.availability || '', city: profile?.city || '', country: profile?.country || '', phone: profile?.phone || '', age: profile?.age || '', languages: (profile?.languages || []).join(', ') }); setEditingProfile(true) }}
              >
                Edit profile
              </button>
              {profile?.role && profile.role !== 'user' && profile.role !== 'client' && (
                <button
                  className="db-quick-btn-dark"
                  onClick={() => {
                    const first = listings.find((l: any) => l.active) ?? listings[0]
                    window.location.href = first ? `/listings/${first.id}` : `/profile/${user?.id}`
                  }}
                >
                  View public profile
                </button>
              )}
              {(profile?.role === 'provider' || profile?.role === 'creator' || profile?.role === 'venue') && (
                <button
                  className="db-quick-btn-gold"
                  onClick={() => window.location.href = '/advertiser'}
                >
                  Advertiser Hub →
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Privacy Settings card ── */}
      {profile?.role && profile.role !== 'user' && profile.role !== 'client' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div className="db-card">
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="ti ti-eye-off" style={{ fontSize: 18, color: 'var(--gold, #c5a05a)' }} />
              <span className="db-section-title" style={{ marginBottom: 0 }}>Privacy Settings</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Your advertisements will not appear to visitors browsing from the countries listed below.
              Use this to protect your privacy or comply with local regulations.
            </p>

            {/* Picker row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'stretch' }}>
              <select
                value={blockedCountryPick}
                onChange={e => setBlockedCountryPick(e.target.value)}
                className="db-select"
                style={{ flex: 1 }}
              >
                <option value="">Select a country to block…</option>
                {COUNTRIES.filter(c => !blockedCountries.includes(c.code)).map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!blockedCountryPick) return
                  setBlockedCountries(prev => [...prev, blockedCountryPick])
                  setBlockedCountryPick('')
                }}
                disabled={!blockedCountryPick}
                style={{
                  width: 44, height: 44, borderRadius: 10, border: '0.5px solid rgba(197,160,90,0.4)',
                  background: 'rgba(197,160,90,0.08)', color: 'var(--gold, #c5a05a)',
                  fontSize: 22, cursor: blockedCountryPick ? 'pointer' : 'not-allowed',
                  opacity: blockedCountryPick ? 1 : 0.4, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>

            {/* Blocked country pills */}
            {blockedCountries.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1.25rem' }}>
                {blockedCountries.map(code => {
                  const name = COUNTRIES.find(c => c.code === code)?.name || code
                  return (
                    <span key={code} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '5px 12px 5px 14px', borderRadius: 999,
                      background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.14)',
                      fontSize: 13, color: 'rgba(255,255,255,0.75)',
                    }}>
                      {name}
                      <button
                        type="button"
                        onClick={() => setBlockedCountries(prev => prev.filter(c => c !== code))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center' }}
                        aria-label={`Remove ${name}`}
                      >×</button>
                    </span>
                  )
                })}
              </div>
            )}

            {blockedCountries.length === 0 && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginBottom: '1.25rem', fontStyle: 'italic' }}>
                No countries blocked — your advertisements are visible worldwide.
              </p>
            )}

            <button
              onClick={saveBlockedCountries}
              disabled={savingBlocked}
              className="db-quick-btn-gold"
              style={{ minWidth: 120 }}
            >
              {savingBlocked ? 'Saving…' : 'Save privacy settings'}
            </button>
          </div>
        </div>
      )}

      {/* ── Listing edit modal ── */}
      {editingListing && (
        <div onClick={() => setEditingListing(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'1.5rem 1rem',overflowY:'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#0e0e0e',border:'0.5px solid rgba(197,160,90,0.25)',borderRadius:'20px',padding:'2rem',width:'100%',maxWidth:'640px',boxShadow:'0 24px 80px rgba(0,0,0,0.7)',marginBottom:'2rem' }}>

            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.75rem' }}>
              <div style={{ fontFamily:'var(--serif)',fontSize:'24px',fontWeight:500,color:'var(--t, #ece8e1)' }}>Edit Advertisement</div>
              <button onClick={() => setEditingListing(null)} style={{ background:'none',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:'50%',width:32,height:32,color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>

            {/* ── Basic Info ── */}
            <div className="db-form-section">
              <div className="db-form-section-title">Basic Info</div>
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Title / Name</label>
                <input type="text" value={listingDraft.title||''} onChange={e => setListingDraft((d:any)=>({...d,title:e.target.value}))} placeholder="Your advertisement title" className="db-input" />
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>About / Description</label>
                <textarea value={listingDraft.description||''} onChange={e => setListingDraft((d:any)=>({...d,description:e.target.value}))} rows={4} placeholder="Describe yourself and what you offer…" className="db-textarea" />
              </div>
              <div className="db-form-row" style={{ marginBottom:'1rem' }}>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Category</label>
                  <select value={listingDraft.category||''} onChange={e => setListingDraft((d:any)=>({...d,category:e.target.value}))} className="db-select">
                    {['escorts','massage','companionship','domination','adult','creators','nightlife','experiences','rentals','events','photo','memberships'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Meet Type</label>
                  <select value={listingDraft.meet_type||'incall'} onChange={e => setListingDraft((d:any)=>({...d,meet_type:e.target.value}))} className="db-select">
                    <option value="incall">Incall / Private</option>
                    <option value="outcall">Outcall / Escort</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Location & Pricing ── */}
            <div className="db-form-section">
              <div className="db-form-section-title">Location & Pricing</div>
              <div className="db-form-row" style={{ marginBottom:'1rem' }}>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>City</label>
                  <input type="text" value={listingDraft.city||''} onChange={e => setListingDraft((d:any)=>({...d,city:e.target.value}))} placeholder="e.g. Brussels" className="db-input" />
                </div>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Country</label>
                  <input type="text" value={listingDraft.country||''} onChange={e => setListingDraft((d:any)=>({...d,country:e.target.value}))} placeholder="e.g. Belgium" className="db-input" />
                </div>
              </div>
              <div className="db-form-row" style={{ marginBottom:'1rem' }}>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Price from (€/hr)</label>
                  <input type="number" value={listingDraft.price_from??''} onChange={e => setListingDraft((d:any)=>({...d,price_from:e.target.value}))} placeholder="e.g. 150" className="db-input" />
                </div>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Price to (€, optional)</label>
                  <input type="number" value={listingDraft.price_to??''} onChange={e => setListingDraft((d:any)=>({...d,price_to:e.target.value}))} placeholder="e.g. 300" className="db-input" />
                </div>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                <input type="checkbox" id="listingActive" checked={!!listingDraft.active} onChange={e => setListingDraft((d:any)=>({...d,active:e.target.checked}))} style={{ accentColor:'var(--gold,#c5a05a)',width:'16px',height:'16px',cursor:'pointer' }} />
                <label htmlFor="listingActive" style={{ fontSize:'13px',color:'var(--t,#ece8e1)',cursor:'pointer',fontFamily:'var(--sans)' }}>Listing is active and visible to clients</label>
              </div>
            </div>

            {/* ── Photos ── */}
            <div className="db-form-section" id="listing-photos-section">
              <div className="db-form-section-title">Photos</div>
              <div className="db-photo-grid">
                {(listingDraft.images || []).filter(Boolean).map((url: string, i: number, arr: string[]) => (
                  <div key={i} className="db-photo-thumb">
                    <div className="db-photo-thumb-img-wrap">
                      <img src={url} alt="" style={{ objectPosition: focusPosition(listingDraft.image_focus, url) }} />
                      <div className="db-photo-order-badge">{i + 1}</div>
                    </div>
                    <div className="db-photo-actions">
                      <button className="db-photo-act-btn" title="Move left" disabled={i === 0}
                        style={{ opacity: i === 0 ? 0.3 : 1 }}
                        onClick={() => setListingDraft((d: any) => {
                          const imgs = [...d.images.filter(Boolean)]
                          ;[imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]]
                          return { ...d, images: imgs }
                        })}>‹</button>
                      <button className="db-photo-act-btn" title="Set thumbnail focus"
                        onClick={() => openFocusPicker(url)}>
                        <i className="ti ti-focus-2" style={{ fontSize: 14 }} />
                      </button>
                      <button className="db-photo-act-btn" title="Edit / crop"
                        onClick={() => {
                          setPhotoZoom(1); setPhotoRotate(0); setPhotoPanX(0); setPhotoPanY(0)
                          setPhotoEditing({ imgIdx: i, url })
                        }}>
                        <i className="ti ti-crop" style={{ fontSize: 14 }} />
                      </button>
                      <button className="db-photo-act-btn" title="Move right" disabled={i === arr.length - 1}
                        style={{ opacity: i === arr.length - 1 ? 0.3 : 1 }}
                        onClick={() => setListingDraft((d: any) => {
                          const imgs = [...d.images.filter(Boolean)]
                          ;[imgs[i], imgs[i + 1]] = [imgs[i + 1], imgs[i]]
                          return { ...d, images: imgs }
                        })}>›</button>
                      <button className="db-photo-act-btn danger" title="Remove photo"
                        onClick={() => setListingDraft((d: any) => ({
                          ...d, images: d.images.filter((_: any, j: number) => j !== i),
                        }))}>×</button>
                    </div>
                  </div>
                ))}

                {/* Add photo slot */}
                {(listingDraft.images || []).filter(Boolean).length < 5 && (
                  <div className="db-photo-thumb-add" onClick={() => !photoUploading && photoFileInputRef.current?.click()}>
                    {photoUploading ? (
                      <div style={{ width: 18, height: 18, border: '1.5px solid rgba(197,160,90,0.3)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <>
                        <span style={{ fontSize: 20, color: 'rgba(197,160,90,0.45)', lineHeight: 1 }}>+</span>
                        <span style={{ fontSize: 10, color: 'rgba(197,160,90,0.4)', fontFamily: 'var(--sans)', letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.3 }}>Add photo</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={photoFileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }} onChange={handlePhotoFileChange}
              />
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--sans)' }}>
                ‹ › to reorder · crop icon to edit · × to remove · up to 5 photos
              </div>
            </div>

            {/* ── Profile Details (escort categories only) ── */}
            {ESCORT_CATS.has(listingDraft.category) && (<>

              <div className="db-form-section">
                <div className="db-form-section-title">Profile Type & Orientation</div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Escort Type</label>
                  <div className="db-chip-grid">
                    {ESCORT_TYPES_OPT.map(t => (
                      <button key={t} type="button"
                        className={`db-chip${listingDraft.escort_type === t.toLowerCase() ? ' selected' : ''}`}
                        onClick={() => setListingDraft((d:any)=>({ ...d, escort_type: d.escort_type === t.toLowerCase() ? '' : t.toLowerCase() }))}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Sexual Orientation</label>
                  <div className="db-chip-grid">
                    {ORIENTATION_OPT.map(o => (
                      <button key={o} type="button"
                        className={`db-chip${listingDraft.orientation === o.toLowerCase() ? ' selected' : ''}`}
                        onClick={() => setListingDraft((d:any)=>({ ...d, orientation: d.orientation === o.toLowerCase() ? '' : o.toLowerCase() }))}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="db-form-section">
                <div className="db-form-section-title">Physical Details</div>
                <div className="db-form-row-3" style={{ marginBottom:'1rem' }}>
                  <div>
                    <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Age</label>
                    <input type="number" value={listingDraft.age||''} onChange={e => setListingDraft((d:any)=>({...d,age:e.target.value}))} placeholder="25" className="db-input" min="18" max="99" />
                  </div>
                  <div>
                    <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Height (cm)</label>
                    <input type="number" value={listingDraft.height||''} onChange={e => setListingDraft((d:any)=>({...d,height:e.target.value}))} placeholder="165" className="db-input" min="140" max="220" />
                  </div>
                  <div>
                    <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Weight (kg)</label>
                    <input type="number" value={listingDraft.weight||''} onChange={e => setListingDraft((d:any)=>({...d,weight:e.target.value}))} placeholder="55" className="db-input" min="40" max="200" />
                  </div>
                </div>
                <div className="db-form-row" style={{ marginBottom:'1rem' }}>
                  <div>
                    <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Nationality</label>
                    <select value={listingDraft.nationality||''} onChange={e => setListingDraft((d:any)=>({...d,nationality:e.target.value}))} className="db-select">
                      <option value="">Select…</option>
                      {NATIONALITY_OPT.map(n => <option key={n} value={n.toLowerCase()}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Ethnicity</label>
                    <select value={listingDraft.ethnicity||''} onChange={e => setListingDraft((d:any)=>({...d,ethnicity:e.target.value}))} className="db-select">
                      <option value="">Select…</option>
                      {ETHNICITY_OPT.map(e => <option key={e} value={e.toLowerCase()}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div className="db-form-row" style={{ marginBottom:'1rem' }}>
                  <div>
                    <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Hair Color</label>
                    <select value={listingDraft.hair||''} onChange={e => setListingDraft((d:any)=>({...d,hair:e.target.value}))} className="db-select">
                      <option value="">Select…</option>
                      {HAIR_OPT.map(h => <option key={h} value={h.toLowerCase()}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'7px',textTransform:'uppercase' }}>Build</label>
                    <select value={listingDraft.build||''} onChange={e => setListingDraft((d:any)=>({...d,build:e.target.value}))} className="db-select">
                      <option value="">Select…</option>
                      {BUILD_OPT.map(b => <option key={b} value={b.toLowerCase()}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Languages</label>
                  <div className="db-chip-grid">
                    {LANGUAGE_OPT.map(lang => {
                      const v = lang.toLowerCase()
                      const selected = (listingDraft.languages||[]).includes(v)
                      return (
                        <button key={lang} type="button"
                          className={`db-chip${selected ? ' selected' : ''}`}
                          onClick={() => setListingDraft((d:any)=>({
                            ...d, languages: selected
                              ? d.languages.filter((l:string)=>l!==v)
                              : [...(d.languages||[]), v]
                          }))}>
                          {lang}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── Services ── */}
              <div className="db-form-section">
                <div className="db-form-section-title">Services / Possibilities</div>
                <div className="db-chip-grid">
                  {getServiceOptions(listingDraft.category).map(svc => {
                    const selected = (listingDraft.services||[]).includes(svc)
                    return (
                      <button key={svc} type="button"
                        className={`db-chip${selected ? ' selected' : ''}`}
                        onClick={() => setListingDraft((d:any)=>({
                          ...d, services: selected
                            ? d.services.filter((s:string)=>s!==svc)
                            : [...(d.services||[]), svc]
                        }))}>
                        {svc}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Working Hours ── */}
              <div className="db-form-section">
                <div className="db-form-section-title">Working Hours</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {WH_DAYS.map((day, i) => {
                    const key = `wh_${day}`
                    const val = listingDraft[key] ?? (i < 5 ? '10-22' : 'off')
                    const isOn = val !== 'off'
                    const parts = isOn ? val.split('-') : ['10', '22']
                    const startH = parts[0] ?? '10'
                    const endH   = parts[1] ?? '22'
                    const hourOpts = Array.from({length:24},(_,h)=>String(h).padStart(2,'0'))
                    return (
                      <div key={day} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'32px', fontSize:'11px', color:'rgba(255,255,255,0.4)', fontFamily:'var(--sans)', fontWeight:600, letterSpacing:'0.06em' }}>{WH_DAY_LABELS[i]}</div>
                        <button type="button"
                          style={{ width:'28px', height:'28px', borderRadius:'6px', border:'0.5px solid rgba(255,255,255,0.12)', background: isOn ? 'rgba(197,160,90,0.15)' : 'transparent', color: isOn ? 'var(--gold,#c5a05a)' : 'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                          onClick={() => setListingDraft((d:any)=>({...d, [key]: isOn ? 'off' : '10-22'}))}>
                          {isOn ? '✓' : '–'}
                        </button>
                        {isOn ? (
                          <>
                            <select value={startH} className="db-select" style={{ flex:1, padding:'5px 8px', fontSize:'12px' }}
                              onChange={e => setListingDraft((d:any)=>({...d, [key]: `${e.target.value}-${endH}`}))}>
                              {hourOpts.map(h => <option key={h} value={h}>{h}:00</option>)}
                            </select>
                            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', flexShrink:0 }}>to</span>
                            <select value={endH} className="db-select" style={{ flex:1, padding:'5px 8px', fontSize:'12px' }}
                              onChange={e => setListingDraft((d:any)=>({...d, [key]: `${startH}-${e.target.value}`}))}>
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
                <div style={{ fontSize:'11px',color:'rgba(255,255,255,0.2)',marginTop:'12px',fontFamily:'var(--sans)' }}>Click the checkmark to toggle a day on or off.</div>
              </div>
            </>)}

            {/* WhatsApp opt-in */}
            <div style={{ marginTop:'1rem', background:'rgba(37,211,102,0.04)', border:'0.5px solid rgba(37,211,102,0.18)', borderRadius:'var(--r)', padding:'1rem' }}>
              <div style={{ fontSize:'10px',letterSpacing:'0.14em',textTransform:'uppercase',color:'rgba(37,211,102,0.7)',marginBottom:'0.6rem',fontWeight:600 }}>WhatsApp Contact</div>
              <input
                type="tel"
                className="db-input"
                value={listingDraft.contact_phone||''}
                onChange={e => setListingDraft((d:any)=>({...d,contact_phone:e.target.value}))}
                placeholder="+32 470 000 000"
                style={{ marginBottom:'0.65rem' }}
              />
              <label style={{ display:'flex',alignItems:'flex-start',gap:'8px',cursor:'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!listingDraft.whatsapp_optin}
                  onChange={e => setListingDraft((d:any)=>({...d,whatsapp_optin:e.target.checked}))}
                  style={{ marginTop:'2px',accentColor:'#25d366',width:14,height:14,flexShrink:0 }}
                />
                <span style={{ fontSize:'12px',color:'var(--t2)',lineHeight:1.5 }}>
                  I consent to WhatsApp contact from SecretXperience for platform updates and support.
                </span>
              </label>
            </div>

            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end',paddingTop:'0.5rem',borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setEditingListing(null)} className="db-quick-btn-dark">Cancel</button>
              <button onClick={saveListing} disabled={savingListing} className="db-quick-btn-gold">{savingListing ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo editor modal ── */}
      {photoEditing && (
        <div className="db-pe-modal" onClick={() => !photoSaving && setPhotoEditing(null)}>
          <div className="db-pe-panel" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 500, color: 'var(--t, #ece8e1)' }}>
                Edit Photo <span style={{ fontFamily: 'var(--sans)', fontSize: '11px', color: 'var(--t3)', fontWeight: 400, marginLeft: 6 }}>drag · zoom · rotate</span>
              </div>
              <button
                onClick={() => setPhotoEditing(null)} disabled={photoSaving}
                style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 30, height: 30, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>

            {/* Canvas preview */}
            <canvas
              ref={previewCanvasRef}
              className="db-pe-canvas"
              width={300}
              height={400}
              onPointerDown={e => {
                e.currentTarget.setPointerCapture(e.pointerId)
                photoDragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: photoPanX, startPanY: photoPanY }
              }}
              onPointerMove={e => {
                if (!photoDragRef.current) return
                setPhotoPanX(photoDragRef.current.startPanX + (e.clientX - photoDragRef.current.startX))
                setPhotoPanY(photoDragRef.current.startPanY + (e.clientY - photoDragRef.current.startY))
              }}
              onPointerUp={() => { photoDragRef.current = null }}
              onPointerCancel={() => { photoDragRef.current = null }}
            />

            {/* Zoom slider */}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--sans)', minWidth: 28 }}>1×</span>
              <input
                type="range" min="0.5" max="4" step="0.05"
                value={photoZoom}
                onChange={e => setPhotoZoom(Number(e.target.value))}
                className="db-pe-slider"
              />
              <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--sans)', minWidth: 28, textAlign: 'right' }}>{photoZoom.toFixed(1)}×</span>
            </div>

            {/* Rotate buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button className="db-pe-rotate-btn"
                onClick={() => setPhotoRotate(r => (r - 90 + 360) % 360)}
                title="Rotate 90° left">↺ Left</button>
              <button
                onClick={() => { setPhotoZoom(1); setPhotoRotate(0); setPhotoPanX(0); setPhotoPanY(0) }}
                style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '8px 14px', fontSize: 11, fontFamily: 'var(--sans)', letterSpacing: '0.06em', transition: 'all 0.15s' }}
                title="Reset">Reset</button>
              <button className="db-pe-rotate-btn"
                onClick={() => setPhotoRotate(r => (r + 90) % 360)}
                title="Rotate 90° right">Right ↻</button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setPhotoEditing(null)} disabled={photoSaving} className="db-quick-btn-dark" style={{ flex: 1, padding: '10px' }}>Cancel</button>
              <button onClick={applyPhotoEdit} disabled={photoSaving} className="db-quick-btn-gold" style={{ flex: 2, padding: '10px' }}>
                {photoSaving ? 'Uploading…' : 'Apply & Save →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Thumbnail focal-point picker ── */}
      {focusEditing && (
        <div className="db-pe-modal" onClick={() => setFocusEditing(null)}>
          <div className="db-pe-panel" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 500, color: 'var(--t, #ece8e1)' }}>
                Thumbnail focus
              </div>
              <button
                onClick={() => setFocusEditing(null)}
                style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 30, height: 30, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--sans)', margin: '0 0 12px', lineHeight: 1.5 }}>
              Click the part of the photo that should stay centred in card thumbnails (e.g. the face). The previews update live.
            </p>

            {/* Full image with focus marker */}
            <div
              onClick={handleFocusClick}
              style={{ position: 'relative', width: '100%', maxHeight: 300, borderRadius: 10, overflow: 'hidden', cursor: 'crosshair', background: '#111', userSelect: 'none' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={focusEditing.url} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: `${focusXY.x}%`, top: `${focusXY.y}%`, width: 26, height: 26, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '2px solid var(--gold, #c5a05a)', boxShadow: '0 0 0 2px rgba(0,0,0,0.5), 0 0 12px rgba(197,160,90,0.6)', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', inset: '50% auto auto 50%', width: 4, height: 4, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'var(--gold, #c5a05a)' }} />
              </div>
            </div>

            {/* Live crop previews at the shapes cards actually use */}
            <div style={{ display: 'flex', gap: 14, marginTop: 14, alignItems: 'flex-end' }}>
              <div>
                <div style={{ width: 90, height: 120, borderRadius: 8, overflow: 'hidden', border: '0.5px solid var(--b2)', background: '#111' }}>
                  <img src={focusEditing.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focusXY.x}% ${focusXY.y}%`, display: 'block' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--sans)', textAlign: 'center', marginTop: 4 }}>Portrait</div>
              </div>
              <div>
                <div style={{ width: 140, height: 90, borderRadius: 8, overflow: 'hidden', border: '0.5px solid var(--b2)', background: '#111' }}>
                  <img src={focusEditing.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${focusXY.x}% ${focusXY.y}%`, display: 'block' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--sans)', textAlign: 'center', marginTop: 4 }}>Wide</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
              <button onClick={resetFocus} className="db-quick-btn-dark" style={{ flex: 1, padding: '10px' }}>Reset to default</button>
              <button onClick={saveFocus} className="db-quick-btn-gold" style={{ flex: 2, padding: '10px' }}>Set focus →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile edit modal ── */}
      {editingProfile && (
        <div onClick={() => setEditingProfile(false)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg1, #111)',border:'0.5px solid var(--b3, rgba(197,160,90,0.25))',borderRadius:'var(--rxl, 20px)',padding:'2rem',width:'100%',maxWidth:'480px',maxHeight:'90vh',overflowY:'auto',boxShadow:'var(--shadow-modal)' }}>
            <div style={{ fontFamily:'var(--serif)',fontSize:'22px',fontWeight:500,color:'var(--t, #ece8e1)',marginBottom:'1.5rem' }}>Edit Profile</div>
            {[
              { label:'Full name', key:'full_name', type:'text', placeholder:'Your name' },
              { label:'City', key:'city', type:'text', placeholder:'e.g. Brussels' },
              { label:'Country', key:'country', type:'text', placeholder:'e.g. Belgium' },
              { label:'Age', key:'age', type:'number', placeholder:'Your age' },
              { label:'Phone (optional)', key:'phone', type:'text', placeholder:'+32 ...' },
              { label:'Languages (comma-separated)', key:'languages', type:'text', placeholder:'English, French, Dutch' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:'1rem' }}>
                <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>{f.label}</label>
                <input type={f.type} value={profileDraft[f.key] || ''} onChange={e => setProfileDraft((d: any) => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  className="db-input" />
              </div>
            ))}
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Bio</label>
              <textarea value={profileDraft.bio || ''} onChange={e => setProfileDraft((d: any) => ({ ...d, bio: e.target.value }))} placeholder="Tell clients about yourself…" rows={4}
                className="db-textarea" />
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ display:'block',font:'600 10px/1 var(--sans)',color:'var(--gold, #c5a05a)',letterSpacing:'0.1em',marginBottom:'8px',textTransform:'uppercase' }}>Availability</label>
              <input type="text" value={profileDraft.availability || ''} onChange={e => setProfileDraft((d: any) => ({ ...d, availability: e.target.value }))} placeholder="e.g. Mon–Fri 10:00–22:00, weekends on request"
                className="db-input" />
              <div style={{ fontSize:'11px',color:'var(--t3, #4c4a47)',marginTop:'4px',fontFamily:'var(--sans)' }}>Shown on your public profile</div>
            </div>
            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
              <button onClick={() => setEditingProfile(false)} className="db-quick-btn-dark">Cancel</button>
              <button onClick={saveProfile} disabled={savingProfile} className="db-quick-btn-gold">{savingProfile ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Boost listing modal ── */}
      {boostingListing && (
        <div onClick={() => setBoostingListing(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg1, #0f0f0f)',border:'0.5px solid var(--b3, rgba(197,160,90,0.2))',borderRadius:'var(--rxl, 20px)',padding:'2rem',width:'100%',maxWidth:'440px',fontFamily:'var(--sans)',boxShadow:'var(--shadow-modal)' }}>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'var(--serif)',fontSize:'22px',color:'var(--gold, #c5a05a)',fontWeight:500,marginBottom:'6px' }}>✦ Boost Listing</div>
              <div style={{ fontSize:'13px',color:'var(--t2, #8c8880)',lineHeight:1.5 }}>Feature <strong style={{ color:'var(--t, #ece8e1)' }}>{boostingListing.title}</strong> at the top of search results.</div>
            </div>
            <div style={{ display:'flex',gap:'8px',marginBottom:'1.5rem' }}>
              {([
                { key:'6h',   label:'6 Hours', price:'20 tokens', note:'Flash boost' },
                { key:'week', label:'7 Days',  price:'€29',       note:'Quick boost' },
                { key:'month',label:'30 Days', price:'€79',       note:'Best value'  },
              ] as { key: '6h'|'week'|'month'; label: string; price: string; note: string }[]).map(p => (
                <div key={p.key} onClick={() => setBoostPlan(p.key)} style={{ flex:1,padding:'0.875rem 0.5rem',borderRadius:'var(--rl, 13px)',border:`0.5px solid ${boostPlan===p.key?'var(--gbrd, rgba(197,160,90,0.6))':'var(--b2, rgba(255,255,255,0.08))'}`,background:boostPlan===p.key?'var(--gbg, rgba(197,160,90,0.07))':'var(--bg2, transparent)',cursor:'pointer',textAlign:'center',transition:'all var(--t-fast, .15s) var(--ease-out)' }}>
                  <div style={{ fontSize:'12px',color:'var(--t2, #8c8880)',marginBottom:'4px' }}>{p.label}</div>
                  <div style={{ fontSize:'20px',fontFamily:'var(--serif)',color:'var(--gold, #c5a05a)',fontWeight:400 }}>{p.price}</div>
                  <div style={{ fontSize:'10px',color:'var(--t3, #4c4a47)',marginTop:'3px' }}>{p.note}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'var(--gbg, rgba(197,160,90,0.06))',border:'0.5px solid var(--gbrd, rgba(197,160,90,0.15))',borderRadius:'var(--r, 8px)',padding:'0.875rem 1rem',marginBottom:'1.5rem',fontSize:'12px',color:'var(--t2, #8c8880)',lineHeight:1.6 }}>
              {boostPlan === '6h'
                ? 'Your advertisement will appear at the top of results for 6 hours, then return to its normal position.'
                : 'Your advertisement will appear at the top of all search results and category pages with a ✦ Featured badge for the selected duration.'}
            </div>
            <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
              <button onClick={() => setBoostingListing(null)} className="db-quick-btn-dark">Cancel</button>
              <button onClick={startBoost} disabled={boostLoading} className="db-quick-btn-gold">
                {boostLoading ? (boostPlan === '6h' ? 'Boosting…' : 'Redirecting…') : `Boost for ${boostPlan==='6h'?'20 tokens':boostPlan==='week'?'€29':'€79'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
