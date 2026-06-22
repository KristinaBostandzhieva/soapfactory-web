import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'bg' | 'en';

interface LanguageStore {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({ lang: 'bg', setLang: (lang) => set({ lang }) }),
    { name: 'sf-lang' }
  )
);
