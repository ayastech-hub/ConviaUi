import { api } from './client';

/** Omnibus internal transfer — ledger only, no chain required. */
export function sendToUsername(body: {
  senderId: string;
  recipientUsername: string;
  asset: string;
  amount: string;
  note?: string;
  /** Legacy optional — ignored by omnibus backend */
  chainKey?: string;
  chainFamily?: 'evm' | 'solana' | 'bitcoin' | 'tron';
}) {
  return api.post<{
    model?: string;
    ledgerTransactionId?: string;
    status?: string;
    asset?: string;
    amount?: string;
    txHash?: string;
  }>('/payments/send', body, { idempotent: true });
}
