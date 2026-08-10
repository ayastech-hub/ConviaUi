import { api } from './client';

/** Omnibus internal transfer — ledger only, chain optional/ignored. */
export function sendToUsername(body: {
  senderId: string;
  recipientUsername: string;
  asset: string;
  amount: string;
  note?: string;
}) {
  return api.post<{
    model?: string;
    ledgerTransactionId?: string;
    status?: string;
    asset?: string;
    amount?: string;
    recipientUserId?: string;
    recipientUsername?: string;
  }>('/payments/send', body, { idempotent: true });
}
