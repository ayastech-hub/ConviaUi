import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { type LocaleCode, LOCALE_LABELS, t as translate } from '../i18n/strings';

type LanguageContextValue = {
  locale: LocaleCode;
  /** No-op — app is English only. */
  setLocale: (code: LocaleCode) => void;
  t: (key: string) => string;
  labels: typeof LOCALE_LABELS;
  suggestedForCountry: (country?: string | null) => LocaleCode[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const value = useMemo<LanguageContextValue>(
    () => ({
      locale: 'en',
      setLocale: () => undefined,
      t: (key: string) => translate('en', key),
      labels: LOCALE_LABELS,
      suggestedForCountry: () => ['en'],
    }),
    [],
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
