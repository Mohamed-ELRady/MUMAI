import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings, { Lang, StringKey } from './strings';
import { Localized } from '../data/milestones';

const LANG_STORAGE_KEY = 'mumai:lang';

interface LanguageContextValue {
  lang: Lang;
  isRTL: boolean;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  pick: (localized: Localized) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((v) => {
      if (v === 'ar' || v === 'en') setLangState(v);
    });
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    AsyncStorage.setItem(LANG_STORAGE_KEY, next).catch(() => {});
  }

  const value = useMemo<LanguageContextValue>(() => {
    function t(key: StringKey, vars?: Record<string, string | number>): string {
      let text: string = strings[key][lang];
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    }
    return {
      lang,
      isRTL: lang === 'ar',
      setLang,
      toggleLang: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      t,
      pick: (localized: Localized) => localized[lang],
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
