import { api } from './client';

export type ApiRequestLink = {
  id: string;
  requesterId: string;
  code: string;
  asset: string;
  amount: string;
  note?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  payPath?: string;
  requesterUsername?: string | null;
};

export function createRequestLink(body: {
  asset: string;
  amount: string;
  note?: string;
  expiresAt?: string;
  pin?: string;
}) {
  return api.post<ApiRequestLink>('/request-links', body, { idempotent: true });
}

export function listMyRequestLinks() {
  return api.get<{ items: ApiRequestLink[] }>('/request-links/mine');
}

export function getRequestLinkByCode(code: string) {
  return api.get<ApiRequestLink>(`/request-links/code/${encodeURIComponent(code)}`, { auth: false });
}

export function payRequestLink(code: string, pin?: string) {
  return api.post<{ id: string; status: string; asset: string; amount: string; ledgerTxId?: string }>(
    '/request-links/pay',
    { code, ...(pin ? { pin } : {}) },
    { idempotent: true },
  );
}

export function cancelRequestLink(id: string) {
  return api.post<ApiRequestLink>(`/request-links/${encodeURIComponent(id)}/cancel`, {});
}
