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
    expiresAt?: string;
  };
  expiresAt?: string;
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
  preferredProvider?: 'monnify' | 'flutterwave';
  callbackUrl?: string;
}) {
  return api.post<LocalOnrampOrder>('/fiat/local/onramp', body, { idempotent: true });
}

export function localOfframp(body: {
  userId: string;
  asset?: string;
  amount: string;
  fiatCurrency: string;
  bankAccountId: string;
  pin: string;
  quoteId?: string;
  preferredProvider?: 'monnify' | 'flutterwave';
}) {
  return api.post('/fiat/local/offramp', body, { idempotent: true });
}

export function localOfframpQuote(params: {
  asset: string;
  amount: string;
  fiatCurrency: string;
  userId?: string;
}) {
  const q = new URLSearchParams({
    asset: params.asset,
    amount: params.amount,
    fiatCurrency: params.fiatCurrency,
  });
  if (params.userId) q.set('userId', params.userId);
  return api.get<{
    quoteId: string;
    localAmount: string;
    netAmount: string;
    feeAmount: string;
    rate: unknown;
  }>(`/fiat/local/offramp-quote?${q}`);
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

/** PaymentIntent card domain — no PAN/CVV. */
export type PaymentCustomerAction =
  | { type: 'REDIRECT'; url: string }
  | { type: 'HOSTED_FIELDS'; publicKey: string; provider: string; clientReference: string }
  | { type: 'OTP'; challengeId: string }
  | { type: 'THREE_DS'; providerSessionId: string; clientActionToken?: string };

export type PaymentIntent = {
  id: string;
  status: string;
  amount: string;
  currency: string;
  asset: string | null;
  assetAmount: string | null;
  provider: string;
  clientReference: string;
  customerAction: PaymentCustomerAction | null;
  failureCode: string | null;
  failureReason: string | null;
  ledgerPosted: boolean;
};

export function createCardPayment(body: {
  amount: string;
  currency?: string;
  asset?: string;
  paymentMethodToken?: string;
  callbackUrl?: string;
  idempotencyKey?: string;
}) {
  return api.post<PaymentIntent>('/payments/card', body, { idempotent: true });
}

export function getPayment(id: string) {
  return api.get<PaymentIntent>(`/payments/${id}`);
}

export function refreshPayment(id: string) {
  return api.post<PaymentIntent>(`/payments/${id}/refresh`, {});
}
