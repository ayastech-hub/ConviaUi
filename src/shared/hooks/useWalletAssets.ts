import { useMemo } from 'react';
import type { Asset } from '../data/mockData';
import { useTokenRegistry } from './useTokenRegistry';
import { usePortfolio } from './usePortfolio';

/**
 * Full asset list for Home/Wallet: every supported + canonical token,
 * with ledger balances merged when the user is signed in.
 * Sort: non-zero balances first, then canonical order.
 */
export function useWalletAssets() {
  const registry = useTokenRegistry();
  const portfolio = usePortfolio();

  const assets = useMemo(() => {
    const bal = new Map<string, { qty: number; valueUsd: number; price: number }>();
    for (const h of portfolio.data?.holdings || []) {
      const sym = String(h.asset || '').toUpperCase();
      if (!sym) continue;
      const qty = Number(h.quantity) || 0;
      const valueUsd = Number(h.valueUsd) || 0;
      const price = Number(h.priceUsd) || (qty > 0 ? valueUsd / qty : 0);
      bal.set(sym, { qty, valueUsd, price });
    }

    const merged: Asset[] = registry.assets.map((a) => {
      const b = bal.get(a.symbol);
      if (!b) return a;
      return {
        ...a,
        balance: b.qty,
        valueUSD: b.valueUsd,
        price: b.price || a.price,
      };
    });

    // Holdings for symbols not in catalog yet
    for (const [sym, b] of bal) {
      if (merged.some((a) => a.symbol === sym)) continue;
      merged.push({
        id: sym.toLowerCase(),
        symbol: sym,
        name: sym,
        price: b.price,
        change24h: 0,
        balance: b.qty,
        valueUSD: b.valueUsd,
        color: 'var(--foreground)',
        bgColor: 'var(--muted)',
        chains: [],
        sparkline: [],
      });
    }

    return merged.sort((a, b) => {
      if (a.balance > 0 && b.balance <= 0) return -1;
      if (b.balance > 0 && a.balance <= 0) return 1;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [registry.assets, portfolio.data]);

  const totalValueUsd = useMemo(() => {
    if (portfolio.data?.totalValueUsd != null) return Number(portfolio.data.totalValueUsd) || 0;
    return assets.reduce((s, a) => s + (Number(a.valueUSD) || 0), 0);
  }, [portfolio.data, assets]);

  return {
    assets,
    swapAssets: registry.swapAssets.map((a) => {
      const live = assets.find((x) => x.symbol === a.symbol);
      return live ? { ...a, balance: live.balance, valueUSD: live.valueUSD, price: live.price } : a;
    }),
    totalValueUsd,
    loading: registry.loading || portfolio.loading,
    registrySource: registry.source,
    portfolioSource: portfolio.source,
    chainKeysForSymbol: registry.chainKeysForSymbol,
    chains: registry.chains,
    refresh: async () => {
      await Promise.all([registry.refresh(), portfolio.refresh()]);
    },
  };
}
