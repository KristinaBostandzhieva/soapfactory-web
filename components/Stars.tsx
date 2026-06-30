'use client';

import { Star } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const tr = useT();
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= full ? 'text-amber-400' : 'text-gray-300'} fill={i <= full ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}
