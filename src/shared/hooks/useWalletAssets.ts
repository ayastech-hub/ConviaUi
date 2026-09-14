import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Asset } from '../data/mockData';
import { useTokenRegistry } from './useTokenRegistry';
import { usePortfolio } from './usePortfolio';
import { fetchTokensInfo } from '../api/tokens';
import { queryKeys } from '../query/queryClient';

/**
 * Full asset list: registry ∪ holdings, with live prices + 24h change for every symbol.
 */
export function useWalletAssets() {
  const registry = useTokenRegistry();
  const portfolio = usePortfolio();

  const symbols = useMemo(() => {
    const set = new Set<string>();
    for (const a of registry.assets) set.add(a.symbol.toUpperCase());
    for (const h of portfolio.data?.holdings || []) {
      const s = String(h.asset || '').toUpperCase();
      if (s) set.add(s);
    }
    return Array.from(set);
  }, [registry.assets, portfolio.data?.holdings]);

  const pricesQ = useQuery({
    queryKey: [...queryKeys.tokens(), 'market', symbols.join(',')],
    queryFn: async () => {
      if (!symbols.length) return { tokens: [] as Awaited<ReturnType<typeof fetchTokensInfo>>['tokens'] };
      try {
        return await fetchTokensInfo(symbols);
      } catch {
        return { tokens: [] };
      }
    },
    enabled: symbols.length > 0,
    staleTime: 60_000,
  });

  const marketBySymbol = useMemo(() => {
    const m = new Map<string, { price: number; change24h: number; image?: string }>();
    for (const t of pricesQ.data?.tokens || []) {
      const sym = String(t.symbol || '').toUpperCase();
      if (!sym) continue;
      const price = Number(t.currentPriceUsd ?? t.priceUsd ?? 0) || 0;
      const change24h = Number(t.priceChange24hPct ?? t.change24h ?? 0) || 0;
      const image = typeof t.image === 'string' ? t.image : undefined;
      m.set(sym, { price, change24h, image });
    }
    return m;
  }, [pricesQ.data]);

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
      const mkt = marketBySymbol.get(a.symbol);
      const price = mkt?.price || b?.price || a.price || 0;
      const change24h = mkt?.change24h ?? a.change24h ?? 0;
      const qty = b?.qty ?? 0;
      return {
        ...a,
        balance: qty,
        valueUSD: b?.valueUsd ?? qty * price,
        price,
        change24h,
      };
    });

    for (const [sym, b] of bal) {
      if (merged.some((a) => a.symbol === sym)) continue;
      const mkt = marketBySymbol.get(sym);
      const price = mkt?.price || b.price || 0;
      merged.push({
        id: sym.toLowerCase(),
        symbol: sym,
        name: sym,
        price,
        change24h: mkt?.change24h ?? 0,
        balance: b.qty,
        valueUSD: b.valueUsd || b.qty * price,
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
  }, [registry.assets, portfolio.data, marketBySymbol]);

  const totalValueUsd = useMemo(() => {
    if (portfolio.data?.totalValueUsd != null) return Number(portfolio.data.totalValueUsd) || 0;
    return assets.reduce((s, a) => s + (Number(a.valueUSD) || 0), 0);
  }, [portfolio.data, assets]);

  return {
    assets,
    swapAssets: registry.swapAssets.map((a) => {
      const live = assets.find((x) => x.symbol === a.symbol);
      return live
        ? { ...a, balance: live.balance, valueUSD: live.valueUSD, price: live.price, change24h: live.change24h }
        : a;
    }),
    totalValueUsd,
    loading: registry.loading || portfolio.loading || pricesQ.isLoading,
    registrySource: registry.source,
    pricesLoading: pricesQ.isFetching,
  };
}
