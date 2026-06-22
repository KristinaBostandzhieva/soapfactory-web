'use client';

import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/translations';

export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return t[lang];
}
