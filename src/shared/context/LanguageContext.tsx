import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  type LocaleCode,
  LOCALE_LABELS,
  LANGUAGES_BY_COUNTRY,
  t as translate,
} from '../i18n/strings';
import * as profileApi from '../api/profile';
import { useAuth } from './AuthContext';

type LanguageContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: string) => string;
  labels: typeof LOCALE_LABELS;
  suggestedForCountry: (country?: string | null) => LocaleCode[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'convia_locale';

function readStored(): LocaleCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
    if (v && v in LOCALE_LABELS) return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [locale, setLocaleState] = useState<LocaleCode>(readStored);

  const setLocale = useCallback(
    (code: LocaleCode) => {
      setLocaleState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        /* ignore */
      }
      if (userId) {
        void profileApi.updateMyProfile({ preferredLanguage: code } as { preferredLanguage: string }).catch(() => undefined);
      }
    },
    [userId],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => translate(locale, key),
      labels: LOCALE_LABELS,
      suggestedForCountry: (country?: string | null) => {
        const c = (country || '').toUpperCase();
        return LANGUAGES_BY_COUNTRY[c] ?? ['en'];
      },
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      locale: 'en' as LocaleCode,
      setLocale: () => undefined,
      t: (key: string) => translate('en', key),
      labels: LOCALE_LABELS,
      suggestedForCountry: () => ['en'] as LocaleCode[],
    };
  }
  return ctx;
}
