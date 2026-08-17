/** English is source of truth. Other locales are curated UI strings (Option 2). */
export type LocaleCode = 'en' | 'ar' | 'sw' | 'ha' | 'yo' | 'ig';

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  ar: 'العربية',
  sw: 'Kiswahili',
  ha: 'Hausa',
  yo: 'Yorùbá',
  ig: 'Igbo',
};

/** Languages suggested by supported country (matches backend). */
export const LANGUAGES_BY_COUNTRY: Record<string, LocaleCode[]> = {
  NG: ['en', 'ha', 'yo', 'ig'],
  GH: ['en'],
  KE: ['en', 'sw'],
  ZA: ['en'],
  UG: ['en', 'sw'],
  TZ: ['en', 'sw'],
  EG: ['en', 'ar'],
};

type Dict = Record<string, string>;

const en: Dict = {
  'nav.home': 'Home',
  'nav.wallet': 'Wallet',
  'nav.send': 'Send',
  'nav.request': 'Request',
  'nav.settings': 'Settings',
  'send.title': 'Send',
  'request.title': 'Request money',
  'request.subtitle': 'Ask a Convia user to pay you by @username',
  'request.payer': 'Their @username',
  'request.amount': 'Amount',
  'request.note': 'Note (optional)',
  'request.submit': 'Send request',
  'request.incoming': 'Requests for you',
  'request.outgoing': 'Your requests',
  'request.pay': 'Pay',
  'request.decline': 'Decline',
  'request.cancel': 'Cancel',
  'request.empty': 'No requests yet',
  'request.success': 'Request sent',
  'lang.title': 'Language',
  'lang.hint': 'App language. Server data stays in English.',
  'common.continue': 'Continue',
  'common.done': 'Done',
};

const ar: Dict = {
  ...en,
  'nav.home': 'الرئيسية',
  'nav.wallet': 'المحفظة',
  'nav.send': 'إرسال',
  'nav.request': 'طلب',
  'nav.settings': 'الإعدادات',
  'send.title': 'إرسال',
  'request.title': 'طلب أموال',
  'request.subtitle': 'اطلب من مستخدم Convia الدفع عبر @username',
  'request.submit': 'إرسال الطلب',
  'request.pay': 'ادفع',
  'request.decline': 'رفض',
  'lang.title': 'اللغة',
  'common.continue': 'متابعة',
  'common.done': 'تم',
};

const sw: Dict = {
  ...en,
  'nav.home': 'Nyumbani',
  'nav.wallet': 'Pochi',
  'nav.send': 'Tuma',
  'nav.request': 'Omba',
  'request.title': 'Omba pesa',
  'request.subtitle': 'Omba mtumiaji wa Convia akulipe kwa @username',
  'request.submit': 'Tuma ombi',
  'request.pay': 'Lipa',
  'request.decline': 'Kataa',
  'lang.title': 'Lugha',
  'common.continue': 'Endelea',
  'common.done': 'Imekamilika',
};

const ha: Dict = {
  ...en,
  'nav.home': 'Gida',
  'nav.send': 'Aika',
  'nav.request': 'Nema',
  'request.title': 'Nemi kudi',
  'request.submit': 'Aika buƙata',
  'request.pay': 'Biya',
  'lang.title': 'Harshe',
};

const yo: Dict = {
  ...en,
  'nav.home': 'Ilé',
  'nav.send': 'Firanṣẹ́',
  'nav.request': 'Beere',
  'request.title': 'Beere owó',
  'request.submit': 'Firanṣẹ́ ìbéèrè',
  'request.pay': 'San',
  'lang.title': 'Èdè',
};

const ig: Dict = {
  ...en,
  'nav.home': 'Ụlọ',
  'nav.send': 'Ziga',
  'nav.request': 'Rịọ',
  'request.title': 'Rịọ ego',
  'request.submit': 'Zipu arịrịọ',
  'request.pay': 'Kwụọ',
  'lang.title': 'Asụsụ',
};

export const DICTS: Record<LocaleCode, Dict> = { en, ar, sw, ha, yo, ig };

const CACHE_PREFIX = 'convia_i18n_v1:';

export function t(locale: LocaleCode, key: string): string {
  return DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
}

/** Cache dynamic API English strings translated client-side (Option 2). */
export function cacheDynamicTranslation(locale: LocaleCode, sourceEn: string, translated: string) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${locale}:${sourceEn}`, translated);
  } catch {
    /* ignore */
  }
}

export function getCachedDynamicTranslation(locale: LocaleCode, sourceEn: string): string | null {
  try {
    return localStorage.getItem(`${CACHE_PREFIX}${locale}:${sourceEn}`);
  } catch {
    return null;
  }
}
