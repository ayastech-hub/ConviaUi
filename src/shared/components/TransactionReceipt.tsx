import { formatTokenAmountPrecise } from '../utils/formatAmount';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownLeft,
  RefreshCw, Plus, Minus, TrendingUp, TrendingDown, Copy, Check,
  Share2, ExternalLink, Loader,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { type Transaction } from '../data/mockData';
import { useCurrency } from '../context/CurrencyContext';

interface TransactionReceiptProps {
  tx: Transaction | null;
  open: boolean;
  onClose: () => void;
}

const txMeta: Record<string, { label: string; icon: typeof ArrowUpRight; color: string; sign: string }> = {
  receive: { label: 'Received', icon: ArrowDownLeft, color: 'var(--positive)', sign: '+' },
  send: { label: 'Sent', icon: ArrowUpRight, color: 'var(--foreground)', sign: '−' },
  swap: { label: 'Swap', icon: RefreshCw, color: 'var(--primary)', sign: '' },
  buy: { label: 'Buy', icon: Plus, color: 'var(--positive)', sign: '+' },
  sell: { label: 'Sell', icon: Minus, color: 'var(--foreground)', sign: '−' },
  airtime: { label: 'Airtime', icon: Minus, color: 'var(--foreground)', sign: '−' },
  data: { label: 'Mobile data', icon: Minus, color: 'var(--foreground)', sign: '−' },
  electricity: { label: 'Electricity', icon: Minus, color: 'var(--foreground)', sign: '−' },
  cable: { label: 'TV & cable', icon: Minus, color: 'var(--foreground)', sign: '−' },
  betting: { label: 'Betting', icon: Minus, color: 'var(--foreground)', sign: '−' },
  bill: { label: 'Bill payment', icon: Minus, color: 'var(--foreground)', sign: '−' },
  giveaway: { label: 'Giveaway', icon: Plus, color: 'var(--positive)', sign: '' },
  request: { label: 'Payment request', icon: ArrowUpRight, color: 'var(--foreground)', sign: '' },
  reward: { label: 'Reward', icon: Plus, color: 'var(--positive)', sign: '+' },
  offramp: { label: 'Cash out', icon: TrendingDown, color: 'var(--foreground)', sign: '−' },
  onramp: { label: 'Buy with fiat', icon: TrendingUp, color: 'var(--positive)', sign: '+' },
  deposit: { label: 'Deposit', icon: ArrowDownLeft, color: 'var(--positive)', sign: '+' },
  withdraw: { label: 'Withdrawal', icon: ArrowUpRight, color: 'var(--foreground)', sign: '−' },
};

const EXPLORER: Record<string, (hash: string) => string> = {
  ethereum: (h) => `https://etherscan.io/tx/${h}`,
  eth: (h) => `https://etherscan.io/tx/${h}`,
  polygon: (h) => `https://polygonscan.com/tx/${h}`,
  bnb: (h) => `https://bscscan.com/tx/${h}`,
  bsc: (h) => `https://bscscan.com/tx/${h}`,
  solana: (h) => `https://solscan.io/tx/${h}`,
  sol: (h) => `https://solscan.io/tx/${h}`,
  tron: (h) => `https://tronscan.org/#/transaction/${h}`,
  trx: (h) => `https://tronscan.org/#/transaction/${h}`,
  bitcoin: (h) => `https://blockchair.com/bitcoin/transaction/${h}`,
  btc: (h) => `https://blockchair.com/bitcoin/transaction/${h}`,
  arbitrum: (h) => `https://arbiscan.io/tx/${h}`,
  base: (h) => `https://basescan.org/tx/${h}`,
  ton: (h) => `https://tonviewer.com/transaction/${h}`,
};

