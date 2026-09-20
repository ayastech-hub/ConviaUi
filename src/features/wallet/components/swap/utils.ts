export type SwapPhase = 'idle' | 'review' | 'swapping' | 'success';
export type ImpactLevel = 'low' | 'medium' | 'high';

export const STABLE_SYMBOLS = new Set(['USDT', 'USDC', 'DAI', 'BUSD']);

export function decimalsFor(symbol: string, max = 6): number {
  return STABLE_SYMBOLS.has(symbol) ? Math.min(2, max) : max;
}

export function formatRate(n: number): string {
  if (n >= 1000) return n.toLocaleString('en', { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString('en', { maximumFractionDigits: 2 });
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}

export function formatAmount(n: number, symbol: string): string {
  if (!Number.isFinite(n)) return '0';
  const d = Math.max(decimalsFor(symbol, 8), 8);
  // Avoid forced trailing zeros; trim insignificant fraction digits
  let s = n.toLocaleString('en', { useGrouping: false, maximumFractionDigits: d, minimumFractionDigits: 0 });
  if (s.includes('.')) s = s.replace(/\.?0+$/, '');
  // Add grouping for readability on integer part
  const [intPart, frac] = s.split('.');
  const grouped = Number(intPart).toLocaleString('en');
  return frac != null && frac.length ? `${grouped}.${frac}` : grouped;
}

/** Full-precision amount string for MAX — no rounding that triggers insufficient. */
export function exactAmountString(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  // Prefer full precision without scientific notation
  let s = n.toLocaleString('en', { useGrouping: false, maximumFractionDigits: 18, minimumFractionDigits: 0 });
  if (/e/i.test(String(n))) {
    s = n.toFixed(18);
  }
  if (s.includes('.')) s = s.replace(/\.?0+$/, '');
  return s || '0';
}

export const PRESET_SLIPPAGE = ['0.5%', '1.0%', '3.0%'];

/** Maps a price-impact percentage to a low/medium/high severity level. */
export function impactLevelFor(priceImpactPct: number): ImpactLevel {
  if (priceImpactPct < 0.5) return 'low';
  if (priceImpactPct < 1.5) return 'medium';
  return 'high';
}

export const IMPACT_COLORS: Record<ImpactLevel, string> = {
  low: 'var(--positive)',
  medium: 'var(--warning)',
  high: 'var(--destructive)',
};

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
