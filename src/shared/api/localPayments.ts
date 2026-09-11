import { api } from './client';

export type PaymentLeg = {
  asset: string;
  cryptoAmount: string;
  fiatAmount: string;
  rate: string;
  role: 'primary' | 'fallback';
};

export type LocalPaymentQuote = {
  quoteId: string;
  fiatAmount: string;
  fiatCurrency: string;
  purpose: string;
  purposeRef?: string;
  legs: PaymentLeg[];
  coveredFiat: string;
  feeFiat?: string;
  feeAsset?: string;
  feeCryptoAmount?: string;
  expiresAt: string;
  ratesStale: boolean;
};

export type SettleResult = {
  paymentId: string;
  quoteId: string;
  fiatAmount: string;
  fiatCurrency: string;
  legs: PaymentLeg[];
  ledgerTxIds: string[];
  providerRef?: string;
  status: 'settled' | 'pending_provider';
};

export function quoteLocalPayment(body: {
  fiatAmount: string;
  fiatCurrency: string;
  purpose: string;
  purposeRef?: string;
  primaryAsset: string;
  fallbackAssets?: string[];
  balances?: Record<string, string>;
  feeBps?: number;
}) {
  return api.post<LocalPaymentQuote>('/local-payments/quote', body);
}

export function settleLocalPayment(body: {
  quoteId: string;
  confirmFiatAmount: string;
  confirmFiatCurrency: string;
}) {
  return api.post<SettleResult>('/local-payments/settle', body, { idempotent: true });
}
