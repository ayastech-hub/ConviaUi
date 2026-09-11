import { getRate } from '../rates/fx';

export type LocalLeg = {
  asset: string;
  cryptoAmount: number;
  fiatAmount: number;
  rate: number;
  role: 'primary' | 'fallback';
};

/** Fiat per 1 unit of crypto. Stablecoins ≈ local fiat per USD. */
export function fiatPerAsset(asset: string, fiat: string): number {
  const a = asset.toUpperCase();
  const f = fiat.toUpperCase();
  if (a === 'USDT' || a === 'USDC') return getRate(f);
  const usdPx: Record<string, number> = { ETH: 3200, BTC: 95000, SOL: 140, BNB: 600 };
  const px = usdPx[a] || 1;
  return px * getRate(f);
}

export function buildClientQuote(input: {
  fiatAmount: number;
  fiatCurrency: string;
  primaryAsset: string;
  fallbackAssets?: string[];
  balances: Record<string, number>;
}): { legs: LocalLeg[]; shortfallFiat: number } {
  let remaining = input.fiatAmount;
  const legs: LocalLeg[] = [];

  const tryAsset = (asset: string, role: 'primary' | 'fallback') => {
    if (remaining <= 1e-8) return;
    const bal = input.balances[asset] ?? input.balances[asset.toUpperCase()] ?? 0;
    if (bal <= 0) return;
    const rate = fiatPerAsset(asset, input.fiatCurrency);
    if (rate <= 0) return;
    const maxFiat = bal * rate;
    const take = Math.min(remaining, maxFiat);
    if (take <= 0) return;
    legs.push({
      asset: asset.toUpperCase(),
      cryptoAmount: take / rate,
      fiatAmount: take,
      rate,
      role,
    });
    remaining -= take;
  };

  tryAsset(input.primaryAsset, 'primary');
  for (const fb of input.fallbackAssets || []) {
    if (fb.toUpperCase() === input.primaryAsset.toUpperCase()) continue;
    tryAsset(fb, 'fallback');
  }

  return { legs, shortfallFiat: Math.max(0, remaining) };
}

export function formatCrypto(n: number, asset: string) {
  const d = ['BTC', 'ETH'].includes(asset.toUpperCase()) ? 6 : 4;
  return `${n.toFixed(d)} ${asset.toUpperCase()}`;
}
