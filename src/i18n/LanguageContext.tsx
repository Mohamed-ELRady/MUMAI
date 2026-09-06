import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings, { Lang, StringKey } from './strings';
import { Localized } from '../data/milestones';
import { createWriteQueue } from '../store/persistedState';

const LANG_STORAGE_KEY = 'mumai:lang';
const persistLanguage = createWriteQueue((value) => AsyncStorage.setItem(LANG_STORAGE_KEY, value));

interface LanguageContextValue {
  lang: Lang;
  isLoading: boolean;
  isRTL: boolean;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  pick: (localized: Localized) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((v) => {
      if (active && (v === 'ar' || v === 'en')) setLangState(v);
    }).catch(() => {}).finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    persistLanguage(next).catch(() => {});
  }

  const value = useMemo<LanguageContextValue>(() => {
    function t(key: StringKey, vars?: Record<string, string | number>): string {
      let text: string = strings[key][lang];
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.split(`{${k}}`).join(String(v));
        }
      }
      return text;
    }
    return {
      lang,
      isLoading,
      isRTL: lang === 'ar',
      setLang,
      toggleLang: () => setLang(lang === 'ar' ? 'en' : 'ar'),
      t,
      pick: (localized: Localized) => localized[lang],
    };
  }, [lang, isLoading]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
