import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Asset } from '../data/mockData';
import { useTokenRegistry } from './useTokenRegistry';
import { usePortfolio } from './usePortfolio';
import { fetchTokensInfo, type TokenMarketInfo } from '../api/tokens';
import { queryKeys } from '../query/queryClient';
import { cacheGet, cacheSet } from '../cache/queryCache';

const PRICE_CACHE_KEY = 'token-market-prices';
const TOTAL_CACHE_KEY = 'wallet-total-usd';
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
 * Registry ∪ holdings with unified prices.
 * Cached market prices paint immediately so total balance does not flash $0.
 */
export function useWalletAssets() {
  const registry = useTokenRegistry();
  const portfolio = usePortfolio();
  const lastGoodTotal = useRef(
    Number(cacheGet<number>(TOTAL_CACHE_KEY, PRICE_CACHE_MAX_AGE, { allowStale: true, preferLocal: true })) || 0,
  );

  const symbols = useMemo(() => {
    const set = new Set<string>();
    for (const a of registry.assets || []) set.add(a.symbol.toUpperCase());
    for (const h of Array.isArray(portfolio.data?.holdings) ? portfolio.data!.holdings : []) {
      const s = String(h.asset || '').toUpperCase();
      if (s) set.add(s);
    }
    return Array.from(set).sort();
  }, [registry.assets, portfolio.data?.holdings]);

  const cachedMarket = useMemo(
    () => cacheGet<MarketMap>(PRICE_CACHE_KEY, PRICE_CACHE_MAX_AGE, { allowStale: true, preferLocal: true }) || {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbols.join(',')],
  );

  const pricesQ = useQuery({
    queryKey: queryKeys.tokenMarket(symbols.join(',')),
    queryFn: async () => {
      if (!symbols.length) return { tokens: [] as TokenMarketInfo[] };
      const res = await fetchTokensInfo(symbols);
      const tokenRows = Array.isArray(res?.tokens) ? res.tokens : [];
      const next = mergeMarketMaps(cachedMarket, rowsFromTokens(tokenRows));
      cacheSet(PRICE_CACHE_KEY, next, { persist: 'local' });
      return res;
    },
    enabled: symbols.length > 0,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
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
    refetchOnWindowFocus: false,
  });

  const marketBySymbol = useMemo(() => {
    const fromLive = rowsFromTokens(pricesQ.data?.tokens || []);
    return new Map(Object.entries(mergeMarketMaps(cachedMarket, fromLive)));
  }, [pricesQ.data, cachedMarket]);

  const assets = useMemo(() => {
    const bal = new Map<string, { qty: number; ledgerValue: number; ledgerPrice: number }>();
    for (const h of Array.isArray(portfolio.data?.holdings) ? portfolio.data!.holdings : []) {
      const sym = String(h.asset || '').toUpperCase();
      if (!sym) continue;
      const qty = Number(h.quantity) || 0;
      const ledgerValue = Number(h.valueUsd) || 0;
      const ledgerPrice = Number(h.priceUsd) || (qty > 0 && ledgerValue > 0 ? ledgerValue / qty : 0);
      bal.set(sym, { qty, ledgerValue, ledgerPrice });
    }

    const priceFor = (sym: string, fallback = 0) => {
      const mkt = marketBySymbol.get(sym);
      if (mkt && mkt.price > 0) return mkt.price;
      const b = bal.get(sym);
      if (b && b.ledgerPrice > 0) return b.ledgerPrice;
      return fallback;
    };

    const valueFor = (sym: string, qty: number, ledgerValue: number, price: number) => {
      // Always prefer qty × known price so list + total stay in sync
      if (qty > 0 && price > 0) return qty * price;
      if (ledgerValue > 0) return ledgerValue;
      return 0;
    };

    const merged: Asset[] = (registry.assets || []).map((a) => {
      const b = bal.get(a.symbol);
      const qty = b?.qty ?? 0;
      const price = priceFor(a.symbol, a.price || 0);
      const change24h = marketBySymbol.get(a.symbol)?.change24h ?? a.change24h ?? 0;
      const valueUSD = valueFor(a.symbol, qty, b?.ledgerValue ?? 0, price);
      return { ...a, balance: qty, valueUSD, price, change24h };
    });

    for (const [sym, b] of bal) {
      if (merged.some((a) => a.symbol === sym)) continue;
      const price = priceFor(sym, b.ledgerPrice);
      const valueUSD = valueFor(sym, b.qty, b.ledgerValue, price);
      merged.push({
        id: sym.toLowerCase(),
        symbol: sym,
        name: sym,
        price,
        change24h: marketBySymbol.get(sym)?.change24h ?? 0,
        balance: b.qty,
        valueUSD,
        color: 'var(--foreground)',
        bgColor: 'var(--muted)',
        chains: [],
        sparkline: [],
      });
    }

    return merged.sort((a, b) => {
      if (a.balance > 0 && b.balance <= 0) return -1;
      if (b.balance > 0 && a.balance <= 0) return 1;
      return (b.valueUSD || 0) - (a.valueUSD || 0);
    });
  }, [registry.assets, portfolio.data, marketBySymbol]);

  const computedTotal = useMemo(
    () => assets.reduce((s, a) => s + (Number(a.valueUSD) || 0), 0),
    [assets],
  );

  // Stable total: never drop to 0 while holdings exist but prices still hydrating
  const totalValueUsd = useMemo(() => {
    const hasQty = assets.some((a) => (a.balance || 0) > 0);
    if (computedTotal > 0) {
      lastGoodTotal.current = computedTotal;
      cacheSet(TOTAL_CACHE_KEY, computedTotal, { persist: 'local' });
      return computedTotal;
    }
    if (hasQty && lastGoodTotal.current > 0) return lastGoodTotal.current;
    if (hasQty && portfolio.data?.totalValueUsd != null) {
      const server = Number(portfolio.data.totalValueUsd) || 0;
      if (server > 0) return server;
    }
    return computedTotal;
  }, [computedTotal, assets, portfolio.data]);

  const pricesReady = marketBySymbol.size > 0 || Object.keys(cachedMarket).length > 0;

  return {
    assets,
    swapAssets: registry.swapAssets.map((a) => {
      const live = assets.find((x) => x.symbol === a.symbol);
      return live
        ? { ...a, balance: live.balance, valueUSD: live.valueUSD, price: live.price, change24h: live.change24h }
        : a;
    }),
    totalValueUsd,
    loading: (registry.loading || portfolio.loading) && !portfolio.data,
    pricesLoading: pricesQ.isFetching && !pricesReady,
    pricesReady,
    registrySource: registry.source,
  };
}
