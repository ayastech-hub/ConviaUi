import type { Asset } from '../../../../shared/data/mockData';

export interface NetworkInfo {
  name: string;
  label: string;
  color: string;
  estTime: string;
}

export const NETWORKS: Record<string, NetworkInfo> = {
  Bitcoin: { name: 'Bitcoin', label: 'BTC', color: 'var(--muted-foreground)', estTime: '10–30 min' },
  Ethereum: { name: 'Ethereum', label: 'ERC-20', color: 'var(--muted-foreground)', estTime: '3–5 min' },
  BASE: { name: 'BASE', label: 'Base', color: 'var(--muted-foreground)', estTime: '2–4 min' },
  BSC: { name: 'BNB Smart Chain', label: 'BEP-20', color: 'var(--muted-foreground)', estTime: '1–3 min' },
  Solana: { name: 'Solana', label: 'SPL', color: 'var(--muted-foreground)', estTime: '1–10 sec' },
  Tron: { name: 'Tron', label: 'TRC-20', color: 'var(--muted-foreground)', estTime: '1–2 min' },
};

/**
 * Deterministic mock address generator (not a real address — for UI demo
 * purposes only). Note: this uses a different hash formula than the one
 * in `wallet/components/deposit/types.ts` (this one multiplies by 31
 * before adding the char code; Deposit's doesn't) — that's an
 * inconsistency inherited from the original design, not introduced by
 * this refactor, so it's kept as-is rather than unified, to avoid
 * silently changing either screen's generated addresses.
 */
export function generateAddress(asset: Asset, network: string): string {
  const seed = asset.id + network;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

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
