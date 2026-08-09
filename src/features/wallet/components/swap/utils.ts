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
  const d = decimalsFor(symbol);
  return n.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: d });
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
