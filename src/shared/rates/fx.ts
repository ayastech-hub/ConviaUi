/**
 * Central FX rates — USD is the base (rate = 1).
 * Live rates come from the API only. Missing rates are unavailable (not guessed).
 */

export type FxCode = string;

export type RateTable = Record<string, number>;

/** Only USD is known until API / setLiveRates fills the rest. */
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

/** Units of local per 1 USD. Returns 0 if unavailable (do not invent rates). */
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

export function formatLocal(
  localAmount: number,
  code: string,
  symbol?: string,
): string {
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
