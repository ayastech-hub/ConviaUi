import { api } from './client';

/** Internal omnibus swap — fee already applied in toAmount (net received). */
export type SwapQuote = {
  provider: 'internal';
  model: 'omnibus';
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  /** Net amount user receives after platform fee */
  toAmount: string;
  fee: string;
  feeBps: number;
  rate: string;
};

export function getSwapQuote(params: {
  fromAsset: string;
  toAsset: string;
  amount: string;
  fromChain?: string;
  toChain?: string;
}) {
  const q = new URLSearchParams();
  q.set('fromAsset', params.fromAsset);
  q.set('toAsset', params.toAsset);
  q.set('amount', params.amount);
  if (params.fromChain) q.set('fromChain', params.fromChain);
  if (params.toChain) q.set('toChain', params.toChain);
  return api.get<SwapQuote>(`/swap/quote?${q}`);
}

export function executeSwap(body: {
  userId: string;
  fromAsset: string;
  toAsset: string;
  amount: string;
  fromChain?: string;
  toChain?: string;
}) {
  return api.post<{
    model: string;
    provider: string;
    ledgerTransactionId?: string;
    fromAsset: string;
    toAsset: string;
    amountIn: string;
    amountOut: string;
    fee: string;
    rate: string;
    status: string;
  }>('/swap/execute', body, { idempotent: true });
}
