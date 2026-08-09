import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Asset } from '../data/mockData';
import {
  fetchTokenCatalog,
  fetchChainCatalog,
  type RegistryToken,
  type RegistryChain,
} from '../api/registry';
import { cacheGet, cacheSet } from '../cache/queryCache';

const TOKENS_KEY = 'registry:tokens';
const CHAINS_KEY = 'registry:chains';

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

type State = {
  tokens: RegistryToken[];
  chains: RegistryChain[];
  assets: Asset[];
  loading: boolean;
  error: string | null;
  source: 'live' | 'none';
};

export function useTokenRegistry() {
  const cachedTokens = cacheGet<RegistryToken[]>(TOKENS_KEY, 5 * 60_000);
  const cachedChains = cacheGet<RegistryChain[]>(CHAINS_KEY, 5 * 60_000);

  const [state, setState] = useState<State>({
    tokens: cachedTokens || [],
    chains: cachedChains || [],
    assets: (cachedTokens || []).map(tokenToAsset),
    loading: !cachedTokens,
    error: null,
    source: cachedTokens ? 'live' : 'none',
  });

  const refresh = useCallback(async () => {
    setState((s) => ({
      ...s,
      loading: s.assets.length === 0,
    }));
    try {
      const [tokRes, chainRes] = await Promise.all([
        fetchTokenCatalog(),
        fetchChainCatalog().catch(() => ({ chains: [] as RegistryChain[] })),
      ]);
      const tokens = tokRes.tokens || [];
      const chains = chainRes.chains || [];
      cacheSet(TOKENS_KEY, tokens);
      cacheSet(CHAINS_KEY, chains);
      setState({
        tokens,
        chains,
        assets: tokens.map(tokenToAsset),
        loading: false,
        error: null,
        source: 'live',
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'registry_unavailable',
        source: s.assets.length ? 'live' : 'none',
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getAsset = useCallback(
    (symbol: string) =>
      state.assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase()) ||
      state.assets[0],
    [state.assets],
  );

  const chainKeysForSymbol = useCallback(
    (symbol: string, direction?: 'deposit' | 'withdraw') => {
      const tok = state.tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
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
    [state.tokens],
  );

  return {
    ...state,
    refresh,
    getAsset,
    chainKeysForSymbol,
  };
}

/** Resolve UI network label → API chainKey when possible. */
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
