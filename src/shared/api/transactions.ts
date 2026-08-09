import { api } from './client';

/** Actual unified row from GET /users/:userId/transactions (transaction-history.ts). */
export type ApiTransaction = {
  id: string;
  kind: 'ledger' | 'fiat' | 'withdrawal' | 'deposit' | string;
  type: string;
  status: string;
  createdAt: string;
  asset: string | null;
  amount: string | null;
  direction: 'credit' | 'debit' | string | null;
  txHash: string | null;
  chainKey: string | null;
  metadata?: Record<string, unknown>;
  entries?: Array<{
    accountId: string;
    direction: string;
    amount: string;
    asset: string;
  }>;
};

export type TransactionsResponse = {
  transactions: ApiTransaction[];
};

export function fetchTransactions(userId: string, opts?: { limit?: number; kind?: string }) {
  const q = new URLSearchParams();
  if (opts?.limit) q.set('limit', String(opts.limit));
  if (opts?.kind) q.set('kind', opts.kind);
  const qs = q.toString();
  return api.get<TransactionsResponse>(`/users/${userId}/transactions${qs ? `?${qs}` : ''}`);
}
