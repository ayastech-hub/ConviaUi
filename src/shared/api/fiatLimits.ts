import { api } from './client';

export type FiatLimitRow = {
  currency: string;
  onrampMin: number;
  offrampMin: number;
};

export type FiatLimitsResponse = {
  multiplier: number;
  limits: FiatLimitRow[];
};

const FALLBACK: Record<string, { onrampMin: number; offrampMin: number }> = {
  NGN: { onrampMin: 500, offrampMin: 1000 },
  GHS: { onrampMin: 20, offrampMin: 40 },
  KES: { onrampMin: 100, offrampMin: 200 },
  ZAR: { onrampMin: 50, offrampMin: 100 },
  UGX: { onrampMin: 5000, offrampMin: 10000 },
  USD: { onrampMin: 5, offrampMin: 10 },
};

export async function fetchFiatLimits(): Promise<FiatLimitsResponse> {
  try {
    return await api.get<FiatLimitsResponse>('/fiat/local/limits');
  } catch {
    return {
      multiplier: 2,
      limits: Object.entries(FALLBACK).map(([currency, v]) => ({ currency, ...v })),
    };
  }
}

export function limitFor(limits: FiatLimitsResponse | null, currency: string) {
  const c = currency.toUpperCase();
  const row = limits?.limits?.find((l) => l.currency === c);
  if (row) return row;
  return FALLBACK[c] || { onrampMin: 0, offrampMin: 0 };
}
