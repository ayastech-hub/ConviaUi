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
  TRX: { name: 'TRON', color: '#FF0013', bgColor: 'rgba(255,0,19,0.15)', chains: ['Tron'] },
  POL: { name: 'Polygon', color: '#8247E5', bgColor: 'rgba(130,71,229,0.15)', chains: ['Polygon'] },
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
  const raw = `${t.type || ''} ${t.title || ''} ${t.kind || ''}`.toLowerCase();
  if (raw.includes('network_fee') || raw.includes('network fee')) return 'withdraw'; // should be filtered server-side
  if (raw.includes('swap')) return 'swap';
  if (raw.includes('withdraw') || raw.includes('withdrawal') || t.kind === 'withdrawal') return 'withdraw';
  if (raw.includes('deposit') || raw === 'credit' || t.kind === 'deposit' || t.type === 'deposit_request') return 'deposit';
  if (raw.includes('onramp') || raw === 'buy') return 'buy';
  if (raw.includes('offramp') || raw === 'sell') return 'sell';
  if (raw.includes('bill')) return 'sell';
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

function pickAssetTo(t: ApiTransaction): string | undefined {
  if (t.assetTo) return String(t.assetTo);
  const meta = (t.metadata || {}) as Record<string, unknown>;
  if (meta.to) return String(meta.to);
  if (meta.toAsset) return String(meta.toAsset);
  const credit = (t.entries || []).find((e) => e.direction === 'credit');
  if (credit?.asset) return credit.asset;
  return undefined;
}

function pickAmountTo(t: ApiTransaction): number | undefined {
  if (t.amountTo != null && t.amountTo !== '') return Number(t.amountTo) || undefined;
  const credit = (t.entries || []).find((e) => e.direction === 'credit');
  if (credit?.amount) return Number(credit.amount) || undefined;
  return undefined;
}

export function apiTxToUi(t: ApiTransaction): Transaction {
  const isSwap = mapType(t) === 'swap';
  // Prefer principal amount; ignore dust network-fee legs if any slip through
  let amount = Number(t.amount) || 0;
  if ((t.type || '').toLowerCase().includes('network_fee') && amount > 0 && amount < 1e-4) {
    amount = 0;
  }
  const amountTo = pickAmountTo(t);
  const assetTo = pickAssetTo(t);
  const created = t.createdAt ? new Date(t.createdAt) : new Date();
  const time = Number.isNaN(created.getTime())
    ? ''
    : created.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const mapped = mapType(t);
  return {
    id: t.id,
    type: mapped,
    asset: t.asset || '—',
    assetTo: isSwap ? assetTo || undefined : assetTo,
    amount,
    amountTo: isSwap ? amountTo : amountTo,
    valueUSD: amount,
    time,
    status: mapStatus(t.status),
    hash: t.txHash || undefined,
  };
}

/** Drop internal / dust rows the UI should never show */
export function filterHistoryForUi(txs: Transaction[]): Transaction[] {
  return txs.filter((tx) => {
    if (tx.amount === 0 && tx.type !== 'swap') return false;
    // Dust gas mistaken as send
    if (tx.type === 'send' && tx.amount > 0 && tx.amount < 1e-5) return false;
    return true;
  });
}
