'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/app/admin/actions';

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`Изтриване на „${name}"? Това действие е необратимо.`)) {
          startTransition(() => deleteProduct(id));
        }
      }}
      className="text-[var(--text-muted)] hover:text-red-600 transition-colors disabled:opacity-50"
      aria-label="Изтрий"
    >
      <Trash2 size={16} />
    </button>
  );
}
