import type { Asset } from '../../../../shared/data/mockData';

export interface NetworkInfo {
  name: string;
  label: string;
  color: string;
  confirmations: number;
  estTime: string;
  minDeposit: number;
  minDepositUsd?: number;
  explorer: string;
  chainKey: string;
}

/** Fallback native mins when API has not returned live minimum yet. */
export const ASSET_MIN_DEPOSIT: Record<string, number> = {
  USDT: 0.1,
  USDC: 0.1,
  USD: 0.1,
  BTC: 0.00005,
  ETH: 0.002,
  BNB: 0.01,
  SOL: 0.05,
  TRX: 50,
  TON: 2,
  POL: 5,
  AERO: 5,
  JUP: 5,
  NOT: 500,
};

/** Meta keyed by backend chainKey (lowercase). */
export const CHAIN_META: Record<string, Omit<NetworkInfo, 'chainKey' | 'minDepositUsd'>> = {
  ethereum: {
    name: 'Ethereum',
    label: 'ERC-20',
    color: 'var(--muted-foreground)',
    confirmations: 12,
    estTime: '3–5 min',
    minDeposit: 0.1,
    explorer: 'etherscan.io',
  },
  sepolia: {
    name: 'Ethereum Sepolia',
    label: 'ERC-20',
    color: 'var(--muted-foreground)',
    confirmations: 2,
    estTime: '~1 min',
    minDeposit: 0.1,
    explorer: 'sepolia.etherscan.io',
  },
  base: {
    name: 'Base',
    label: 'Base',
    color: 'var(--muted-foreground)',
    confirmations: 12,
    estTime: '2–4 min',
    minDeposit: 0.1,
    explorer: 'basescan.org',
  },
  bnb: {
    name: 'BNB Smart Chain',
    label: 'BEP-20',
    color: 'var(--muted-foreground)',
    confirmations: 15,
    estTime: '1–3 min',
    minDeposit: 0.1,
    explorer: 'bscscan.com',
  },
  polygon: {
    name: 'Polygon',
    label: 'Polygon',
    color: 'var(--muted-foreground)',
    confirmations: 30,
    estTime: '2–5 min',
    minDeposit: 0.1,
    explorer: 'polygonscan.com',
  },
  solana: {
    name: 'Solana',
    label: 'SPL',
    color: 'var(--muted-foreground)',
    confirmations: 1,
    estTime: '1–10 sec',
    minDeposit: 0.1,
    explorer: 'solscan.io',
  },
  tron: {
    name: 'Tron',
    label: 'TRC-20',
    color: 'var(--muted-foreground)',
    confirmations: 19,
    estTime: '1–2 min',
    minDeposit: 0.1,
    explorer: 'tronscan.org',
  },
  bitcoin: {
    name: 'Bitcoin',
    label: 'BTC',
    color: 'var(--muted-foreground)',
    confirmations: 3,
    estTime: '10–30 min',
    minDeposit: 0.00005,
    explorer: 'mempool.space',
  },
  ton: {
    name: 'TON',
    label: 'TON',
    color: 'var(--muted-foreground)',
    confirmations: 1,
    estTime: '~5 sec',
    minDeposit: 0.1,
    explorer: 'tonviewer.com',
  },
};

/** @deprecated use CHAIN_META + resolveChain; kept for any leftover imports */
export const NETWORKS: Record<string, NetworkInfo> = Object.fromEntries(
  Object.entries(CHAIN_META).map(([k, v]) => [k, { ...v, chainKey: k }]),
);

export function networkInfoForKey(chainKeyOrLabel: string): NetworkInfo {
  const raw = (chainKeyOrLabel || '').trim();
  const k = raw.toLowerCase().replace(/\s+/g, '');
  const aliases: Record<string, string> = {
    eth: 'ethereum',
    ethereum: 'ethereum',
    sepolia: 'sepolia',
    bsc: 'bnb',
    bnbsmartchain: 'bnb',
    bnb: 'bnb',
    base: 'base',
    polygon: 'polygon',
    matic: 'polygon',
    solana: 'solana',
    sol: 'solana',
    tron: 'tron',
    trx: 'tron',
    bitcoin: 'bitcoin',
    btc: 'bitcoin',
    ton: 'ton',
    toncoin: 'ton',
  };
  const key =
    aliases[k] ||
    (k.includes('sepolia')
      ? 'sepolia'
      : k.includes('ton')
        ? 'ton'
        : k.includes('tron')
          ? 'tron'
          : k.includes('sol')
            ? 'solana'
            : k.includes('bnb') || k.includes('bsc')
              ? 'bnb'
              : k.includes('base')
                ? 'base'
                : k.includes('polygon') || k.includes('matic')
                  ? 'polygon'
                  : k.includes('bitcoin') || k === 'btc'
                    ? 'bitcoin'
                    : k.includes('eth')
                      ? 'ethereum'
                      : k);
  const meta = CHAIN_META[key] || {
    name: raw || 'Network',
    label: raw || '—',
    color: 'var(--muted-foreground)',
    confirmations: 12,
    estTime: '3–5 min',
    minDeposit: 0,
    explorer: '',
  };
  return { ...meta, chainKey: key };
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

export const MOCK_DEPOSITS: DepositRecord[] = [];
