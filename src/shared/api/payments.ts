import { api } from './client';

/** Internal username transfer (on-chain via withdrawal under the hood). */
export function sendToUsername(body: {
  senderId: string;
  recipientUsername: string;
  asset: string;
  amount: string;
  chainKey: string;
  chainFamily: 'evm' | 'solana' | 'bitcoin' | 'tron';
  note?: string;
}) {
  return api.post('/payments/send', body, { idempotent: true });
}
