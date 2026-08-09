import type { HoldingView } from '../api/portfolio';
import type { ApiTransaction } from '../api/transactions';
import type { Asset, Transaction } from '../data/mockData';

const ASSET_META: Record<string, { name: string; color: string; bgColor: string; chains: string[] }> = {
  BTC: { name: 'Bitcoin', color: '#F7931A', bgColor: 'rgba(247,147,26,0.15)', chains: ['Bitcoin'] },
  ETH: { name: 'Ethereum', color: '#627EEA', bgColor: 'rgba(98,126,234,0.15)', chains: ['Ethereum'] },
  SOL: { name: 'Solana', color: '#9945FF', bgColor: 'rgba(153,69,255,0.15)', chains: ['Solana'] },
  USD: { name: 'US Dollar', color: '#26A17B', bgColor: 'rgba(38,161,123,0.15)', chains: [] },
  USDT: { name: 'Tether USD', color: '#26A17B', bgColor: 'rgba(38,161,123,0.15)', chains: ['Ethereum', 'Tron'] },
  USDC: { name: 'USD Coin', color: '#2775CA', bgColor: 'rgba(39,117,202,0.15)', chains: ['Ethereum'] },
  BNB: { name: 'BNB', color: '#F3BA2F', bgColor: 'rgba(243,186,47,0.15)', chains: ['BSC'] },
};

export function holdingToAsset(h: HoldingView): Asset {
  const meta = ASSET_META[h.asset] || {
    name: h.asset,
    color: '#71717A',
    bgColor: 'rgba(113,113,122,0.15)',
    chains: [],
  };
  const price = Number(h.priceUsd) || 0;
  const balance = Number(h.quantity) || 0;
  const valueUSD = Number(h.valueUsd) || balance * price;
  return {
    id: h.asset.toLowerCase(),
    symbol: h.asset,
    name: meta.name,
    price,
    change24h: 0,
    balance,
    valueUSD,
    color: meta.color,
    bgColor: meta.bgColor,
    chains: meta.chains,
    sparkline: [],
  };
}

function mapType(t: ApiTransaction): Transaction['type'] {
  const raw = (t.type || t.kind || '').toLowerCase();
  if (raw.includes('swap')) return 'swap';
  if (raw.includes('withdraw')) return 'withdraw';
  if (raw.includes('deposit') || raw === 'credit') return 'deposit';
  if (raw.includes('onramp') || raw === 'buy') return 'buy';
  if (raw.includes('offramp') || raw === 'sell') return 'sell';
  if (t.direction === 'credit') return 'receive';
  if (t.direction === 'debit') return 'send';
  return 'send';
}

function mapStatus(s: string): Transaction['status'] {
  const v = (s || '').toLowerCase();
  if (v.includes('fail') || v.includes('reject')) return 'failed';
  if (v.includes('pend') || v.includes('process')) return 'pending';
  return 'confirmed';
}

export function apiTxToUi(t: ApiTransaction): Transaction {
  const amount = Number(t.amount) || 0;
  const created = t.createdAt ? new Date(t.createdAt) : new Date();
  const time = Number.isNaN(created.getTime())
    ? ''
    : created.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return {
    id: t.id,
    type: mapType(t),
    asset: t.asset || '—',
    amount,
    valueUSD: amount, // exact USD unknown without price; UI still shows amount
    time,
    status: mapStatus(t.status),
    hash: t.txHash || undefined,
  };
}
