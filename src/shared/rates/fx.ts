/**
 * Central FX rates — USD is the base (rate = 1).
 * Live rates come from the API. Missing rates stay 0 (unavailable) until synced.
 */

export type FxCode = string;
export type RateTable = Record<string, number>;

/** Suggested airtime chips in local currency units. */
export function localAirtimeAmounts(_code?: string): number[] {
  return [100, 200, 500, 1000, 2000, 5000];
}

/** Suggested utility chips in local currency units. */
export function localQuickAmounts(_code?: string): number[] {
  return [50, 100, 250, 500, 1000, 2000, 5000];
}

let liveRates: RateTable = { USD: 1 };

/** Replace/merge rates from API (USD base: units of local per 1 USD). */
export function setLiveRates(partial: RateTable) {
  const next: RateTable = { USD: 1 };
  for (const [k, v] of Object.entries({ ...liveRates, ...partial })) {
    const code = k.toUpperCase();
    const n = Number(v);
    if (code === 'USD') {
      next.USD = 1;
      continue;
    }
    if (Number.isFinite(n) && n > 0) next[code] = n;
  }
  liveRates = next;
}

export function hasLiveRate(code: string): boolean {
  const c = (code || 'USD').toUpperCase();
  if (c === 'USD') return true;
  const n = liveRates[c];
  return Number.isFinite(n) && (n as number) > 0;
}

/** Units of local per 1 USD. Returns 0 if unavailable. */
export function getRate(code: string): number {
  const c = (code || 'USD').toUpperCase();
  if (c === 'USD') return 1;
  const n = liveRates[c];
  return Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0;
}

export function getAllRates(): RateTable {
  return { ...liveRates };
}

export function usdToLocal(usdAmount: number, code: string): number {
  const r = getRate(code);
  if (r <= 0) return 0;
  return Number(usdAmount) * r;
}

export function localToUsd(localAmount: number, code: string): number {
  const r = getRate(code);
  return r > 0 ? Number(localAmount) / r : 0;
}

export function formatLocal(localAmount: number, code: string, symbol?: string): string {
  const r = getRate(code);
  if (r <= 0 && code.toUpperCase() !== 'USD') return '—';
  const decimals = r > 50 ? 0 : 2;
  const n = Number(localAmount);
  const safe = Number.isFinite(n) ? n : 0;
  const s = symbol || code;
  return `${s}${safe.toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatUsdAsLocal(usdAmount: number, code: string, symbol?: string): string {
  const c = (code || 'USD').toUpperCase();
  if (c === 'USD') {
    const n = Number(usdAmount);
    const safe = Number.isFinite(n) ? n : 0;
    const s = symbol || '$';
    return `${s}${safe.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const local = usdToLocal(usdAmount, c);
  if (local <= 0 && !hasLiveRate(c)) return '—';
  return formatLocal(local, c, symbol);
}
