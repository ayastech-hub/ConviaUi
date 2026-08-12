import { api } from './client';

/** Unified row from GET /users/:userId/transactions (transaction-history.ts). */
export type ApiTransaction = {
  id: string;
  kind: 'ledger' | 'fiat' | 'withdrawal' | 'deposit' | string;
  type: string;
  title?: string;
  status: string;
  createdAt: string;
  asset: string | null;
  amount: string | null;
  assetTo?: string | null;
  amountTo?: string | null;
  direction: 'credit' | 'debit' | string | null;
  title?: string;
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
  nextCursor?: string | null;
  count?: number;
};

/**
 * Backend returns `{ items, nextCursor, count }` — normalize to `transactions`
 * so history lists are not empty.
 */
export async function fetchTransactions(
  userId: string,
  opts?: { limit?: number; kind?: string },
): Promise<TransactionsResponse> {
  const q = new URLSearchParams();
  if (opts?.limit) q.set('limit', String(opts.limit));
  if (opts?.kind) q.set('kind', opts.kind);
  const qs = q.toString();
  const raw = await api.get<{
    items?: ApiTransaction[];
    transactions?: ApiTransaction[];
    nextCursor?: string | null;
    count?: number;
  }>(`/users/${userId}/transactions${qs ? `?${qs}` : ''}`);

  const list = Array.isArray(raw?.items)
    ? raw.items
    : Array.isArray(raw?.transactions)
      ? raw.transactions
      : Array.isArray(raw)
        ? (raw as ApiTransaction[])
        : [];

  return {
    transactions: list,
    nextCursor: raw?.nextCursor ?? null,
    count: raw?.count ?? list.length,
  };
}
