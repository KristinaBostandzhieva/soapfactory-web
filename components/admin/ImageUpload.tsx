'use client';

import { useRef, useState } from 'react';

const inputCls = 'border border-[var(--border)] rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--primary)]';

// Image field with file upload + manual URL. The text input carries the value
// into the surrounding form (via its `name`), so it works with the existing forms.
export default function ImageUpload({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.error || 'Грешка при качване.'); return; }
      setUrl(d.url);
    } catch {
      setError('Грешка при качване.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Качи файл или постави URL…" className={`${inputCls} flex-1`} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="px-4 rounded text-[13px] font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors whitespace-nowrap disabled:opacity-60">
          {uploading ? 'Качване…' : '📁 Качи снимка'}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} className="hidden" />
      </div>
      {error && <p className="text-[12px] text-red-600 mt-1">{error}</p>}
      {url && (
        <div className="mt-2 flex items-center gap-3">
          <img src={url} alt="" className="rounded border border-[var(--border)] object-cover" style={{ height: 80, width: 80 }} />
          <button type="button" onClick={() => setUrl('')} className="text-[12px] text-[var(--text-muted)] underline hover:text-[var(--primary)]">Премахни</button>
        </div>
      )}
    </div>
  );
}
