import { api } from './client';

/** Local rails (Paystack primary, Flutterwave backup) — preferred path. */
export type LocalOnrampQuote = {
  asset: string;
  fiatCurrency: string;
  fiatAmount: string;
  rate: number;
  grossCrypto: string;
  feeAmount: string;
  netCrypto: string;
  feeBps: number;
};

export type LocalOnrampOrder = {
  orderId: string;
  reference: string;
  provider: string;
  quote: LocalOnrampQuote;
  payment: {
    provider: string;
    externalId: string;
    reference: string;
    amount: string;
    currency: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    checkoutUrl?: string;
    accessCode?: string;
    status: string;
  };
  status: string;
  note?: string;
};

export function localOnrampQuote(params: {
  fiatCurrency: string;
  fiatAmount: string;
  toAsset?: string;
}) {
  const q = new URLSearchParams({
    fiatCurrency: params.fiatCurrency,
    fiatAmount: params.fiatAmount,
    toAsset: params.toAsset || 'USDT',
  });
  return api.get<LocalOnrampQuote>(`/fiat/local/quote?${q}`);
}

export function localOnrampOrder(body: {
  userId: string;
  email: string;
  fiatCurrency: string;
  fiatAmount: string;
  toAsset?: string;
  method: 'bank_transfer' | 'card' | 'dedicated_account';
  preferredProvider?: 'paystack' | 'flutterwave';
  callbackUrl?: string;
}) {
  return api.post<LocalOnrampOrder>('/fiat/local/onramp', body, { idempotent: true });
}

export function localOfframp(body: {
  userId: string;
  asset?: string;
  amount: string;
  fiatCurrency: string;
  bankCode: string;
  accountNumber: string;
  accountName?: string;
  preferredProvider?: 'paystack' | 'flutterwave';
}) {
  return api.post('/fiat/local/offramp', body, { idempotent: true });
}

/** Legacy Yellow Card paths (kept for compatibility). */
export function onrampQuote(body: Record<string, unknown>) {
  return api.post('/fiat/onramp/quote', body);
}

export function onrampOrder(body: Record<string, unknown>) {
  return api.post('/fiat/onramp/orders', body, { idempotent: true });
}

export function offrampInitiate(body: Record<string, unknown>) {
  return api.post('/fiat/offramp/initiate', body, { idempotent: true });
}

export function offrampEligibility(userId: string) {
  return api.get<{
    canOfframp: boolean;
    kycStatus: string;
    action: string;
    [k: string]: unknown;
  }>(`/fiat/offramp/eligibility/${userId}`);
}

export function fiatQuote(params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return api.get(`/fiat/quote?${q}`);
}
