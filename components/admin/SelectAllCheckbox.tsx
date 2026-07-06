'use client';

// Header checkbox that toggles every `ids` checkbox in the same form.
export default function SelectAllCheckbox() {
  return (
    <input
      type="checkbox"
      aria-label="Избери всички"
      className="accent-[var(--primary)] cursor-pointer"
      onChange={(e) => {
        const form = e.currentTarget.form;
        if (!form) return;
        form.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((c) => { c.checked = e.currentTarget.checked; });
      }}
    />
  );
}
