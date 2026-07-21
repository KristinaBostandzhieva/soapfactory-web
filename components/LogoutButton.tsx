'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ label = 'Изход', className = '' }: { label?: string; className?: string }) {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }
  return (
    <button onClick={logout} className={`inline-flex items-center gap-2 cursor-pointer text-[14px] font-semibold text-[var(--text-body)] hover:text-[var(--primary)] transition-colors ${className}`}>
      <LogOut size={16} /> {label}
    </button>
  );
}
