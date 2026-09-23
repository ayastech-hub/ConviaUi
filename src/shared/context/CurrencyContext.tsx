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
import { convertRate } from '../api/rates';
import { cacheGet, cacheSet } from '../cache/queryCache';
import {
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
  NGN: { name: 'Nigerian Naira', symbol: '₦', rate: 0, flag: 'NG' },
  GHS: { name: 'Ghanaian Cedi', symbol: 'GH₵', rate: 0, flag: 'GH' },
  KES: { name: 'Kenyan Shilling', symbol: 'KSh', rate: 0, flag: 'KE' },
  ZAR: { name: 'South African Rand', symbol: 'R', rate: 0, flag: 'ZA' },
  UGX: { name: 'Ugandan Shilling', symbol: 'USh', rate: 0, flag: 'UG' },
  TZS: { name: 'Tanzanian Shilling', symbol: 'TSh', rate: 0, flag: 'TZ' },
  EGP: { name: 'Egyptian Pound', symbol: 'E£', rate: 0, flag: 'EG' },
};

function currencyFromCode(code: string): Currency {
  const c = code.toUpperCase();
  const m = META[c] || {};
  return {
    code: c,
    name: m.name || c,
    symbol: m.symbol || c,
    rate: getRate(c) || (c === 'USD' ? 1 : m.rate) || 0,
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
        // Live FX from /rates/convert (USD base) — never invent rates.
        const rateEntries: Record<string, number> = { USD: 1 };
        await Promise.all(
          [...codes]
            .filter((c) => c !== 'USD')
            .map(async (code) => {
              try {
                const res = await convertRate({ from: 'USD', to: code, amount: '1' });
                const r = Number(res?.rate);
                if (Number.isFinite(r) && r > 0) rateEntries[code] = r;
              } catch {
                /* leave unavailable */
              }
            }),
        );
        setLiveRates(rateEntries);
        const list = [...codes].map((code) => {
          const base = currencyFromCode(code);
          return { ...base, rate: rateEntries[code] ?? base.rate ?? 0 };
        });
        if (!cancelled && list.length) {
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
