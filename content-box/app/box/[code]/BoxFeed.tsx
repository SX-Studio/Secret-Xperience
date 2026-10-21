'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface FeedItem {
  id: string;
  code: string;
  title: string;
  price: number;
  creatorCode: string;
  photos: number;
  videos: number;
  blurUrl: string | null;
  grad: string;
  rented: boolean;
}

export default function BoxFeed({
  boxName,
  boxCode,
  balance,
  items,
}: {
  boxName: string;
  boxCode: string;
  balance: number;
  items: FeedItem[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const total = useMemo(
    () => selectedIds.reduce((s, id) => s + (items.find((i) => i.id === id)?.price ?? 0), 0),
    [selectedIds, items],
  );

  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  }

  async function rent(ids: string[]) {
    if (ids.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contentIds: ids }),
      });
      if (res.status === 402) {
        flash('Not enough tokens — top up in your wallet.');
        setTimeout(() => router.push('/wallet'), 1200);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      router.push('/rentals');
    } catch {
      flash('Could not complete the rental.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px 120px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg,var(--ember),#8f2f1c)',
            color: '#fff',
            fontSize: 20,
          }}
        >
          ✦
        </div>
        <div>
          <div className="serif" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.1 }}>
            {boxName}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
            {boxCode} · {items.length} drops
          </div>
        </div>
        <a
          href="/wallet"
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--gold-soft)',
            color: 'var(--gold)',
            borderRadius: 999,
            padding: '6px 11px',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ◈ {balance}
        </a>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink3)' }}>
          <div className="serif" style={{ fontSize: 19, color: 'var(--ink2)', marginBottom: 4 }}>
            No drops yet
          </div>
          <p style={{ fontSize: 13, margin: 0 }}>Approved content from creators will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {items.map((it) => (
            <Card
              key={it.id}
              item={it}
              selected={!!selected[it.id]}
              onToggle={() => setSelected((s) => ({ ...s, [it.id]: !s[it.id] }))}
              onRent={() => rent([it.id])}
              busy={busy}
            />
          ))}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 18,
            width: 'min(490px, calc(100% - 32px))',
            background: 'var(--ink)',
            color: 'var(--app)',
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 14px 34px -12px rgba(0,0,0,.6)',
          }}
        >
          <div style={{ fontSize: 12.5, lineHeight: 1.3 }}>
            Rent selected
            <b className="mono" style={{ display: 'block', fontSize: 15, color: 'var(--gold)' }}>
              {total} tokens
            </b>
          </div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''}
          </div>
          <button
            onClick={() => rent(selectedIds)}
            disabled={busy}
            style={{
              marginLeft: 'auto',
              border: 'none',
              cursor: 'pointer',
              background: 'var(--ember)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13.5,
              borderRadius: 11,
              padding: '10px 15px',
            }}
          >
            {busy ? '…' : 'Rent 24h'}
          </button>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 90,
            background: 'var(--ink)',
            color: 'var(--app)',
            fontSize: 13,
            fontWeight: 500,
            padding: '11px 18px',
            borderRadius: 12,
            boxShadow: 'var(--shadow)',
            maxWidth: '86%',
            textAlign: 'center',
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

function Card({
  item,
  selected,
  onToggle,
  onRent,
  busy,
}: {
  item: FeedItem;
  selected: boolean;
  onToggle: () => void;
  onRent: () => void;
  busy: boolean;
}) {
  return (
    <div
      style={{
        background: 'var(--surf)',
        border: `1px solid ${selected ? 'var(--ember)' : 'var(--line)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: selected ? '0 0 0 1px var(--ember), var(--shadow)' : 'var(--shadow)',
      }}
    >
      <div
        onClick={item.rented ? undefined : onToggle}
        style={{ position: 'relative', height: 210, cursor: item.rented ? 'default' : 'pointer', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: item.blurUrl ? `url(${item.blurUrl})` : item.grad,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: item.blurUrl ? 'none' : 'blur(26px) saturate(1.2) brightness(.9)',
            transform: item.blurUrl ? 'none' : 'scale(1.18)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.85)' }}>
          <svg viewBox="0 0 24 24" width="70" height="70" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="3" y="4" width="18" height="16" rx="2.5" />
            <circle cx="9" cy="10" r="2" />
            <path d="M4 18l5-4 3 2 4-4 4 4" />
          </svg>
        </div>
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span
            className="mono"
            style={{ fontSize: 10, background: 'rgba(8,9,14,.55)', backdropFilter: 'blur(6px)', color: '#fff', padding: '4px 8px', borderRadius: 6 }}
          >
            {item.code}
          </span>
        </div>
        {!item.rented && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: `1.5px solid ${selected ? 'var(--ember)' : 'rgba(255,255,255,.7)'}`,
              background: selected ? 'var(--ember)' : 'rgba(8,9,14,.4)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 15,
            }}
          >
            {selected ? '✓' : ''}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '12px 14px',
            background: 'linear-gradient(to top,rgba(6,7,12,.82),transparent)',
            color: '#fff',
            fontSize: 12,
          }}
        >
          🔒 {item.rented ? 'Rented — view in My Rentals' : 'Blurred preview · rent to view'}
        </div>
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span className="cid mono" style={{ fontSize: 10, color: 'var(--ink3)', marginLeft: 'auto' }}>
            {item.creatorCode}
          </span>
        </div>
        <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 3 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', display: 'flex', gap: 12, marginBottom: 12 }}>
          <span>{item.photos} photos</span>
          <span>{item.videos} videos</span>
          <span>24h access</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono" style={{ fontWeight: 500, fontSize: 15, color: 'var(--gold)' }}>
            ◈ {item.price}
          </span>
          {item.rented ? (
            <a
              href="/rentals"
              style={{
                marginLeft: 'auto',
                background: 'var(--surf2)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                fontWeight: 600,
                fontSize: 13.5,
                borderRadius: 11,
                padding: '10px 15px',
                textDecoration: 'none',
              }}
            >
              View
            </a>
          ) : (
            <button
              onClick={onRent}
              disabled={busy}
              style={{
                marginLeft: 'auto',
                border: 'none',
                cursor: 'pointer',
                background: 'var(--ember)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13.5,
                borderRadius: 11,
                padding: '10px 15px',
              }}
            >
              Rent 24h
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
