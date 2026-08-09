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

function tokenToAsset(t: RegistryToken): Asset {
  const chainLabels = (t.chains || [])
    .map((c) => c.chainName || c.name || c.chainKey || c.key || '')
    .filter(Boolean);
  const keys = (t.chains || []).map((c) => c.chainKey || c.key || '').filter(Boolean);
  return {
    id: t.symbol.toLowerCase(),
    symbol: t.symbol,
    name: t.name,
    price: 0,
    change24h: 0,
    balance: 0,
    valueUSD: 0,
    color: 'var(--foreground)',
    bgColor: 'var(--muted)',
    chains: chainLabels.length ? chainLabels : keys.length ? keys : ['ethereum'],
    sparkline: [],
  };
}

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
  const assets = useMemo(() => tokens.map(tokenToAsset), [tokens]);

  const getAsset = useCallback(
    (symbol: string) =>
      assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase()) || assets[0],
    [assets],
  );

  const chainKeysForSymbol = useCallback(
    (symbol: string, direction?: 'deposit' | 'withdraw') => {
      const tok = tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
      if (!tok) return [] as string[];
      return (tok.chains || [])
        .filter((c) => {
          if (direction === 'deposit') return c.depositsEnabled !== false;
          if (direction === 'withdraw') return c.withdrawalsEnabled !== false;
          return true;
        })
        .map((c) => c.chainKey || c.key || c.chainName || c.name || '')
        .filter(Boolean);
    },
    [tokens],
  );

  return {
    tokens,
    chains,
    assets,
    loading: tokensQ.isLoading,
    error: tokensQ.error ? 'registry_unavailable' : null,
    source: tokens.length ? ('live' as const) : ('none' as const),
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
