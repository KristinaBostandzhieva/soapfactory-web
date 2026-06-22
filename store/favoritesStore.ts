import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavItem {
  id: string;
  name: string;
  price: number;
  priceMax?: number;
  slug: string;
  image?: string;
  inStock?: boolean;
}

interface FavoritesStore {
  items: FavItem[];
  toggle: (item: FavItem) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        set({
          items: exists
            ? get().items.filter((i) => i.id !== item.id)
            : [...get().items, item],
        });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'soapfactory-favorites' }
  )
);
