import { api } from './client';

export type VaultBalance = {
  totalUsd: string;
  usdt: string;
  usdc: string;
  /** NGN equivalent at last known rate */
  ngnEquivalent: string;
  rateNgnPerUsd: string;
};

export type VaultQuote = {
  quoteId: string;
  side: 'ngn_to_vault' | 'vault_to_ngn' | 'wallet_to_vault' | 'vault_to_wallet';
  amountIn: string;
  assetIn: string;
  amountOut: string;
  assetOut: string;
  rate: string;
  feeAmount: string;
  feeAsset: string;
  feeBps: number;
  expiresAt: string;
};

export type VaultMoveResult = {
  ok: boolean;
  ledgerTransactionId: string;
  quoteId?: string;
  amountIn: string;
  amountOut: string;
  status: 'completed' | 'pending' | 'failed';
};

export function getVault(userId: string) {
  return api.get<VaultBalance>(`/vault/${userId}`);
}

export function quoteToVault(body: {
  userId: string;
  amountNgn?: string;
  amountStable?: string;
  asset?: 'USDT' | 'USDC';
}) {
  return api.post<VaultQuote>('/vault/quote/to-vault', body);
}

export function quoteFromVault(body: {
  userId: string;
  amountUsd: string;
  target: 'ngn' | 'wallet';
  asset?: 'USDT' | 'USDC';
}) {
  return api.post<VaultQuote>('/vault/quote/from-vault', body);
}

export function executeVaultMove(body: {
  userId: string;
  quoteId: string;
}) {
  return api.post<VaultMoveResult>('/vault/execute', body);
}

export function listVaultActivity(userId: string, limit = 30) {
  return api.get<{ items: Array<Record<string, unknown>> }>(`/vault/${userId}/activity?limit=${limit}`);
}
