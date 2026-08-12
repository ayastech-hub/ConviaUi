import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Asset } from '../data/mockData';
import {
  fetchTokenCatalog,
  fetchChainCatalog,
  type RegistryToken,
  type RegistryChain,
} from '../api/registry';
import { queryKeys } from '../query/queryClient';

/**
 * Always-shown canonical assets (omnibus ledger is symbol-based).
 * Registry overlays real names/chains/flags when the API responds.
 */
export const CANONICAL_ASSETS: Array<{ symbol: string; name: string }> = [
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'TRX', name: 'TRON' },
  { symbol: 'POL', name: 'Polygon' },
  { symbol: 'BNB', name: 'BNB' },
];

function seedAsset(symbol: string, name: string): Asset {
  return {
    id: symbol.toLowerCase(),
    symbol: symbol.toUpperCase(),
    name,
    price: 0,
    change24h: 0,
    balance: 0,
    valueUSD: 0,
    color: 'var(--foreground)',
    bgColor: 'var(--muted)',
    chains: [],
    sparkline: [],
  };
}

function tokenToAsset(t: RegistryToken): Asset {
  const chainLabels = (t.chains || [])
    .map((c) => c.chainName || c.name || c.chainKey || c.key || '')
    .filter(Boolean);
  const keys = (t.chains || []).map((c) => c.chainKey || c.key || '').filter(Boolean);
  return {
    id: t.symbol.toLowerCase(),
    symbol: t.symbol.toUpperCase(),
    name: t.name,
    price: 0,
    change24h: 0,
    balance: 0,
    valueUSD: 0,
    color: 'var(--foreground)',
    bgColor: 'var(--muted)',
    chains: chainLabels.length ? chainLabels : keys,
    sparkline: [],
  };
}

export type RegistryMeta = {
  swapEnabled?: boolean;
  rampEnabled?: boolean;
  billsEnabled?: boolean;
  isStablecoin?: boolean;
};

/**
 * Live token catalog = canonical seeds ∪ backend /tokens registry.
 * Zero-balance assets still appear so deposit/receive/swap pickers are complete.
 */
export function useTokenRegistry() {
  const tokensQ = useQuery({
    queryKey: queryKeys.tokens(),
    queryFn: async () => {
      const res = await fetchTokenCatalog();
      return res.tokens || [];
    },
    staleTime: 5 * 60_000,
  });

  const chainsQ = useQuery({
    queryKey: queryKeys.chains(),
    queryFn: async () => {
      try {
        const res = await fetchChainCatalog();
        return res.chains || [];
      } catch {
        return [] as RegistryChain[];
      }
    },
    staleTime: 5 * 60_000,
  });

  const tokens = tokensQ.data || [];
  const chains = chainsQ.data || [];

  const metaBySymbol = useMemo(() => {
    const m = new Map<string, RegistryMeta & { chains: RegistryChain[] }>();
    for (const t of tokens) {
      m.set(t.symbol.toUpperCase(), {
        swapEnabled: t.swapEnabled,
        rampEnabled: t.rampEnabled,
        billsEnabled: t.billsEnabled,
        isStablecoin: t.isStablecoin,
        chains: t.chains || [],
      });
    }
    return m;
  }, [tokens]);

  const assets = useMemo(() => {
    const bySym = new Map<string, Asset>();

    for (const s of CANONICAL_ASSETS) {
      bySym.set(s.symbol, seedAsset(s.symbol, s.name));
    }

    for (const t of tokens) {
      const a = tokenToAsset(t);
      const prev = bySym.get(a.symbol);
      bySym.set(a.symbol, prev ? { ...prev, ...a, balance: prev.balance, valueUSD: prev.valueUSD } : a);
    }

    // Prefer stable first, then by symbol
    const order = CANONICAL_ASSETS.map((c) => c.symbol);
    return Array.from(bySym.values()).sort((a, b) => {
      const ia = order.indexOf(a.symbol);
      const ib = order.indexOf(b.symbol);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [tokens]);

  /** Assets eligible for internal omnibus swap. */
  const swapAssets = useMemo(() => {
    if (!tokens.length) return assets;
    const enabled = assets.filter((a) => {
      const meta = metaBySymbol.get(a.symbol);
      // If flag missing, allow (admin may not have set swapEnabled yet)
      if (meta && meta.swapEnabled === false) return false;
      return true;
    });
    return enabled.length ? enabled : assets;
  }, [assets, tokens.length, metaBySymbol]);

  const getAsset = useCallback(
    (symbol: string) =>
      assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase()) || assets[0],
    [assets],
  );

  const chainKeysForSymbol = useCallback(
    (symbol: string, direction?: 'deposit' | 'withdraw') => {
      const tok = tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
      if (!tok) {
        // No registry variant yet — empty; deposit UI will show empty chain state
        return [] as string[];
      }
      return (tok.chains || [])
        .filter((c) => {
          if (direction === 'deposit') return c.depositsEnabled !== false;
          if (direction === 'withdraw') return c.withdrawalsEnabled !== false;
          return true;
        })
        .map((c) => (c.chainKey || c.key || '').toLowerCase())
        .filter(Boolean);
    },
    [tokens],
  );

  return {
    tokens,
    chains,
    assets,
    swapAssets,
    metaBySymbol,
    loading: tokensQ.isLoading,
    error: tokensQ.error ? 'registry_unavailable' : null,
    source: tokens.length ? ('live' as const) : ('seed' as const),
    isFetching: tokensQ.isFetching || chainsQ.isFetching,
    refresh: async () => {
      await Promise.all([tokensQ.refetch(), chainsQ.refetch()]);
    },
    getAsset,
    chainKeysForSymbol,
  };
}

export function chainLabelToKey(label: string, chains: RegistryChain[]): string {
  const n = label.toLowerCase().replace(/\s+/g, '');
  const hit = chains.find((c) => {
    const key = (c.key || c.chainKey || '').toLowerCase();
    const name = (c.name || c.chainName || '').toLowerCase().replace(/\s+/g, '');
    return key === n || name === n || name.includes(n) || n.includes(key);
  });
  if (hit) return hit.key || hit.chainKey || label.toLowerCase();
  return label.toLowerCase().replace(/\s+/g, '');
}
