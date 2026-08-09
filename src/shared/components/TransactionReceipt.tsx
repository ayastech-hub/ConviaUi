import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownLeft,
  RefreshCw, Plus, Minus, TrendingUp, TrendingDown, Copy, Check,
  Share2, Download,
} from 'lucide-react';
import { useState } from 'react';
import { type Transaction } from '../data/mockData';
import { useCurrency } from '../context/CurrencyContext';

interface TransactionReceiptProps {
  tx: Transaction | null;
  open: boolean;
  onClose: () => void;
}

const txMeta: Record<string, { label: string; icon: typeof ArrowUpRight; color: string; sign: string }> = {
  receive: { label: 'Received', icon: ArrowDownLeft, color: 'var(--positive)', sign: '+' },
  send: { label: 'Sent', icon: ArrowUpRight, color: 'var(--foreground)', sign: '-' },
  swap: { label: 'Swapped', icon: RefreshCw, color: 'var(--muted-foreground)', sign: '~' },
  buy: { label: 'Bought', icon: Plus, color: 'var(--positive)', sign: '+' },
  sell: { label: 'Sold', icon: Minus, color: 'var(--foreground)', sign: '-' },
  offramp: { label: 'Off-Ramp', icon: TrendingDown, color: 'var(--muted-foreground)', sign: '-' },
  onramp: { label: 'On-Ramp', icon: TrendingUp, color: 'var(--positive)', sign: '+' },
  deposit: { label: 'Deposit', icon: ArrowDownLeft, color: 'var(--positive)', sign: '+' },
  withdraw: { label: 'Withdraw', icon: ArrowUpRight, color: 'var(--foreground)', sign: '-' },
};

function generateHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
}

function generateTimestamp(time: string): string {
  const now = new Date();
  return now.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function TransactionReceipt({ tx, open, onClose }: TransactionReceiptProps) {
  const { format } = useCurrency();
  const [copied, setCopied] = useState(false);

  if (!tx) return null;

  const meta = txMeta[tx.type] ?? txMeta.receive;
  const Icon = meta.icon;
  const hash = tx.hash || generateHash();
  const timestamp = generateTimestamp(tx.time);

  const handleCopy = () => {
    navigator.clipboard?.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    confirmed: { icon: CheckCircle2, color: 'var(--positive)', label: 'Confirmed', bg: 'var(--muted)' },
    pending: { icon: Clock, color: 'var(--muted-foreground)', label: 'Pending', bg: 'var(--muted)' },
    failed: { icon: AlertCircle, color: 'var(--destructive)', label: 'Failed', bg: 'var(--muted)' },
  };
  const status = statusConfig[tx.status];
  const StatusIcon = status.icon;

  const rows = [
    { label: 'Transaction Type', value: meta.label },
    { label: 'Asset', value: tx.asset },
    tx.assetTo ? { label: 'Received Asset', value: tx.assetTo } : null,
    { label: 'Amount', value: `${meta.sign}${tx.amount} ${tx.asset}` },
    tx.amountTo ? { label: 'Received Amount', value: `+${tx.amountTo} ${tx.assetTo}` } : null,
    { label: 'Value', value: format(tx.valueUSD) },
    tx.username ? { label: 'Counterparty', value: `@${tx.username}` } : null,
    tx.address ? { label: 'Address', value: `${tx.address.slice(0, 12)}...${tx.address.slice(-8)}` } : null,
    { label: 'Network', value: 'Ethereum' },
    { label: 'Status', value: status.label },
    { label: 'Date', value: timestamp },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
            style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', maxHeight: '90%', overflowY: 'auto' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 rounded-full mx-auto mt-3" style={{ background: 'var(--muted)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 mt-3 mb-4">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Transaction Receipt</h3>
              <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <X size={18} style={{ color: 'var(--foreground)' }} />
              </button>
            </div>

            {/* Status badge */}
            <div className="flex justify-center mb-5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: status.bg }}>
                <StatusIcon size={18} style={{ color: status.color }} />
                <span style={{ color: status.color, fontSize: 14, fontWeight: 700 }}>{status.label}</span>
              </div>
            </div>

            {/* Amount hero */}
            <div className="text-center px-5 mb-6">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--muted)' }}>
                <Icon size={32} style={{ color: meta.color }} strokeWidth={2} />
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 4 }}>{meta.label}</p>
              <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                {meta.sign}{tx.amount} {tx.asset}
              </p>
              {tx.assetTo && (
                <p style={{ color: 'var(--positive)', fontSize: 15, fontWeight: 600, marginTop: 4 }}>
                  +{tx.amountTo} {tx.assetTo}
                </p>
              )}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 4 }}>
                {meta.sign}{format(tx.valueUSD)}
              </p>
            </div>

            {/* Details card */}
            <div className="mx-5 rounded-[20px] p-4 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-2.5"
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Transaction hash */}
            <div className="mx-5 rounded-[16px] p-4 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Transaction Hash</p>
              <div className="flex items-center gap-2">
                <p style={{ color: 'var(--foreground)', fontSize: 11, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                  {hash.slice(0, 42)}...
                </p>
                <button onClick={handleCopy} aria-label="Copy hash" className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--card)' }}>
                  {copied ? <Check size={14} style={{ color: 'var(--positive)' }} /> : <Copy size={14} style={{ color: 'var(--muted-foreground)' }} />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <Share2 size={16} style={{ color: 'var(--foreground)' }} />
                <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>Share</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <Download size={16} style={{ color: 'var(--foreground)' }} />
                <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>Download</span>
              </button>
            </div>

            <div className="px-5 pb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-3.5 rounded-[16px] text-white"
                style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
