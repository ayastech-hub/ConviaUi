import type { Asset } from '../../../../shared/data/mockData';

export interface NetworkInfo {
  name: string;
  label: string;
  color: string;
  confirmations: number;
  estTime: string;
  minDeposit: number;
  explorer: string;
}

export const NETWORKS: Record<string, NetworkInfo> = {
  Bitcoin: { name: 'Bitcoin', label: 'BTC', color: 'var(--muted-foreground)', confirmations: 3, estTime: '10–30 min', minDeposit: 0.0001, explorer: 'mempool.space' },
  Ethereum: { name: 'Ethereum', label: 'ERC-20', color: 'var(--muted-foreground)', confirmations: 12, estTime: '3–5 min', minDeposit: 0.005, explorer: 'etherscan.io' },
  BASE: { name: 'BASE', label: 'Base', color: 'var(--muted-foreground)', confirmations: 12, estTime: '2–4 min', minDeposit: 0.005, explorer: 'basescan.org' },
  BSC: { name: 'BNB Smart Chain', label: 'BEP-20', color: 'var(--muted-foreground)', confirmations: 15, estTime: '1–3 min', minDeposit: 0.01, explorer: 'bscscan.com' },
  Solana: { name: 'Solana', label: 'SPL', color: 'var(--muted-foreground)', confirmations: 1, estTime: '1–10 sec', minDeposit: 0.01, explorer: 'solscan.io' },
  Tron: { name: 'Tron', label: 'TRC-20', color: 'var(--muted-foreground)', confirmations: 19, estTime: '1–2 min', minDeposit: 1, explorer: 'tronscan.org' },
};

/** Deterministic mock address generator (not a real address — for UI demo purposes only). */
export function generateAddress(asset: Asset, network: string): string {
  const seed = asset.id + network;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * +seed.charCodeAt(i)) >>> 0;

  const charset =
    network === 'Bitcoin'
      ? 'qpzry9x8gf2tvdw0s3jn74li6eughk1mca'
      : network === 'Solana'
      ? '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      : '0123456789abcdef';

  const len = network === 'Bitcoin' ? 42 : network === 'Solana' ? 44 : 40;
  let s = '';
  let x = h;
  for (let i = 0; i < len; i++) {
    x = (x * 1103515245 + 12345 + i * 7) & 0x7fffffff;
    s += charset[x % charset.length];
  }
  const prefix = network === 'Bitcoin' ? 'bc1q' : network === 'Solana' ? '' : '0x';
  return prefix + s;
}

export interface DepositRecord {
  id: string;
  asset: string;
  network: string;
  amount: number;
  amountUSD: number;
  time: string;
  status: 'confirmed' | 'pending' | 'failed';
  confirmations: number;
  needed: number;
}

export const MOCK_DEPOSITS: DepositRecord[] = [
  { id: 'd1', asset: 'USDT', network: 'Tron', amount: 500, amountUSD: 500, time: '2m ago', status: 'pending', confirmations: 7, needed: 19 },
  { id: 'd2', asset: 'ETH', network: 'Ethereum', amount: 0.42, amountUSD: 1379.36, time: '1h ago', status: 'confirmed', confirmations: 14, needed: 12 },
  { id: 'd3', asset: 'USDC', network: 'Solana', amount: 1200, amountUSD: 1200, time: '5h ago', status: 'confirmed', confirmations: 1, needed: 1 },
  { id: 'd4', asset: 'SOL', network: 'Solana', amount: 3.5, amountUSD: 624.58, time: '1d ago', status: 'confirmed', confirmations: 1, needed: 1 },
  { id: 'd5', asset: 'BTC', network: 'Bitcoin', amount: 0.008, amountUSD: 539.36, time: '2d ago', status: 'failed', confirmations: 1, needed: 3 },
];
