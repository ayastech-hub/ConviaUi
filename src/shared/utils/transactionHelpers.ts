import type { Transaction } from '../data/mockData';

/** Funds in */
const IN: Set<Transaction['type']> = new Set([
  'receive',
  'deposit',
  'onramp',
  'buy',
  'reward',
  'giveaway',
  'request',
  'vault_out',
]);

/** Funds out */
const OUT: Set<Transaction['type']> = new Set([
  'send',
  'withdraw',
  'offramp',
  'sell',
  'airtime',
  'data',
  'electricity',
  'cable',
  'betting',
  'bill',
  'vault_in',
]);

export type TxDirection = 'in' | 'out' | 'neutral';

export function getTxDirection(type: Transaction['type'] | string): TxDirection {
  if (IN.has(type as Transaction['type'])) return 'in';
  if (OUT.has(type as Transaction['type'])) return 'out';
  return 'neutral';
}

/** CSS color tokens for amount / accent */
export function getTxColor(type: Transaction['type'] | string): string {
  const d = getTxDirection(type);
  if (d === 'in') return 'var(--positive, #22c55e)';
  if (d === 'out') return 'var(--destructive, #ef4444)';
  return 'var(--foreground)';
}

export function getTxSign(type: Transaction['type'] | string): '+' | '-' | '' {
  const d = getTxDirection(type);
  if (d === 'in') return '+';
  if (d === 'out') return '-';
  return '';
}

const LABELS: Partial<Record<Transaction['type'], string>> = {
  send: 'Sent',
  receive: 'Received',
  swap: 'Swap',
  buy: 'Buy',
  sell: 'Sell',
  offramp: 'Sell',
  onramp: 'Buy',
  deposit: 'Deposit',
  withdraw: 'Withdrawal',
  airtime: 'Airtime',
  data: 'Mobile data',
  electricity: 'Electricity',
  cable: 'TV & cable',
  betting: 'Betting',
  bill: 'Bill payment',
  giveaway: 'Giveaway',
  request: 'Payment request',
  reward: 'Reward',
  vault_in: 'Vault deposit',
  vault_out: 'Vault withdraw',
};

export function getTxLabel(type: Transaction['type'] | string, title?: string): string {
  if (title && title.trim()) return title;
  return LABELS[type as Transaction['type']] || String(type);
}
