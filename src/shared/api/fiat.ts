import { api } from './client';

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
