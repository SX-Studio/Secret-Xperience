'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '../../lib/supabase'

interface ChatMsg { id: string; username: string; body: string; is_tip?: boolean; tip_amount?: number | null }

const TIP_AMOUNTS = [10, 25, 50, 100, 250]

export default function WatchPage({ params }: { params: { id: string } }) {
  const streamId = params.id
  const [phase, setPhase] = useState<'loading' | 'live' | 'ended' | 'error'>('loading')
  const [stream, setStream] = useState<any>(null)
  const [viewers, setViewers] = useState(0)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [me, setMe] = useState<{ id: string; name: string } | null>(null)
  const [ageOk, setAgeOk] = useState(false)
  const [muted, setMuted] = useState(true)
  const [balance, setBalance] = useState<number | null>(null)
  const [tipping, setTipping] = useState<number | null>(null)
  const [tipError, setTipError] = useState<string | null>(null)

  const videoRef        = useRef<HTMLVideoElement>(null)
  const roomRef         = useRef<any>(null)
  const chatEndRef      = useRef<HTMLDivElement>(null)
  const pendingVideoRef = useRef<any>(null)  // track received before video element rendered

  useEffect(() => {
    try { if (localStorage.getItem('sx_age_ok') === '1') setAgeOk(true) } catch {}
  }, [])

  // Load stream + viewer identity
  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: s } = await supabase
        .from('live_streams')
        .select('id, title, status, provider_id, recording_url, profiles:provider_id(full_name, username, avatar_url)')
        .eq('id', streamId).maybeSingle()
      if (!s) { setPhase('error'); return }
      setStream(s)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: p } = await supabase.from('profiles').select('full_name, username').eq('id', session.user.id).maybeSingle()
        setMe({ id: session.user.id, name: p?.full_name || p?.username || 'Guest' })
        const { data: w } = await supabase.from('user_wallets').select('balance').eq('user_id', session.user.id).maybeSingle()
        setBalance(w?.balance ?? 0)
      }
      if (s.status !== 'live') { setPhase('ended'); return }
    })()
  }, [streamId])

  const scrollChat = useCallback(() => {
    requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }, [])

  // Connect to LiveKit once age-confirmed and stream is live
  useEffect(() => {
    if (!ageOk || !stream || stream.status !== 'live') return
    let room: any
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/live/token', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamId, displayName: me?.name || 'Guest' }),
        })
        const data = await res.json()
        if (!res.ok) { setPhase(data.ended ? 'ended' : 'error'); return }

        const { Room, RoomEvent, Track } = await import('livekit-client')
        room = new Room({ adaptiveStream: true })
        roomRef.current = room

        room.on(RoomEvent.TrackSubscribed, (track: any) => {
          if (track.kind === Track.Kind.Video) {
            if (videoRef.current) {
              track.attach(videoRef.current)
              videoRef.current.muted = true
              videoRef.current.play().catch(() => {})
            } else {
              // Video element isn't rendered yet (phase still 'loading').
              // Store it — the phase-change useEffect will attach it.
              pendingVideoRef.current = track
            }
          }
          if (track.kind === Track.Kind.Audio) track.attach()
        })
        room.on(RoomEvent.ParticipantConnected, () => setViewers(room.numParticipants))
        room.on(RoomEvent.ParticipantDisconnected, () => setViewers(room.numParticipants))
        room.on(RoomEvent.Disconnected, () => { if (!cancelled) setPhase('ended') })

        await room.connect(data.url, data.token)
        // Attach any already-published tracks (broadcaster started before viewer joined).
        room.remoteParticipants.forEach((p: any) => {
          p.trackPublications.forEach((pub: any) => {
            if (pub.track) {
              if (pub.track.kind === Track.Kind.Video) {
                if (videoRef.current) pub.track.attach(videoRef.current)
                else pendingVideoRef.current = pub.track
              }
              if (pub.track.kind === Track.Kind.Audio) pub.track.attach()
            }
          })
        })
        setViewers(room.numParticipants)
        if (!cancelled) setPhase('live')
      } catch {
        if (!cancelled) setPhase('error')
      }
    })()
    return () => { cancelled = true; try { room?.disconnect() } catch {} }
  }, [ageOk, stream, streamId, me])

  // Once phase becomes 'live' the video element renders; attach any track that arrived earlier.
  useEffect(() => {
    if (phase === 'live' && pendingVideoRef.current && videoRef.current) {
      const track = pendingVideoRef.current
      pendingVideoRef.current = null
      track.attach(videoRef.current)
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {})
    }
  }, [phase])

  // Chat subscription
  useEffect(() => {
    if (!ageOk || !stream) return
    const supabase = createClient()
    supabase.from('live_chat_messages')
      .select('id, username, body, is_tip, tip_amount')
      .eq('stream_id', streamId).order('created_at', { ascending: true }).limit(100)
      .then(({ data }) => { setMessages(data || []); scrollChat() })
    const ch = supabase.channel(`live_chat_${streamId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat_messages', filter: `stream_id=eq.${streamId}` },
        payload => { setMessages(prev => [...prev, payload.new as ChatMsg]); scrollChat() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [ageOk, stream, streamId, scrollChat])

  async function sendChat() {
    const body = chatInput.trim()
    if (!body) return
    if (!me) { window.location.href = `/login?next=/livestreams/${streamId}`; return }
    setChatInput('')
    const supabase = createClient()
    await supabase.from('live_chat_messages').insert({ stream_id: streamId, user_id: me.id, username: me.name, body })
  }

  async function sendTip(amount: number) {
    if (!me) { window.location.href = `/login?next=/livestreams/${streamId}`; return }
    setTipError(null)
    setTipping(amount)
    try {
      const res = await fetch('/api/live/tip', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, amount, message: chatInput.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setTipError(data.error || 'Tip failed.'); return }
      setBalance(data.balance)
      setChatInput('')
    } finally {
      setTipping(null)
    }
  }

  function confirmAge() { try { localStorage.setItem('sx_age_ok', '1') } catch {}; setAgeOk(true) }

  async function enableSound() {
    try { await roomRef.current?.startAudio() } catch {}
    if (videoRef.current) videoRef.current.muted = false
    setMuted(false)
  }

  const host = stream?.profiles?.full_name || stream?.profiles?.username || 'SecretXperience host'

  // ── Age gate ──
  if (!ageOk && stream && stream.status === 'live') {
    return (
      <Shell>
        <div className="wp-age">
          <i className="ti ti-shield-lock" style={{ fontSize: 34, color: '#c5a05a' }} />
          <h2>Adults only</h2>
          <p>This is a live adult broadcast. By entering you confirm you are 18 or older and agree to our <a href="/terms">Terms</a>.</p>
          <button onClick={confirmAge}>I am 18+ — Enter</button>
          <a href="/livestreams" className="wp-age-back">Go back</a>
        </div>
      </Shell>
    )
  }

  if (phase === 'loading') return <Shell><div className="wp-center"><div className="wp-spin" /></div></Shell>
  if (phase === 'error')   return <Shell><div className="wp-center"><i className="ti ti-wifi-off" style={{ fontSize: 30 }} /><p>Stream unavailable.</p><a href="/livestreams" className="wp-cta">Browse live shows</a></div></Shell>
  if (phase === 'ended') {
    return (
      <Shell>
        <div className="wp-center">
          <i className="ti ti-player-stop" style={{ fontSize: 30, color: '#8c8880' }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 400, fontSize: 26 }}>This show has ended</h2>
          {stream?.recording_url
            ? <video src={stream.recording_url} controls playsInline className="wp-replay" />
            : <p>Thanks for stopping by. Check who else is live right now.</p>}
          <a href="/livestreams" className="wp-cta">Browse live shows →</a>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="wp">
        <div className="wp-main">
          <div className="wp-video-wrap">
            <video ref={videoRef} className="wp-video" autoPlay playsInline muted />
            <div className="wp-overlay">
              <div className="wp-live"><span className="wp-dot" /> LIVE</div>
              <div className="wp-viewers"><i className="ti ti-eye" /> {viewers}</div>
            </div>
            {muted && phase === 'live' && (
              <button className="wp-unmute" onClick={enableSound}>
                <i className="ti ti-volume-off" /> Tap for sound
              </button>
            )}
          </div>
          <div className="wp-meta">
            <div>
              <h1 className="wp-title">{stream?.title}</h1>
              <div className="wp-host"><i className="ti ti-user-circle" /> {host}</div>
            </div>
            <a href="/tokens" className="wp-buy"><i className="ti ti-coins" /> Buy Tokens</a>
          </div>
        </div>

        <aside className="wp-chatbox">
          <div className="wp-chat-head"><i className="ti ti-message-circle" /> Live chat</div>
          <div className="wp-chat-scroll">
            {messages.length === 0 && <div className="wp-chat-empty">Be the first to say hello 👋</div>}
            {messages.map(m => (
              <div key={m.id} className={`wp-msg${m.is_tip ? ' wp-msg-tip' : ''}`}>
                <span className="wp-msg-user">{m.username}</span>
                {m.is_tip ? <span className="wp-msg-tipamt"><i className="ti ti-coins" /> {m.tip_amount}</span> : null}
                <span className="wp-msg-body">{m.body}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {me && stream?.provider_id !== me.id && (
            <div className="wp-tips">
              <div className="wp-tips-head">
                <span><i className="ti ti-coins" /> Tip the host</span>
                <span className="wp-tips-bal">{balance ?? '…'} tokens</span>
              </div>
              <div className="wp-tips-row">
                {TIP_AMOUNTS.map(a => (
                  <button key={a} onClick={() => sendTip(a)} disabled={tipping !== null || (balance !== null && balance < a)}>
                    {tipping === a ? '…' : a}
                  </button>
                ))}
              </div>
              {tipError && (
                <div className="wp-tips-err">
                  {tipError}{tipError.startsWith('Not enough') && <> <a href="/tokens">Buy tokens</a></>}
                </div>
              )}
            </div>
          )}
          <div className="wp-chat-input">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={me ? 'Say something…' : 'Log in to chat'} maxLength={300} />
            <button onClick={sendChat}><i className="ti ti-send" /></button>
          </div>
        </aside>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{styles}</style>
      <div className="wp-page">
        <a href="/livestreams" className="wp-back"><i className="ti ti-arrow-left" /> Live shows</a>
        {children}
      </div>
    </>
  )
}

const styles = `
*{box-sizing:border-box}
.wp-page{min-height:100vh;background:#050505;color:#ece8e1;font-family:'Poppins',sans-serif;padding:14px 24px 48px}
.wp-back{display:inline-flex;align-items:center;gap:6px;color:#8c8880;font:400 13px 'Poppins';text-decoration:none}
.wp-back:hover{color:#ece8e1}
.wp{max-width:1180px;margin:16px auto 0;display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start}
.wp-video-wrap{position:relative;background:#000;border-radius:16px;overflow:hidden;aspect-ratio:16/9;border:0.5px solid rgba(255,255,255,.08)}
.wp-video{width:100%;height:100%;object-fit:contain;background:#000}
.wp-overlay{position:absolute;top:12px;left:12px;display:flex;gap:8px}
.wp-live{display:inline-flex;align-items:center;gap:6px;background:rgba(239,68,68,.92);color:#fff;padding:5px 11px;border-radius:20px;font:700 11px 'Poppins';letter-spacing:.06em}
.wp-dot{width:7px;height:7px;border-radius:50%;background:#fff;animation:wpdot 1.3s infinite}
@keyframes wpdot{0%,100%{opacity:1}50%{opacity:.25}}
.wp-viewers{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.55);color:#fff;padding:5px 10px;border-radius:20px;font:600 12px 'Poppins';backdrop-filter:blur(6px)}
.wp-unmute{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;gap:7px;background:rgba(197,160,90,.95);color:#0a0a0a;border:none;padding:10px 18px;border-radius:30px;font:700 13px 'Poppins';cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.4);animation:wppulse 1.8s ease-in-out infinite}
@keyframes wppulse{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.05)}}
.wp-unmute:hover{background:#e8c97a}
.wp-meta{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:14px;flex-wrap:wrap}
.wp-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:400;line-height:1.1}
.wp-host{color:#8c8880;font-size:13px;display:flex;align-items:center;gap:6px;margin-top:4px}
.wp-buy{display:inline-flex;align-items:center;gap:7px;background:linear-gradient(90deg,#c5a05a,#e8c97a);color:#0a0a0a;padding:11px 18px;border-radius:11px;font:700 13px 'Poppins';text-decoration:none;white-space:nowrap}
.wp-buy:hover{filter:brightness(1.05)}
.wp-chatbox{background:#0c0c0c;border:0.5px solid rgba(255,255,255,.08);border-radius:16px;display:flex;flex-direction:column;height:600px;overflow:hidden}
.wp-chat-head{padding:14px 16px;border-bottom:0.5px solid rgba(255,255,255,.06);font:600 12px 'Poppins';color:#c5a05a;display:flex;align-items:center;gap:7px}
.wp-chat-scroll{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:9px}
.wp-chat-empty{color:#4c4a47;font-size:12.5px;text-align:center;margin:auto 0}
.wp-msg{font-size:13px;line-height:1.45}
.wp-msg-user{color:#c5a05a;font-weight:600;margin-right:6px}
.wp-msg-body{color:#d8d4cc}
.wp-msg-tip{background:rgba(197,160,90,.1);border-radius:8px;padding:6px 8px}
.wp-msg-tipamt{color:#e8cc88;font-weight:700;margin-right:6px}
.wp-tips{padding:12px;border-top:0.5px solid rgba(255,255,255,.06)}
.wp-tips-head{display:flex;justify-content:space-between;align-items:center;font:600 12px 'Poppins';color:#e8cc88;margin-bottom:8px}
.wp-tips-bal{color:#8c8880;font-weight:400}
.wp-tips-row{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.wp-tips-row button{background:rgba(197,160,90,.12);border:0.5px solid rgba(197,160,90,.35);border-radius:8px;color:#e8cc88;padding:8px 0;font:700 13px 'Poppins';cursor:pointer}
.wp-tips-row button:hover:not(:disabled){background:rgba(197,160,90,.22)}
.wp-tips-row button:disabled{opacity:.4;cursor:not-allowed}
.wp-tips-err{margin-top:8px;font:400 12px 'Poppins';color:#f87171}
.wp-tips-err a{color:#e8cc88}
.wp-chat-input{display:flex;gap:8px;padding:12px;border-top:0.5px solid rgba(255,255,255,.06)}
.wp-chat-input input{flex:1;background:rgba(255,255,255,.04);border:0.5px solid rgba(255,255,255,.1);border-radius:9px;color:#ece8e1;padding:9px 12px;font:400 13px 'Poppins';outline:none}
.wp-chat-input button{background:#c5a05a;border:none;border-radius:9px;color:#050505;width:40px;cursor:pointer;font-size:15px}
.wp-center{max-width:520px;margin:80px auto;text-align:center;color:#8c8880;display:flex;flex-direction:column;gap:14px;align-items:center}
.wp-cta{display:inline-block;margin-top:8px;color:#c5a05a;text-decoration:none;font-weight:600}
.wp-replay{width:100%;border-radius:14px;margin-top:10px}
.wp-spin{width:32px;height:32px;border:2.5px solid rgba(197,160,90,.2);border-top-color:#c5a05a;border-radius:50%;animation:wpspin .8s linear infinite}
@keyframes wpspin{to{transform:rotate(360deg)}}
.wp-age{max-width:440px;margin:80px auto;text-align:center;display:flex;flex-direction:column;gap:14px;align-items:center;background:#0c0c0c;border:0.5px solid rgba(255,255,255,.08);border-radius:18px;padding:40px 32px}
.wp-age h2{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:28px}
.wp-age p{color:#8c8880;font-size:13px;line-height:1.6}
.wp-age a{color:#c5a05a}
.wp-age button{background:linear-gradient(90deg,#c5a05a,#e8c97a);color:#0a0a0a;border:none;border-radius:11px;padding:13px 28px;font:700 14px 'Poppins';cursor:pointer}
.wp-age-back{color:#8c8880 !important;font-size:12px;text-decoration:none}
@media(max-width:820px){.wp{grid-template-columns:1fr}.wp-chatbox{height:380px}}
`
