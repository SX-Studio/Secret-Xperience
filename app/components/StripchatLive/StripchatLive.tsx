'use client'

import { useEffect } from 'react'

// Colours the bottom line of the Stripchat profile cards green when the model
// is actually live (red = offline). Cards are static HTML in page.tsx marked
// with data-sc="<username>"; status comes from /api/stripchat-status (60s cache).
export default function StripchatLive() {
  useEffect(() => {
    let cancelled = false

    async function apply() {
      try {
        const res = await fetch('/api/stripchat-status')
        if (!res.ok || cancelled) return
        const status: Record<string, boolean> = await res.json()
        document.querySelectorAll<HTMLElement>('[data-sc]').forEach(card => {
          const live = status[card.dataset.sc || ''] === true
          let line = card.querySelector<HTMLElement>('.sc-line')
          if (!line) {
            line = document.createElement('span')
            line.className = 'sc-line'
            line.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:3px;z-index:3;transition:background .3s;'
            card.appendChild(line)
          }
          line.style.background = live ? '#22e584' : '#c8102e'
          line.style.boxShadow = live ? '0 0 10px rgba(34,229,132,0.8)' : 'none'
          const badge = card.querySelector<HTMLElement>('.sc-badge')
          if (badge) {
            badge.style.background = live ? 'rgba(24,178,102,0.95)' : 'rgba(200,16,46,0.92)'
            badge.textContent = ''
            const dot = document.createElement('span')
            dot.style.cssText = `width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;margin-right:5px;${live ? 'animation:livePulse 1.6s ease-in-out infinite;' : 'opacity:.6;'}`
            badge.appendChild(dot)
            badge.appendChild(document.createTextNode(live ? 'LIVE' : 'OFFLINE'))
          }
        })
      } catch { /* keep default red line on failure */ }
    }

    apply()
    const iv = setInterval(apply, 90_000)
    return () => { cancelled = true; clearInterval(iv) }
  }, [])

  return null
}
