'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }
  return (
    <button onClick={logout} className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--text-body)] hover:text-[var(--primary)] transition-colors">
      <LogOut size={16} /> Изход
    </button>
  );
}