function formatTimestamp(time: string | undefined, iso?: string): string {
  const raw = iso || time;
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return time || '—';
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function shortId(id: string | undefined, head = 8, tail = 6): string {
  if (!id) return '—';
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

function Row({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };
  return (
    <div className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <div className="flex items-center gap-1.5 min-w-0 justify-end">
        <span
          className={mono ? 'tabular-nums' : ''}
          style={{
            color: 'var(--foreground)',
            fontSize: 12,
            fontWeight: 600,
            textAlign: 'right',
            wordBreak: 'break-all',
            fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
          }}
        >
          {value}
        </span>
        {copyable && value !== '—' && (
          <button type="button" onClick={() => void copy()} className="flex-shrink-0 p-1 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
            {copied ? <Check size={12} style={{ color: 'var(--positive)' }} /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function TransactionReceipt({ tx, open, onClose }: TransactionReceiptProps) {
  const { format } = useCurrency();
  const [shareState, setShareState] = useState<'idle' | 'busy'>('idle');

  const meta = tx ? (txMeta[tx.type] || txMeta.send) : txMeta.send;
  const Icon = meta.icon;

  const status = useMemo(() => {
    if (!tx) return { label: '', color: '', Icon: Clock };
    if (tx.status === 'confirmed') return { label: 'Completed', color: 'var(--positive)', Icon: CheckCircle2 };
    if (tx.status === 'pending') return { label: 'Pending', color: '#F59E0B', Icon: Clock };
    return { label: 'Failed', color: 'var(--destructive)', Icon: AlertCircle };
  }, [tx]);

  const explorerUrl = useMemo(() => {
    if (!tx?.hash) return null;
    const key = (tx.network || tx.chainKey || '').toLowerCase();
    for (const [k, fn] of Object.entries(EXPLORER)) {
      if (key.includes(k)) return fn(tx.hash);
    }
    if (/^0x[a-fA-F0-9]{64}$/.test(tx.hash)) return EXPLORER.ethereum(tx.hash);
    return null;
  }, [tx]);

  const detailRows = useMemo(() => {
    if (!tx) return [] as { label: string; value: string; mono?: boolean; copyable?: boolean }[];
    const rows: { label: string; value: string; mono?: boolean; copyable?: boolean }[] = [];

    rows.push({ label: 'Type', value: (tx as { title?: string }).title || meta.label });
    rows.push({ label: 'Status', value: status.label });
    rows.push({ label: 'Date', value: formatTimestamp(tx.time, tx.createdAt) });

    if (tx.type === 'swap') {
      rows.push({
        label: 'From',
        value: `${formatTokenAmountPrecise(tx.amount)} ${tx.asset}`,
        mono: true,
      });
      rows.push({
        label: 'To',
        value: `${formatTokenAmountPrecise(tx.amountTo ?? 0)} ${tx.assetTo || '—'}`,
        mono: true,
      });
    } else {
      rows.push({
        label: 'Amount',
        value: `${meta.sign}${formatTokenAmountPrecise(tx.amount)} ${tx.asset}`,
        mono: true,
      });
    }

    if (tx.fiatAmount && tx.fiatCurrency) {
      rows.push({
        label: tx.type === 'offramp' || tx.type === 'sell' ? 'Fiat payout' : 'Fiat paid',
        value: `${tx.fiatAmount} ${tx.fiatCurrency}`,
        mono: true,
      });
    }

    if (tx.feeAmount) {
      rows.push({
        label: 'Fee',
        value: `${tx.feeAmount}${tx.feeAsset ? ` ${tx.feeAsset}` : ''}`,
        mono: true,
      });
    }

    if (tx.network || tx.chainKey) {
      rows.push({ label: 'Network', value: tx.network || tx.chainKey || '—' });
    }

    if (tx.address || tx.counterparty) {
      rows.push({
        label: tx.type === 'deposit' || tx.type === 'receive' ? 'From' : 'To',
        value: shortId(tx.address || tx.counterparty, 10, 8),
        mono: true,
        copyable: true,
      });
    }

    rows.push({ label: 'Transaction ID', value: shortId(tx.id, 10, 8), mono: true, copyable: true });

    if (tx.orderId) {
      rows.push({ label: 'Order / ref ID', value: shortId(tx.orderId, 10, 8), mono: true, copyable: true });
    }
    if (tx.reference) {
      rows.push({ label: 'Payment reference', value: tx.reference, mono: true, copyable: true });
    }
    if (tx.hash) {
      rows.push({ label: 'Tx hash', value: shortId(tx.hash, 12, 10), mono: true, copyable: true });
    }
    if (tx.rawType && tx.rawType !== tx.type) {
      rows.push({ label: 'Ledger type', value: tx.rawType, mono: true });
    }

    return rows;
  }, [tx, meta.label, status.label]);

  if (!tx) return null;

  const amountHero =
    tx.type === 'swap'
      ? `${formatTokenAmountPrecise(tx.amount)} ${tx.asset} → ${formatTokenAmountPrecise(tx.amountTo ?? 0)} ${tx.assetTo || ''}`
      : `${meta.sign}${formatTokenAmountPrecise(tx.amount)} ${tx.asset}`;

  const handleShare = async () => {
    setShareState('busy');
    try {
      const text = [
        `Convia · ${meta.label}`,
        amountHero,
        `Status: ${status.label}`,
        `ID: ${tx.id}`,
        tx.hash ? `Hash: ${tx.hash}` : '',
        explorerUrl || '',
      ].filter(Boolean).join('\n');
      if (navigator.share) await navigator.share({ title: 'Convia receipt', text });
      else await navigator.clipboard.writeText(text);
    } catch { /* ignore */ }
    finally { setShareState('idle'); }
  };

  const StatusIcon = status.Icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[90] max-h-[92vh] flex flex-col rounded-t-[24px] overflow-hidden"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="w-9" />
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <X size={16} style={{ color: 'var(--foreground)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="flex flex-col items-center text-center mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
                >
                  <Icon size={24} style={{ color: meta.color }} strokeWidth={2.2} />
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>{meta.label}</p>
                <p className="tabular-nums mt-1" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 26, letterSpacing: -0.5 }}>
                  {amountHero}
                </p>
                <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
                  <StatusIcon size={13} style={{ color: status.color }} />
                  <span style={{ color: status.color, fontSize: 12, fontWeight: 700 }}>{status.label}</span>
                </div>
              </div>

              <div className="rounded-[20px] px-4 py-1 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {detailRows.map((r) => (
                  <Row key={r.label} label={r.label} value={r.value} mono={r.mono} copyable={r.copyable} />
                ))}
              </div>

              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl mb-3"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 650, fontSize: 13 }}
                >
                  <ExternalLink size={15} />
                  View on explorer
                </a>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  disabled={shareState === 'busy'}
                  className="flex-1 h-11 rounded-full flex items-center justify-center gap-2"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 650, fontSize: 13 }}
                >
                  {shareState === 'busy' ? <Loader size={15} className="animate-spin" /> : <Share2 size={15} />}
                  Share
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-full"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 700, fontSize: 13 }}
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
