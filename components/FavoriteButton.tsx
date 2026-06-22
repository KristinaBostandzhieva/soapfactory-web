'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavoritesStore, type FavItem } from '@/store/favoritesStore';
import { useT } from '@/hooks/useT';

// Heart toggle used on product cards and the product page.
// `variant` controls the look: small overlay on cards, bordered box on detail.
export default function FavoriteButton({
  product,
  variant = 'card',
}: {
  product: FavItem;
  variant?: 'card' | 'detail';
}) {
  const toggle = useFavoritesStore((s) => s.toggle);
  const items = useFavoritesStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = mounted && items.some((i) => i.id === product.id);
  const tr = useT();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  if (variant === 'detail') {
    return (
      <button
        onClick={onClick}
        aria-label={active ? tr.home.removeFromFav : tr.home.addToFav}
        aria-pressed={active}
        className="w-11 h-11 border rounded flex items-center justify-center transition-colors"
        style={{
          borderColor: active ? 'var(--primary)' : 'var(--border)',
          color: active ? 'var(--primary)' : 'inherit',
        }}
      >
        <Heart size={18} fill={active ? 'currentColor' : 'none'} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={active ? tr.home.removeFromFav : tr.home.addToFav}
      aria-pressed={active}
      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center transition-colors"
      style={{ color: active ? 'var(--primary)' : '#bbb' }}
    >
      <Heart size={18} strokeWidth={1.5} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
