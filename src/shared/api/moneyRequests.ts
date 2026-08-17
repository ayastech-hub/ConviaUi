import { api } from './client';

export type MoneyRequestItem = {
  id: string;
  status: string;
  asset: string;
  amount: string;
  note?: string | null;
  expiresAt: string;
  createdAt: string;
  requesterUsername?: string | null;
  payerUsername?: string | null;
  direction: 'incoming' | 'outgoing';
  paidLedgerTxId?: string | null;
};

export function createMoneyRequest(body: {
  payerUsername: string;
  asset: string;
  amount: string;
  note?: string;
}) {
  return api.post<{
    id: string;
    status: string;
    asset: string;
    amount: string;
    payerUsername: string;
    expiresAt: string;
    sharePath?: string;
  }>('/payments/requests', body, { idempotent: true });
}

export function listMoneyRequests(role: 'incoming' | 'outgoing' | 'all' = 'incoming') {
  return api.get<{ items: MoneyRequestItem[] }>(`/payments/requests?role=${role}`);
}

export function payMoneyRequest(id: string) {
  return api.post<{ id: string; status: string; ledgerTransactionId?: string }>(
    `/payments/requests/${id}/pay`,
    {},
    { idempotent: true },
  );
}

export function declineMoneyRequest(id: string) {
  return api.post(`/payments/requests/${id}/decline`, {});
}

export function cancelMoneyRequest(id: string) {
  return api.post(`/payments/requests/${id}/cancel`, {});
}

export function getPayLink(username: string) {
  return api.get<{ username: string; displayName?: string | null; message?: string }>(
    `/payments/pay-link/${encodeURIComponent(username)}`,
    { auth: false },
  );
}

export function fetchLocales(country?: string) {
  const q = country ? `?country=${encodeURIComponent(country)}` : '';
  return api.get<{
    default: string;
    suggested: string[];
    all: Array<{ code: string; label: string }>;
    policy: string;
  }>(`/meta/locales${q}`, { auth: false });
}
