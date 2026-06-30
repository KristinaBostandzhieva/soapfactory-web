'use client';

import { useEffect, useRef } from 'react';

const TOOLBAR: { label: string; title: string; cmd: string; val?: string }[] = [
  { label: 'B',  title: 'Удебелен',          cmd: 'bold' },
  { label: 'I',  title: 'Курсив',            cmd: 'italic' },
  { label: 'H2', title: 'Заглавие 2',        cmd: 'formatBlock', val: '<h2>' },
  { label: 'H3', title: 'Заглавие 3',        cmd: 'formatBlock', val: '<h3>' },
  { label: 'P',  title: 'Абзац',             cmd: 'formatBlock', val: '<p>' },
  { label: '•',  title: 'Списък с точки',    cmd: 'insertUnorderedList' },
  { label: '1.', title: 'Номериран списък',  cmd: 'insertOrderedList' },
];

export default function RichTextEditor({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue || '';
    }
    if (hiddenRef.current) {
      hiddenRef.current.value = defaultValue || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val ?? undefined);
    editorRef.current?.focus();
    sync();
  }

  function insertLink() {
    const url = window.prompt('URL адрес на линка:');
    if (url) exec('createLink', url);
  }

  return (
    <div className="border border-[var(--border)] rounded overflow-hidden focus-within:border-[var(--primary)] transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border)] bg-[var(--bg-light)] flex-wrap">
        {TOOLBAR.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.title}
            onMouseDown={(e) => { e.preventDefault(); exec(t.cmd, t.val); }}
            className="px-2 py-1 rounded text-[13px] font-semibold text-[var(--text-body)] hover:bg-white hover:text-[var(--primary)] transition-colors"
          >
            {t.label}
          </button>
        ))}
        <div className="w-px h-4 bg-[var(--border)] mx-1" />
        <button
          type="button"
          title="Добави линк"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          className="px-2 py-1 rounded text-[13px] text-[var(--text-body)] hover:bg-white hover:text-[var(--primary)] transition-colors"
        >
          🔗
        </button>
        <button
          type="button"
          title="Премахни форматиране"
          onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }}
          className="px-2 py-1 rounded text-[13px] text-[var(--text-body)] hover:bg-white hover:text-red-500 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        className="min-h-[320px] p-4 text-[14px] text-[var(--text-body)] focus:outline-none"
        style={{
          lineHeight: 1.75,
          // basic prose styles so the editor looks like the published post
        }}
      />

      {/* Invisible textarea carries the HTML value into the server action */}
      <textarea
        ref={hiddenRef}
        name={name}
        required={required}
        style={{ display: 'none' }}
        readOnly
      />
    </div>
  );
}
