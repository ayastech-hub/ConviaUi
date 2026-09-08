import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { listSupportedCountries } from '../api/banks';
import { cacheGet, cacheSet } from '../cache/queryCache';
import {
  DEFAULT_USD_RATES,
  getRate,
  setLiveRates,
  usdToLocal,
  formatUsdAsLocal,
} from '../rates/fx';

export type Currency = {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  flag: string;
};

/** Soft display metadata only — codes/rates still prefer API-driven list. */
const META: Record<string, Partial<Currency>> = {
  USD: { name: 'US Dollar', symbol: '$', rate: 1, flag: 'US' },
  NGN: { name: 'Nigerian Naira', symbol: '₦', rate: 1600, flag: 'NG' },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', rate: 15, flag: 'GH' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', rate: 130, flag: 'KE' },
  ZAR: { name: 'South African Rand', symbol: 'R', rate: 18, flag: 'ZA' },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh', rate: 3700, flag: 'UG' },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh', rate: 2500, flag: 'TZ' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£', rate: 48, flag: 'EG' },
};

function currencyFromCode(code: string): Currency {
  const c = code.toUpperCase();
  const m = META[c] || {};
  return {
    code: c,
    name: m.name || c,
    symbol: m.symbol || (DEFAULT_USD_RATES[c] ? c : c),
    rate: getRate(c) || m.rate || 1,
    flag: m.flag || c.slice(0, 2),
  };
}

/** @deprecated Prefer useSupportedCurrencies — kept for gradual migration */
export const CURRENCIES: Currency[] = [
  currencyFromCode('USD'),
  ...['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'EGP'].map(currencyFromCode),
];

interface CurrencyContextValue {
  currency: Currency;
  currencies: Currency[];
  setCurrency: (c: Currency) => void;
  /** Format a USD amount in the active currency */
  format: (usdAmount: number) => string;
  /** Convert USD → active currency units */
  convert: (usdAmount: number) => number;
  /** Format an amount already in active currency units */
  formatLocal: (localAmount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = 'convex_currency';
const CACHE_KEY = 'dir:currencies';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const cachedList = cacheGet<Currency[]>(CACHE_KEY, 10 * 60_000);
  const [currencies, setCurrencies] = useState<Currency[]>(cachedList || CURRENCIES);
  const [loading, setLoading] = useState(!cachedList);

  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return currencyFromCode(saved);
    } catch {
      /* ignore */
    }
    return currencyFromCode('USD');
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await listSupportedCountries();
        const rows = Array.isArray(raw) ? raw : [];
        const codes = new Set<string>(['USD']);
        for (const r of rows as Array<{ country?: string; code?: string; currency?: string }>) {
          const cur = String(r.currency || '').toUpperCase();
          if (cur) codes.add(cur);
        }
        const list = [...codes].map(currencyFromCode);
        if (!cancelled && list.length) {
          // Keep central rate table in sync (USD base)
          setLiveRates(Object.fromEntries(list.map((c) => [c.code, c.rate])));
          cacheSet(CACHE_KEY, list);
          setCurrencies(list);
          setCurrencyState((prev) => list.find((c) => c.code === prev.code) || list[0]);
        }
      } catch {
        /* keep previous */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c.code);
    } catch {
      /* ignore */
    }
  }, []);

  const convert = useCallback((usdAmount: number) => usdAmount * currency.rate, [currency.rate]);

  const format = useCallback(
    (usdAmount: number) => formatUsdAsLocal(usdAmount, currency.code, currency.symbol),
    [currency],
  );

  const formatLocal = useCallback(
    (localAmount: number) => {
      const n = Number(localAmount);
      const safe = Number.isFinite(n) ? n : 0;
      const decimals = (currency.rate || 1) > 50 ? 0 : 2;
      return `${currency.symbol}${safe.toLocaleString('en', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    },
    [currency],
  );

  const value = useMemo(
    () => ({ currency, currencies, setCurrency, format, convert, formatLocal, loading }),
    [currency, currencies, setCurrency, format, convert, formatLocal, loading],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
