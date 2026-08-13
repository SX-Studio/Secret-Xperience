'use client'
import { useMemo, useState } from 'react'
import type { PublicCreator, PublicPost } from './data'

const GIFT_AMOUNTS = [
  { tokens: 25, emoji: '☕', label: 'Coffee' },
  { tokens: 50, emoji: '🌹', label: 'Rose' },
  { tokens: 100, emoji: '🍾', label: 'Bubbly' },
  { tokens: 200, emoji: '💎', label: 'Diamond' },
]

type Subscription = { tierName: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean }
type Viewer = { loggedIn: boolean; isSelf: boolean; isFollowing: boolean; balance: number; subscription: Subscription | null }

const tokensForEuro = (euro: any) => Math.max(1, Math.round((Number(euro) || 0) * 10))
const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return iso } }

export default function PublicProfile({ creator, viewer }: { creator: PublicCreator; viewer: Viewer }) {
  const cfg = creator.config || {}
  const accent = (cfg.theme && typeof cfg.theme.accent === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cfg.theme.accent)) ? cfg.theme.accent : '#c5a05a'
  const sections = cfg.sections || {}
  const show = (k: string) => sections[k] === undefined ? true : sections[k] !== false
  const giftsOn = cfg.giftsEnabled !== false && show('gifts')

  const [following, setFollowing] = useState(viewer.isFollowing)
  const [followerCount, setFollowerCount] = useState(creator.followerCount)
  const [followBusy, setFollowBusy] = useState(false)
  const [giftTokens, setGiftTokens] = useState(creator.giftTokens)
  const [balance, setBalance] = useState(viewer.balance)
  const [giftOpen, setGiftOpen] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(viewer.subscription)
  const [subTier, setSubTier] = useState<any | null>(null) // tier being confirmed in the modal
  const [toast, setToast] = useState<string | null>(null)
  const isSubscriber = !!subscription

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800) }
  const initial = (creator.full_name || 'C').trim().charAt(0).toUpperCase()

  const publicPosts = creator.posts
  const goal = cfg.goal || null
  const goalTarget = goal && Number(goal.target) > 0 ? Number(goal.target) : 0
  const goalPct = goalTarget ? Math.min(100, Math.round((giftTokens / goalTarget) * 100)) : 0
  const tiers: any[] = Array.isArray(cfg.tiers) ? cfg.tiers : []

  async function toggleFollow() {
    if (!viewer.loggedIn) { window.location.href = `/login?next=/c/${creator.username}`; return }
    if (viewer.isSelf) { notify('This is your own profile'); return }
    setFollowBusy(true)
    try {
      const r = await fetch('/api/creators/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId: creator.id }) })
      const j = await r.json()
      if (!r.ok) { notify(j.error || 'Could not update'); return }
      setFollowing(j.following); setFollowerCount(j.followerCount)
      notify(j.following ? `You're following ${creator.full_name}` : 'Unfollowed')
    } catch { notify('Could not update') } finally { setFollowBusy(false) }
  }

  function openGift() {
    if (!viewer.loggedIn) { window.location.href = `/login?next=/c/${creator.username}`; return }
    if (viewer.isSelf) { notify('You cannot gift yourself'); return }
    setGiftOpen(true)
  }

  function startSubscribe(tier: any) {
    if (!viewer.loggedIn) { window.location.href = `/login?next=/c/${creator.username}`; return }
    if (viewer.isSelf) { notify('This is your own profile'); return }
    setSubTier(tier)
  }
  async function cancelResume(cancel: boolean) {
    try {
      const r = await fetch('/api/creators/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId: creator.id, action: cancel ? 'cancel' : 'resume' }) })
      const j = await r.json()
      if (!r.ok) { notify(j.error || 'Could not update'); return }
      setSubscription((s) => s ? { ...s, cancelAtPeriodEnd: cancel } : s)
      notify(cancel ? 'Membership will not renew' : 'Membership renewal re-enabled')
    } catch { notify('Could not update') }
  }

  function share() {
    const url = `https://www.secretxperience.eu/c/${creator.username}`
    if (navigator.share) { navigator.share({ title: creator.full_name, url }).catch(() => {}) }
    else { navigator.clipboard?.writeText(url).catch(() => {}); notify('Profile link copied') }
  }

  return (
    <div className="cp" style={{ ['--acc' as any]: accent }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .cp{min-height:100vh;background:var(--bg,#080612);color:var(--t,#ece8e1);font-family:var(--sans,'Poppins',sans-serif)}
        .cp a{color:inherit}
        .cp-top{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 18px;background:rgba(8,6,18,.9);backdrop-filter:blur(16px);border-bottom:.5px solid var(--b,rgba(255,255,255,.08))}
        .cp-top a.home{font-family:var(--serif,'Cormorant Garamond',serif);font-size:19px;color:var(--gold,#c5a05a);text-decoration:none}
        .cp-back{font-size:13px;color:var(--t2,#8c8880);text-decoration:none;display:inline-flex;gap:6px;align-items:center}
        .cp-cover{position:relative;height:230px;background:linear-gradient(135deg,color-mix(in srgb,var(--acc) 45%,#0a0812),#0a0812);background-size:cover;background-position:center}
        .cp-cover::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,var(--bg,#080612),transparent 70%)}
        .cp-wrap{max-width:1080px;margin:0 auto;padding:0 20px 80px}
        .cp-headrow{display:flex;align-items:flex-end;gap:22px;margin-top:-58px;position:relative;z-index:2;flex-wrap:wrap}
        .cp-av{width:118px;height:118px;border-radius:50%;border:4px solid var(--bg,#080612);background:var(--acc);display:flex;align-items:center;justify-content:center;font-family:var(--serif,'Cormorant Garamond',serif);font-size:44px;color:#fff;background-size:cover;background-position:center;flex:none;box-shadow:0 18px 50px rgba(0,0,0,.5)}
        .cp-id{flex:1;min-width:240px;padding-bottom:6px}
        .cp-name{font-family:var(--serif,'Cormorant Garamond',serif);font-size:clamp(26px,4vw,36px);font-weight:400;line-height:1.1;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .cp-ver{font-size:13px;color:#26d4a0;display:inline-flex;align-items:center;gap:4px}
        .cp-handle{color:var(--t2,#8c8880);font-size:14px;margin-top:4px}
        .cp-meta{display:flex;gap:16px;margin-top:8px;font-size:13px;color:var(--t3,#6f6b64);flex-wrap:wrap}
        .cp-meta b{color:var(--t,#ece8e1);font-weight:600}
        .cp-actions{display:flex;gap:10px;padding-bottom:8px;flex-wrap:wrap}
        .cp-btn{height:42px;padding:0 20px;border-radius:999px;font:600 13.5px var(--sans);cursor:pointer;border:.5px solid var(--b2,rgba(255,255,255,.14));background:var(--bg2,rgba(255,255,255,.05));color:var(--t,#ece8e1);display:inline-flex;align-items:center;gap:8px;transition:.15s}
        .cp-btn:hover{border-color:var(--acc)}
        .cp-btn.acc{background:var(--acc);border:none;color:#fff}
        .cp-btn.on{background:transparent;border-color:var(--acc);color:var(--acc)}
        .cp-section{margin-top:40px}
        .cp-h{font-family:var(--serif,'Cormorant Garamond',serif);font-size:22px;font-weight:400;margin:0 0 4px}
        .cp-hsub{font-size:13px;color:var(--t3,#6f6b64);margin:0 0 18px}
        .cp-bio{font-size:15px;line-height:1.65;color:var(--t2,#a9a49c);max-width:680px;margin-top:18px;white-space:pre-wrap}
        .cp-headline{margin-top:16px;font-size:15px;color:var(--acc);font-weight:600}
        .cp-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
        .cp-chip{font-size:12px;padding:5px 13px;border-radius:999px;border:.5px solid var(--b2,rgba(255,255,255,.12));color:var(--t2,#a9a49c);background:var(--bg2,rgba(255,255,255,.04))}
        .cp-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
        .cp-link{font-size:13px;padding:9px 15px;border-radius:12px;border:.5px solid var(--b2,rgba(255,255,255,.12));text-decoration:none;color:var(--t,#ece8e1);display:inline-flex;gap:7px;align-items:center;transition:.15s}
        .cp-link:hover{border-color:var(--acc);color:var(--acc)}
        .cp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
        .cp-card{position:relative;border-radius:14px;overflow:hidden;aspect-ratio:4/5;background:#14101c;border:.5px solid var(--b,rgba(255,255,255,.07))}
        .cp-card img{width:100%;height:100%;object-fit:cover;display:block}
        .cp-card .ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 25%,color-mix(in srgb,var(--acc) 25%,#1a1424),#0c0912);color:var(--t3,#6f6b64);font-size:30px}
        .cp-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.82),transparent 55%);pointer-events:none}
        .cp-lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;text-align:center;padding:14px;background:rgba(8,6,14,.28)}
        .cp-lock .lk{width:34px;height:34px;border-radius:50%;background:rgba(8,6,14,.55);border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:15px}
        .cp-pill{background:var(--acc);color:#fff;font:600 12px var(--sans);padding:6px 13px;border-radius:999px;cursor:pointer;border:none}
        .cp-cap{position:absolute;left:12px;right:12px;bottom:11px;font:600 13px var(--sans);color:#fff;z-index:2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .cp-badge{position:absolute;top:10px;left:10px;font:600 10px var(--sans);letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:999px;background:rgba(8,6,14,.6);color:#fff;z-index:2}
        .cp-tiers{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
        .cp-tier{border:.5px solid var(--b,rgba(255,255,255,.09));border-radius:16px;padding:22px;background:var(--bg1,rgba(255,255,255,.03));display:flex;flex-direction:column;gap:12px;position:relative}
        .cp-tier.hi{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc) inset}
        .cp-tier.cur{border-color:#26d4a0;box-shadow:0 0 0 1px #26d4a0 inset}
        .cp-tier.cur .tag{background:#26d4a0}
        .cp-substatus{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;border:.5px solid #26d4a0;background:color-mix(in srgb,#26d4a0 12%,transparent);border-radius:14px;padding:14px 18px;margin-bottom:18px;font-size:13.5px;color:var(--t2,#a9a49c)}
        .cp-substatus b{color:var(--t,#ece8e1)}
        .cp-tier .tag{position:absolute;top:-10px;right:16px;font:600 10px var(--sans);letter-spacing:.05em;text-transform:uppercase;background:var(--acc);color:#fff;padding:3px 10px;border-radius:999px}
        .cp-tier .tn{font-family:var(--serif,'Cormorant Garamond',serif);font-size:20px}
        .cp-tier .tp{font-family:var(--serif,'Cormorant Garamond',serif);font-size:26px;color:var(--acc)}
        .cp-tier .tp small{font-family:var(--sans);font-size:12px;color:var(--t3,#6f6b64)}
        .cp-tier ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:7px}
        .cp-tier li{font-size:13px;color:var(--t2,#a9a49c);display:flex;gap:8px}
        .cp-tier li::before{content:'✓';color:var(--acc)}
        .cp-support{margin-top:auto;height:40px;border-radius:10px;border:none;background:var(--acc);color:#fff;font:600 13px var(--sans);cursor:pointer}
        .cp-goal{border:.5px solid var(--b,rgba(255,255,255,.09));border-radius:16px;padding:22px;background:var(--bg1,rgba(255,255,255,.03));max-width:620px}
        .cp-track{height:12px;border-radius:999px;background:var(--bg2,rgba(255,255,255,.06));overflow:hidden;margin:12px 0}
        .cp-fill{height:100%;background:var(--acc);border-radius:999px}
        .cp-gnums{display:flex;justify-content:space-between;font-size:13px;color:var(--t2,#a9a49c)}
        .cp-empty{color:var(--t3,#6f6b64);font-size:14px;padding:22px 0}
        .cp-modal{position:fixed;inset:0;z-index:60;background:rgba(4,2,8,.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px}
        .cp-sheet{width:min(440px,100%);background:var(--bg1,#120e1c);border:.5px solid var(--b2,rgba(255,255,255,.12));border-radius:18px;padding:22px}
        .cp-sheet h3{font-family:var(--serif,'Cormorant Garamond',serif);font-weight:400;font-size:22px;margin:0 0 4px}
        .cp-amts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:16px 0}
        .cp-amt{border:.5px solid var(--b2,rgba(255,255,255,.14));border-radius:12px;padding:14px;cursor:pointer;background:var(--bg2,rgba(255,255,255,.04));display:flex;flex-direction:column;gap:4px;align-items:center;color:var(--t,#ece8e1)}
        .cp-amt.sel{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 16%,transparent)}
        .cp-amt .e{font-size:22px}
        .cp-amt .t{font:600 13px var(--sans)}
        .cp-amt .l{font-size:11px;color:var(--t3,#6f6b64)}
        .cp-modal textarea{width:100%;box-sizing:border-box;min-height:64px;background:var(--bg2,rgba(0,0,0,.3));border:.5px solid var(--b2,rgba(255,255,255,.14));border-radius:10px;color:var(--t,#ece8e1);padding:10px;font:400 14px var(--sans);resize:vertical}
        .cp-mfoot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px}
        .cp-mfoot .bal{font-size:12px;color:var(--t3,#6f6b64)}
        .cp-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:80;background:var(--bg1,#120e1c);border:.5px solid var(--acc);color:var(--t,#ece8e1);padding:12px 20px;border-radius:12px;font-size:13.5px;box-shadow:0 16px 48px rgba(0,0,0,.6)}
        @media(max-width:560px){.cp-headrow{margin-top:-46px}.cp-av{width:96px;height:96px;font-size:36px}.cp-actions{width:100%}}
      ` }} />

      <div className="cp-top">
        <a href="/creators" className="cp-back">← Creators</a>
        <a href="/" className="home">Secret<em style={{ fontStyle: 'italic', fontWeight: 300 }}>Xperience</em></a>
        <button className="cp-btn" style={{ height: 34, padding: '0 14px' }} onClick={share}>Share</button>
      </div>

      <div className="cp-cover" style={creator.cover_url ? { backgroundImage: `url(${creator.cover_url})` } : undefined} />

      <div className="cp-wrap">
        <div className="cp-headrow">
          <div className="cp-av" style={creator.avatar_url ? { backgroundImage: `url(${creator.avatar_url})` } : undefined}>
            {!creator.avatar_url && initial}
          </div>
          <div className="cp-id">
            <div className="cp-name">
              {creator.full_name}
              {creator.verified && <span className="cp-ver">✓ Verified</span>}
            </div>
            <div className="cp-handle">@{creator.username}{(creator.city || creator.country) && ` · ${[creator.city, creator.country].filter(Boolean).join(', ')}`}</div>
            <div className="cp-meta">
              <span><b>{followerCount.toLocaleString()}</b> followers</span>
              <span><b>{publicPosts.length}</b> posts</span>
            </div>
          </div>
          <div className="cp-actions">
            {viewer.isSelf ? (
              <a className="cp-btn acc" href="/creators/studio">Edit in Studio</a>
            ) : (
              <>
                <button className={`cp-btn ${following ? 'on' : 'acc'}`} onClick={toggleFollow} disabled={followBusy}>
                  {following ? 'Following' : '+ Follow'}
                </button>
                {giftsOn && <button className="cp-btn" onClick={openGift}>🎁 Send a gift</button>}
                {viewer.loggedIn && <a className="cp-btn" href={`/messages?to=${creator.id}`}>Message</a>}
              </>
            )}
          </div>
        </div>

        {creator.headline && <div className="cp-headline">{creator.headline}</div>}
        {creator.bio && <div className="cp-bio">{creator.bio}</div>}

        {Array.isArray(cfg.categories) && cfg.categories.filter((c: any) => c.on).length > 0 && (
          <div className="cp-chips">
            {cfg.categories.filter((c: any) => c.on).map((c: any, i: number) => <span className="cp-chip" key={i}>{c.label}</span>)}
          </div>
        )}

        {creator.external_links.length > 0 && (
          <div className="cp-links">
            {creator.external_links.map((l, i) => (
              <a className="cp-link" key={i} href={l.url} target="_blank" rel="noopener noreferrer nofollow">🔗 {l.label}</a>
            ))}
          </div>
        )}

        {/* CONTENT */}
        {show('content') && (
          <div className="cp-section">
            <h2 className="cp-h">Content</h2>
            <p className="cp-hsub">Public posts are free to view. Locked posts unlock for subscribers or with a one-off unlock.</p>
            {publicPosts.length === 0 ? (
              <div className="cp-empty">No posts yet — follow to be notified when {creator.full_name} shares something.</div>
            ) : (
              <div className="cp-grid">
                {publicPosts.map((p) => <ContentCard key={p.id} p={p} isSubscriber={isSubscriber} onLocked={() => { const t = tiers[0]; if (p.visibility === 'subscribers' && t) startSubscribe(t); else openGift() }} />)}
              </div>
            )}
          </div>
        )}

        {/* PRICING / MEMBERSHIP */}
        {show('pricing') && tiers.length > 0 && (
          <div className="cp-section">
            <h2 className="cp-h">Membership</h2>
            <p className="cp-hsub">Subscribe with tokens to unlock members-only content. Renews monthly — cancel anytime.</p>

            {subscription && (
              <div className="cp-substatus">
                <div>
                  <b>You're a {subscription.tierName} member.</b>{' '}
                  {subscription.cancelAtPeriodEnd
                    ? <span>Access ends {fmtDate(subscription.currentPeriodEnd)}.</span>
                    : <span>Renews {fmtDate(subscription.currentPeriodEnd)}.</span>}
                </div>
                {subscription.cancelAtPeriodEnd
                  ? <button className="cp-btn on" onClick={() => cancelResume(false)}>Resume membership</button>
                  : <button className="cp-btn" onClick={() => cancelResume(true)}>Cancel renewal</button>}
              </div>
            )}

            <div className="cp-tiers">
              {tiers.map((t, i) => {
                const current = subscription && subscription.tierName === t.name
                const tok = tokensForEuro(t.price)
                return (
                  <div className={`cp-tier ${t.highlight ? 'hi' : ''} ${current ? 'cur' : ''}`} key={i}>
                    {current ? <span className="tag">Your plan</span> : t.tag && <span className="tag">{t.tag}</span>}
                    <div className="tn">{t.name}</div>
                    <div className="tp">€{t.price}<small> / month · {tok} tokens</small></div>
                    <ul>{String(t.perks || '').split('\n').filter(Boolean).map((perk: string, j: number) => <li key={j}>{perk}</li>)}</ul>
                    {viewer.isSelf ? (
                      <button className="cp-support" disabled style={{ opacity: .5, cursor: 'default' }}>Your tier</button>
                    ) : current ? (
                      <button className="cp-support" disabled style={{ opacity: .6, cursor: 'default' }}>✓ Current plan</button>
                    ) : (
                      <button className="cp-support" onClick={() => startSubscribe(t)}>{subscription ? 'Switch to this' : `Subscribe · ${tok} tokens`}</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* GIFTS / GOAL */}
        {giftsOn && (
          <div className="cp-section">
            <h2 className="cp-h">Send a gift</h2>
            <p className="cp-hsub">Show your support with tokens — it goes straight to {creator.full_name.split(' ')[0]}.</p>
            <div className="cp-goal">
              {goal?.text && <div style={{ fontSize: 14, color: 'var(--t2,#a9a49c)', lineHeight: 1.6 }}>{goal.text}</div>}
              {goalTarget > 0 && (
                <>
                  <div className="cp-track"><div className="cp-fill" style={{ width: `${goalPct}%` }} /></div>
                  <div className="cp-gnums"><span><b style={{ color: 'var(--t,#ece8e1)' }}>{giftTokens.toLocaleString()}</b> tokens raised</span><span>Goal: {goalTarget.toLocaleString()}</span></div>
                </>
              )}
              {!viewer.isSelf && <button className="cp-btn acc" style={{ marginTop: 16 }} onClick={openGift}>🎁 Send a gift</button>}
            </div>
          </div>
        )}
      </div>

      {subTier && (
        <SubscribeModal
          creator={creator} tier={subTier} balance={balance} switching={!!subscription}
          onClose={() => setSubTier(null)}
          onNeedTokens={() => { window.location.href = '/tokens' }}
          onDone={(res) => {
            setSubTier(null)
            if (res.switched) { setSubscription((s) => s ? { ...s, tierName: res.tierName, cancelAtPeriodEnd: false } : s); notify(`Switched to ${res.tierName}`) }
            else { setSubscription({ tierName: res.subscription.tier_name, currentPeriodEnd: res.subscription.current_period_end, cancelAtPeriodEnd: false }); if (typeof res.newBalance === 'number') setBalance(res.newBalance); notify(`You're now a ${res.subscription.tier_name} member 🎉`) }
          }}
          notify={notify}
        />
      )}

      {giftOpen && (
        <GiftModal
          creator={creator} accent={accent} balance={balance}
          onClose={() => setGiftOpen(false)}
          onSent={(tokens, newBalance) => { setGiftTokens((g) => g + tokens); setBalance(newBalance); setGiftOpen(false); notify(`Thank you! You sent ${tokens} tokens 🎁`) }}
          onNeedTokens={() => { window.location.href = '/tokens' }}
          notify={notify}
        />
      )}

      {toast && <div className="cp-toast">{toast}</div>}
    </div>
  )
}

function ContentCard({ p, isSubscriber, onLocked }: { p: PublicPost; isSubscriber: boolean; onLocked: () => void }) {
  const locked = p.visibility === 'ppv' || (p.visibility === 'subscribers' && !isSubscriber)
  const isVideo = p.media_type === 'video'
  const blur = locked ? Math.max(8, Number(p.blur) || 8) : Number(p.blur) || 0
  const label = p.visibility === 'ppv' ? `€${(Number(p.price) || 0).toFixed(2)}` : p.visibility === 'subscribers' ? 'Members' : ''
  return (
    <div className="cp-card">
      {p.media_url
        ? /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.media_url} alt={p.title || 'post'} loading="lazy" style={blur ? { filter: `blur(${blur}px)`, transform: 'scale(1.06)' } : undefined} />
        : <div className="ph">{isVideo ? '▶' : '◧'}</div>}
      <div className="cp-ov" />
      {label && <span className="cp-badge">{label}</span>}
      {locked ? (
        <div className="cp-lock">
          <span className="lk">🔒</span>
          <button className="cp-pill" onClick={onLocked}>{p.visibility === 'ppv' ? `Unlock · €${(Number(p.price) || 0).toFixed(2)}` : 'Members only'}</button>
        </div>
      ) : (
        (p.title || p.caption) && <div className="cp-cap">{p.title || p.caption}</div>
      )}
    </div>
  )
}

function GiftModal({ creator, accent, balance, onClose, onSent, onNeedTokens, notify }: {
  creator: PublicCreator; accent: string; balance: number
  onClose: () => void; onSent: (tokens: number, newBalance: number) => void; onNeedTokens: () => void; notify: (m: string) => void
}) {
  const [sel, setSel] = useState(50)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function send() {
    setBusy(true)
    try {
      const r = await fetch('/api/creators/gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId: creator.id, amountTokens: sel, message: msg.trim() || undefined }) })
      const j = await r.json()
      if (r.status === 402) { notify('Not enough tokens — top up first'); onNeedTokens(); return }
      if (r.status === 401) { window.location.href = `/login?next=/c/${creator.username}`; return }
      if (!r.ok) { notify(j.error || 'Could not send gift'); return }
      onSent(sel, typeof j.newBalance === 'number' ? j.newBalance : Math.max(0, balance - sel))
    } catch { notify('Could not send gift') } finally { setBusy(false) }
  }

  return (
    <div className="cp-modal" onClick={onClose}>
      <div className="cp-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Send {creator.full_name.split(' ')[0]} a gift</h3>
        <div style={{ fontSize: 13, color: 'var(--t3,#6f6b64)' }}>Gifts are paid in tokens from your wallet.</div>
        <div className="cp-amts">
          {GIFT_AMOUNTS.map((a) => (
            <button key={a.tokens} className={`cp-amt ${sel === a.tokens ? 'sel' : ''}`} onClick={() => setSel(a.tokens)}>
              <span className="e">{a.emoji}</span>
              <span className="t">{a.tokens} tokens</span>
              <span className="l">{a.label}</span>
            </button>
          ))}
        </div>
        <textarea placeholder="Add a message (optional)" maxLength={200} value={msg} onChange={(e) => setMsg(e.target.value)} />
        <div className="cp-mfoot">
          <span className="bal">Your balance: {balance.toLocaleString()} tokens</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cp-btn" style={{ height: 40 }} onClick={onClose}>Cancel</button>
            <button className="cp-btn acc" style={{ height: 40 }} onClick={send} disabled={busy}>{busy ? 'Sending…' : `Send ${sel}`}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubscribeModal({ creator, tier, balance, switching, onClose, onDone, onNeedTokens, notify }: {
  creator: PublicCreator; tier: any; balance: number; switching: boolean
  onClose: () => void; onDone: (res: any) => void; onNeedTokens: () => void; notify: (m: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const tok = tokensForEuro(tier.price)
  const perks = String(tier.perks || '').split('\n').filter(Boolean)
  const low = !switching && balance < tok

  async function confirm() {
    setBusy(true)
    try {
      const r = await fetch('/api/creators/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId: creator.id, tierName: tier.name }) })
      const j = await r.json()
      if (r.status === 402) { notify('Not enough tokens — top up first'); onNeedTokens(); return }
      if (r.status === 401) { window.location.href = `/login?next=/c/${creator.username}`; return }
      if (!r.ok) { notify(j.error || 'Could not subscribe'); return }
      onDone(j)
    } catch { notify('Could not subscribe') } finally { setBusy(false) }
  }

  return (
    <div className="cp-modal" onClick={onClose}>
      <div className="cp-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>{switching ? `Switch to ${tier.name}` : `Subscribe · ${tier.name}`}</h3>
        <div style={{ fontSize: 13, color: 'var(--t3,#6f6b64)' }}>
          {switching ? 'Your new tier applies from the next renewal — no charge now.' : `€${tier.price} / month, billed as ${tok} tokens from your wallet. Renews every 30 days — cancel anytime.`}
        </div>
        {perks.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {perks.map((p, i) => <li key={i} style={{ fontSize: 13.5, color: 'var(--t2,#a9a49c)', display: 'flex', gap: 8 }}><span style={{ color: 'var(--acc)' }}>✓</span>{p}</li>)}
          </ul>
        )}
        <div className="cp-mfoot">
          <span className="bal">Balance: {balance.toLocaleString()} tokens{low && <span style={{ color: '#e0607a' }}> · need {tok}</span>}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cp-btn" style={{ height: 40 }} onClick={onClose}>Cancel</button>
            {low
              ? <button className="cp-btn acc" style={{ height: 40 }} onClick={onNeedTokens}>Get tokens</button>
              : <button className="cp-btn acc" style={{ height: 40 }} onClick={confirm} disabled={busy}>{busy ? 'Processing…' : switching ? 'Confirm switch' : `Subscribe · ${tok}`}</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
