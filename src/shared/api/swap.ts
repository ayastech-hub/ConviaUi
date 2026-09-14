import { api } from './client';

/** POST /swap/quote — RateQuote / quoteId mechanism */
export type SwapQuote = {
  quoteId: string;
  kind: 'swap';
  fromAsset: string;
  toAsset: string;
  amount: string;
  rate: number | string;
  rateSource?: string;
  feeBps: number;
  feeAmount: string;
  toAmount: string;
  expiresAt: string;
};

export function getSwapQuote(params: {
  fromAsset: string;
  toAsset: string;
  amount: string;
  userId?: string;
}) {
  return api.post<SwapQuote>('/swap/quote', {
    fromAsset: params.fromAsset,
    toAsset: params.toAsset,
    amount: params.amount,
    ...(params.userId ? { userId: params.userId } : {}),
  });
}

export function executeSwap(body: {
  userId: string;
  quoteId: string;
  /** Optional — only needed while production still runs an older PIN-gated build */
  pin?: string;
}) {
  const payload: Record<string, string> = {
    userId: body.userId,
    quoteId: body.quoteId,
  };
  if (body.pin) payload.pin = body.pin;
  return api.post<{
    transactionId: string;
    quoteId: string;
    fromAsset: string;
    toAsset: string;
    fromAmount: string;
    toAmount: string;
    feeAmount: string;
    feeBps: number;
    rate: string;
    status: string;
  }>('/swap/execute', payload, { idempotent: true });
}
