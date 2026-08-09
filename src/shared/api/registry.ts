import { api } from './client';

export type RegistryChain = {
  chainKey?: string;
  key?: string;
  chainName?: string;
  name?: string;
  chainType?: string;
  depositsEnabled?: boolean;
  withdrawalsEnabled?: boolean;
  minWithdrawal?: string | number | null;
  requiredConfirmations?: number | null;
  networkFeeEstimate?: string | number | null;
  id?: string;
  chainIdNumeric?: number | null;
};

export type RegistryToken = {
  id: string;
  symbol: string;
  name: string;
  isStablecoin?: boolean;
  chains: RegistryChain[];
};

export function fetchTokenCatalog() {
  return api.get<{ tokens: RegistryToken[] }>('/tokens', { auth: false });
}

export function fetchChainCatalog() {
  return api.get<{ chains: RegistryChain[] }>('/chains', { auth: false });
}

export function fetchTokenChains(symbol: string, direction?: 'deposit' | 'withdraw') {
  const q = direction ? `?direction=${direction}` : '';
  return api.get<{
    symbol: string;
    isStablecoin?: boolean;
    chains: RegistryChain[];
  }>(`/tokens/${encodeURIComponent(symbol)}/chains${q}`, { auth: false });
}
