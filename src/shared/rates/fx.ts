/**
 * Central FX rates — USD is the base (rate = 1).
 * Every screen should import helpers from here (or via useCurrency).
 * API rates should overwrite DEFAULT_USD_RATES when available.
 */

export type FxCode = string;

/** Units of local currency per 1 USD. */
export const DEFAULT_USD_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1600,
  GHS: 15.5,
  KES: 130,
  ZAR: 18.2,
  UGX: 3700,
  TZS: 2550,
  EGP: 48.5,
  EUR: 0.92,
  GBP: 0.79,
};

export type RateTable = Record<string, number>;

let liveRates: RateTable = { ...DEFAULT_USD_RATES };

/** Replace/merge rates from API (USD base). */
export function setLiveRates(partial: RateTable) {
  const next: RateTable = { ...liveRates };
  for (const [k, v] of Object.entries(partial)) {
    const code = k.toUpperCase();
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) next[code] = n;
  }
  next.USD = 1;
  liveRates = next;
}

export function getRate(code: string): number {
  const c = (code || 'USD').toUpperCase();
  return liveRates[c] || DEFAULT_USD_RATES[c] || 1;
}

export function getAllRates(): RateTable {
  return { ...liveRates };
}

/** Convert USD amount → local currency units. */
export function usdToLocal(usdAmount: number, code: string): number {
  return Number(usdAmount) * getRate(code);
}

/** Convert local currency units → USD. */
export function localToUsd(localAmount: number, code: string): number {
  const r = getRate(code);
  return r > 0 ? Number(localAmount) / r : Number(localAmount);
}

export function formatLocal(
  localAmount: number,
  code: string,
  symbol?: string,
): string {
  const r = getRate(code);
  const decimals = r > 50 ? 0 : 2;
  const n = Number(localAmount);
  const safe = Number.isFinite(n) ? n : 0;
  const sym = symbol ?? code;
  return `${sym}${safe.toLocaleString('en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Format a USD value in the user's selected currency. */
export function formatUsdAsLocal(usdAmount: number, code: string, symbol?: string): string {
  return formatLocal(usdToLocal(usdAmount, code), code, symbol);
}

/**
 * Sensible bill/utility quick amounts in *local* units.
 * Used by airtime, electricity, etc.
 */
export function localQuickAmounts(code: string): number[] {
  const c = (code || 'USD').toUpperCase();
  const table: Record<string, number[]> = {
    USD: [5, 10, 20, 50, 100, 200],
    NGN: [500, 1000, 2000, 5000, 10000, 20000],
    GHS: [5, 10, 20, 50, 100, 200],
    KES: [100, 200, 500, 1000, 2000, 5000],
    ZAR: [50, 100, 200, 500, 1000, 2000],
    UGX: [5000, 10000, 20000, 50000, 100000],
    TZS: [5000, 10000, 20000, 50000, 100000],
    EGP: [50, 100, 200, 500, 1000],
  };
  return table[c] || table.USD;
}

/** Airtime presets in local units. */
export function localAirtimeAmounts(code: string): number[] {
  const c = (code || 'USD').toUpperCase();
  const table: Record<string, number[]> = {
    USD: [1, 2, 5, 10, 20, 50],
    NGN: [100, 200, 500, 1000, 2000, 5000],
    GHS: [1, 2, 5, 10, 20, 50],
    KES: [50, 100, 200, 500, 1000, 2000],
    ZAR: [10, 20, 50, 100, 200],
    UGX: [1000, 2000, 5000, 10000, 20000],
    TZS: [1000, 2000, 5000, 10000, 20000],
    EGP: [10, 20, 50, 100, 200],
  };
  return table[c] || table.USD;
}

/**
 * Data plan display prices in local currency (approx).
 * value = amount charged in local currency.
 */
export function localDataBundles(code: string): { label: string; value: number; popular?: boolean }[] {
  const c = (code || 'USD').toUpperCase();
  if (c === 'NGN') {
    return [
      { label: '1GB · 30 days', value: 500 },
      { label: '2GB · 30 days', value: 1000, popular: true },
      { label: '5GB · 30 days', value: 2500 },
      { label: '10GB · 30 days', value: 4500 },
      { label: '20GB · 30 days', value: 8000 },
      { label: '50GB · 30 days', value: 15000 },
    ];
  }
  if (c === 'GHS') {
    return [
      { label: '1GB · 30 days', value: 5 },
      { label: '2GB · 30 days', value: 10, popular: true },
      { label: '5GB · 30 days', value: 25 },
      { label: '10GB · 30 days', value: 45 },
      { label: '20GB · 30 days', value: 80 },
    ];
  }
  // USD fallback — scale others from USD list via rate
  const usd = [
    { label: '1GB · 30 days', value: 3 },
    { label: '2GB · 30 days', value: 5, popular: true },
    { label: '5GB · 30 days', value: 10 },
    { label: '10GB · 30 days', value: 18 },
    { label: '20GB · 30 days', value: 30 },
    { label: '50GB · 30 days', value: 60 },
  ];
  if (c === 'USD') return usd;
  const r = getRate(c);
  return usd.map((b) => ({
    ...b,
    value: Math.round(b.value * r),
  }));
}
