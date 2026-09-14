import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Asset } from '../data/mockData';
import { useTokenRegistry } from './useTokenRegistry';
import { usePortfolio } from './usePortfolio';
import { fetchTokensInfo, type TokenMarketInfo } from '../api/tokens';
import { queryKeys } from '../query/queryClient';
import { cacheGet, cacheSet } from '../cache/queryCache';

const PRICE_CACHE_KEY = 'token-market-prices';
/** Keep last prices for 24h on disk so refresh never shows $0 while API loads */
const PRICE_CACHE_MAX_AGE = 24 * 60 * 60_000;

type MarketRow = { price: number; change24h: number; image?: string };
type MarketMap = Record<string, MarketRow>;

function rowsFromTokens(tokens: TokenMarketInfo[]): MarketMap {
  const m: MarketMap = {};
  for (const t of tokens || []) {
    const sym = String(t.symbol || '').toUpperCase();
    if (!sym) continue;
    const price = Number(t.currentPriceUsd ?? t.priceUsd ?? 0) || 0;
    const change24h = Number(t.priceChange24hPct ?? t.change24h ?? 0) || 0;
    const image = typeof t.image === 'string' ? t.image : undefined;
    if (price > 0 || change24h !== 0 || image) {
      m[sym] = { price, change24h, image };
    }
  }
  return m;
}

function mergeMarketMaps(base: MarketMap, overlay: MarketMap): MarketMap {
  const out = { ...base };
  for (const [sym, row] of Object.entries(overlay)) {
    const prev = out[sym];
    out[sym] = {
      price: row.price > 0 ? row.price : prev?.price || 0,
      change24h: row.price > 0 || row.change24h !== 0 ? row.change24h : prev?.change24h || 0,
      image: row.image || prev?.image,
    };
  }
  return out;
}

/**
 * Full asset list: registry ∪ holdings, with live prices + 24h change.
 * Shows **cached** prices immediately on refresh; swaps in live when API returns.
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
    return Array.from(set).sort();
  }, [registry.assets, portfolio.data?.holdings]);

  const cachedMarket = useMemo(
    () => cacheGet<MarketMap>(PRICE_CACHE_KEY, PRICE_CACHE_MAX_AGE, { allowStale: true, preferLocal: true }) || {},
    // re-read only when symbols set stabilizes first paint — intentional empty deps-ish via symbols length
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbols.join(',')],
  );

  const pricesQ = useQuery({
    queryKey: [...queryKeys.tokens(), 'market', symbols.join(',')],
    queryFn: async () => {
      if (!symbols.length) return { tokens: [] as TokenMarketInfo[] };
      const res = await fetchTokensInfo(symbols);
      const next = mergeMarketMaps(cachedMarket, rowsFromTokens(res.tokens || []));
      cacheSet(PRICE_CACHE_KEY, next, { persist: 'local' });
      return res;
    },
    enabled: symbols.length > 0,
    staleTime: 2 * 60_000,
    gcTime: 30 * 60_000,
    // Show last known market map until network resolves
    placeholderData: () => {
      const tokens = Object.entries(cachedMarket).map(([symbol, row]) => ({
        symbol,
        priceUsd: row.price,
        currentPriceUsd: row.price,
        change24h: row.change24h,
        priceChange24hPct: row.change24h,
        image: row.image,
      }));
      return { tokens };
    },
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const marketBySymbol = useMemo(() => {
    const fromLive = rowsFromTokens(pricesQ.data?.tokens || []);
    const merged = mergeMarketMaps(cachedMarket, fromLive);
    // Persist whenever we have stronger data
    if (Object.keys(fromLive).length) {
      cacheSet(PRICE_CACHE_KEY, merged, { persist: 'local' });
    }
    return new Map(Object.entries(merged));
  }, [pricesQ.data, cachedMarket]);

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
      // Prefer market (incl. cache) over zero; holdings price only if market missing
      const price = (mkt?.price && mkt.price > 0 ? mkt.price : 0) || b?.price || a.price || 0;
      const change24h = mkt?.change24h ?? a.change24h ?? 0;
      const qty = b?.qty ?? 0;
      return {
        ...a,
        balance: qty,
        valueUSD: b?.valueUsd ?? (qty > 0 ? qty * price : 0),
        price,
        change24h,
      };
    });

    for (const [sym, b] of bal) {
      if (merged.some((a) => a.symbol === sym)) continue;
      const mkt = marketBySymbol.get(sym);
      const price = (mkt?.price && mkt.price > 0 ? mkt.price : 0) || b.price || 0;
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
    loading: registry.loading || portfolio.loading,
    pricesLoading: pricesQ.isFetching && !Object.keys(cachedMarket).length,
    registrySource: registry.source,
  };
}
