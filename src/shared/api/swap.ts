import { api } from './client';

export function getSwapQuote(params: {
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  slippageBps?: number;
}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) q.set(k, String(v));
  });
  return api.get<Record<string, unknown>>(`/swap/quote?${q}`);
}

export function executeSwap(body: {
  userId: string;
  fromAsset: string;
  toAsset: string;
  amount: string;
  fromChain: string;
  toChain: string;
  slippageBps?: number;
}) {
  return api.post('/swap/execute', body, { idempotent: true });
}
