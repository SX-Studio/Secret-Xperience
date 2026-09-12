'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface DropBox {
  id: string;
  name: string;
  public_code: string;
}

type KycState = 'none' | 'pending' | 'verified' | 'rejected';

export default function DropForm({ kyc, boxes }: { kyc: KycState; boxes: DropBox[] }) {
  if (kyc !== 'verified') return <KycGate initial={kyc} />;
  if (boxes.length === 0) {
    return (
      <p style={{ color: 'var(--ink3)', fontSize: 14 }}>
        You&apos;re verified, but not a creator in any box yet. Ask a box admin to invite you.
      </p>
    );
  }
  return <Uploader boxes={boxes} />;
}

function KycGate({ initial }: { initial: KycState }) {
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<KycState>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state === 'pending') {
    return (
      <div style={{ color: 'var(--ink2)', fontSize: 14 }}>
        <b>Verification pending.</b> You can upload once your identity is verified.
      </div>
    );
  }

  async function submit() {
    setError(null);
    if (!consent) {
      setError('You must confirm the statement to continue.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ consent: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      setState('pending');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p style={{ color: 'var(--ink2)', fontSize: 14 }}>
        Before you can upload, you must verify your identity and confirm consent.
      </p>
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--ink2)' }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
        <span>
          I confirm I am 18+, that I own or have rights to all content I upload, that everyone depicted has consented,
          and I agree to the platform terms.
        </span>
      </label>
      <button onClick={submit} disabled={busy} style={btn}>
        {busy ? 'Submitting…' : 'Submit for verification'}
      </button>
      {error && <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  );
}

function Uploader({ boxes }: { boxes: DropBox[] }) {
  const [boxId, setBoxId] = useState(boxes[0].id);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('200');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post() {
    setError(null);
    setResult(null);
    if (!title.trim()) return setError('Add a title.');
    if (files.length === 0) return setError('Select at least one file.');
    const priceTokens = Math.max(0, parseInt(price, 10) || 0);

    setBusy(true);
    try {
      const supabase = createClient();

      const createRes = await fetch('/api/content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ boxId, title: title.trim(), description, priceTokens }),
      });
      if (!createRes.ok) throw new Error(await createRes.text());
      const { content } = await createRes.json();

      const uploaded: { kind: string; storagePath: string; bytes: number }[] = [];
      for (const file of files) {
        const kind = file.type.startsWith('video') ? 'video' : 'image';
        const ext = file.name.split('.').pop() || (kind === 'video' ? 'mp4' : 'jpg');
        const urlRes = await fetch(`/api/content/${content.id}/upload-url`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ext, kind }),
        });
        if (urlRes.status === 503) throw new Error('Storage is not configured yet — ask the admin.');
        if (!urlRes.ok) throw new Error('Could not get upload URL');
        const { path, token, bucket } = await urlRes.json();

        const up = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file);
        if (up.error) throw new Error(`Upload failed: ${up.error.message}`);
        uploaded.push({ kind, storagePath: path, bytes: file.size });
      }

      const finRes = await fetch(`/api/content/${content.id}/finalize`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ files: uploaded }),
      });
      if (!finRes.ok) throw new Error(await finRes.text());
      const fin = await finRes.json();
      setResult(
        fin.status === 'approved'
          ? `Posted & approved (${content.public_code}).`
          : `Posted ${content.public_code} → ${fin.status.replace('_', ' ')}.`,
      );
      setFiles([]);
      setTitle('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Post failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label style={label}>Box</label>
      <select value={boxId} onChange={(e) => setBoxId(e.target.value)} style={input}>
        {boxes.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.public_code})
          </option>
        ))}
      </select>

      <label style={label}>Photos / videos</label>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        style={{ ...input, padding: 8 }}
      />
      {files.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4 }}>{files.length} file(s) selected</div>
      )}

      <label style={label}>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunset Session" style={input} />

      <label style={label}>Description</label>
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="New collection" style={input} />

      <label style={label}>Price (tokens)</label>
      <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" style={input} />

      <button onClick={post} disabled={busy} style={btn}>
        {busy ? 'Posting…' : 'Post to Box'}
      </button>
      <p style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 10 }}>
        Content is blurred and stays unpublished until screening completes.
      </p>
      {result && <p style={{ color: 'var(--ok)', fontSize: 13, marginTop: 8 }}>{result}</p>}
      {error && <p style={{ color: 'var(--bad)', fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  );
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink2)',
  margin: '12px 0 6px',
};
const input: React.CSSProperties = {
  width: '100%',
  background: 'var(--surf)',
  border: '1px solid var(--line2)',
  borderRadius: 11,
  padding: '11px 13px',
  fontSize: 14,
  color: 'var(--ink)',
  fontFamily: 'inherit',
  outline: 'none',
};
const btn: React.CSSProperties = {
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  background: 'var(--ember)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 11,
  padding: '12px 15px',
  marginTop: 16,
};
