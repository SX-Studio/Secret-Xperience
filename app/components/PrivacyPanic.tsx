'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

// Privacy "boss key": hold Ctrl+Alt and tap S then X (Ctrl+Alt+"sx") to instantly
// hide the whole site behind an innocuous, fully playable 2048 game. The same
// shortcut toggles back. State is in-memory only (a reload shows the site again).

type Board = number[][]
const SIZE = 4
const empty = (): Board => Array.from({ length: SIZE }, () => Array(SIZE).fill(0))

function addTile(b: Board): Board {
  const cells: [number, number][] = []
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (b[r][c] === 0) cells.push([r, c])
  if (!cells.length) return b
  const [r, c] = cells[Math.floor(Math.random() * cells.length)]
  const nb = b.map((row) => row.slice())
  nb[r][c] = Math.random() < 0.9 ? 2 : 4
  return nb
}
function slide(row: number[]): [number[], number] {
  const arr = row.filter((v) => v)
  let gained = 0
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) { arr[i] *= 2; gained += arr[i]; arr.splice(i + 1, 1) }
  }
  while (arr.length < SIZE) arr.push(0)
  return [arr, gained]
}
const transpose = (b: Board): Board => b[0].map((_, c) => b.map((row) => row[c]))
const same = (a: Board, b: Board) => a.every((row, r) => row.every((v, c) => v === b[r][c]))

function move(b: Board, dir: 'left' | 'right' | 'up' | 'down'): [Board, number, boolean] {
  let work = b.map((row) => row.slice())
  const vertical = dir === 'up' || dir === 'down'
  const reverse = dir === 'right' || dir === 'down'
  if (vertical) work = transpose(work)
  let gained = 0
  work = work.map((row) => {
    const r = reverse ? row.slice().reverse() : row
    const [slid, g] = slide(r)
    gained += g
    return reverse ? slid.reverse() : slid
  })
  if (vertical) work = transpose(work)
  return [work, gained, !same(work, b)]
}
function canMove(b: Board): boolean {
  for (const d of ['left', 'right', 'up', 'down'] as const) { if (move(b, d)[2]) return true }
  return false
}

const TILE: Record<number, { bg: string; fg: string }> = {
  0: { bg: 'rgba(238,228,218,0.35)', fg: '#776e65' },
  2: { bg: '#eee4da', fg: '#776e65' }, 4: { bg: '#ede0c8', fg: '#776e65' },
  8: { bg: '#f2b179', fg: '#f9f6f2' }, 16: { bg: '#f59563', fg: '#f9f6f2' },
  32: { bg: '#f67c5f', fg: '#f9f6f2' }, 64: { bg: '#f65e3b', fg: '#f9f6f2' },
  128: { bg: '#edcf72', fg: '#f9f6f2' }, 256: { bg: '#edcc61', fg: '#f9f6f2' },
  512: { bg: '#edc850', fg: '#f9f6f2' }, 1024: { bg: '#edc53f', fg: '#f9f6f2' },
  2048: { bg: '#edc22e', fg: '#f9f6f2' },
}

export default function PrivacyPanic() {
  const [hidden, setHidden] = useState(false)
  const [board, setBoard] = useState<Board>(() => addTile(addTile(empty())))
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const boardRef = useRef(board)
  boardRef.current = board

  const doMove = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    setBoard((cur) => {
      const [nb, gained, changed] = move(cur, dir)
      if (!changed) return cur
      const withTile = addTile(nb)
      if (gained) setScore((s) => s + gained)
      if (!canMove(withTile)) setOver(true)
      return withTile
    })
  }, [])

  const newGame = useCallback(() => { setBoard(addTile(addTile(empty()))); setScore(0); setOver(false) }, [])

  // Boss-key toggle: Ctrl+Alt then S, then X within ~1.2s.
  useEffect(() => {
    let sAt = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        if (e.code === 'KeyS') { sAt = Date.now() }
        else if (e.code === 'KeyX') {
          if (Date.now() - sAt < 1200) { e.preventDefault(); e.stopPropagation(); sAt = 0; setHidden((h) => !h) }
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  // While hidden: neutralise the tab, lock the page, capture arrow keys for the game.
  useEffect(() => {
    if (!hidden) return
    const prevTitle = document.title
    document.title = '2048'
    document.documentElement.style.overflow = 'hidden'
    const onArrow = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      }
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]) }
    }
    window.addEventListener('keydown', onArrow)
    return () => { document.title = prevTitle; document.documentElement.style.overflow = ''; window.removeEventListener('keydown', onArrow) }
  }, [hidden, doMove])

  if (!hidden) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2147483647, background: '#faf8ef',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      fontFamily: "'Clear Sans','Helvetica Neue',Arial,sans-serif", color: '#776e65',
      padding: '28px 16px', overflow: 'auto',
    }}>
      <div style={{ width: 'min(460px,100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <h1 style={{ fontSize: 'clamp(40px,9vw,64px)', fontWeight: 800, margin: 0, lineHeight: 1 }}>2048</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: '#bbada0', borderRadius: 6, padding: '6px 16px', textAlign: 'center', color: '#eee4da' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Score</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{score}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#8f8577' }}>Join the tiles, get to <b>2048!</b></p>
          <button onClick={newGame} style={{ background: '#8f7a66', color: '#f9f6f2', border: 'none', borderRadius: 6, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>New Game</button>
        </div>

        <div style={{ position: 'relative', background: '#bbada0', borderRadius: 8, padding: 10, aspectRatio: '1', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {board.flat().map((v, i) => {
            const t = TILE[v] || TILE[2048]
            return (
              <div key={i} style={{
                background: t.bg, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: t.fg,
                fontSize: v >= 1024 ? 'clamp(18px,5vw,30px)' : v >= 128 ? 'clamp(22px,6vw,34px)' : 'clamp(26px,7vw,40px)',
              }}>{v || ''}</div>
            )
          })}
          {over && (
            <div style={{ position: 'absolute', inset: 10, background: 'rgba(238,228,218,0.73)', borderRadius: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ fontSize: 30, fontWeight: 800 }}>Game over!</div>
              <button onClick={newGame} style={{ background: '#8f7a66', color: '#f9f6f2', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Try again</button>
            </div>
          )}
        </div>

        {/* touch controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,56px)', gap: 8, justifyContent: 'center', marginTop: 18 }}>
          <span /><Arrow label="▲" onClick={() => doMove('up')} /><span />
          <Arrow label="◀" onClick={() => doMove('left')} />
          <Arrow label="▼" onClick={() => doMove('down')} />
          <Arrow label="▶" onClick={() => doMove('right')} />
        </div>

        <p style={{ marginTop: 20, fontSize: 12.5, color: '#a89f92', lineHeight: 1.6 }}>
          <b>HOW TO PLAY:</b> Use your arrow keys to move the tiles. Tiles with the same number merge into one when they touch.
        </p>
      </div>
    </div>
  )
}

function Arrow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: 56, height: 56, borderRadius: 8, border: 'none', background: '#bbada0', color: '#f9f6f2',
      fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{label}</button>
  )
}
