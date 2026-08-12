import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownLeft,
  RefreshCw, Plus, Minus, TrendingUp, TrendingDown, Copy, Check,
  Share2, Download, ExternalLink, Loader,
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

/** Block explorer URL builders, keyed by network label as shown in the receipt. */
const EXPLORER: Record<string, (hash: string) => string> = {
  Ethereum: (h) => `https://etherscan.io/tx/${h}`,
  Polygon: (h) => `https://polygonscan.com/tx/${h}`,
  BNB: (h) => `https://bscscan.com/tx/${h}`,
  Solana: (h) => `https://solscan.io/tx/${h}`,
  Tron: (h) => `https://tronscan.org/#/transaction/${h}`,
  Bitcoin: (h) => `https://blockchair.com/bitcoin/transaction/${h}`,
  Arbitrum: (h) => `https://arbiscan.io/tx/${h}`,
  Base: (h) => `https://basescan.org/tx/${h}`,
};

/** tx.time may be an ISO string or a display label — show a real absolute
 * timestamp when we can parse one, otherwise fall back to what's given
 * rather than silently substituting "now". */
function formatTimestamp(time: string | undefined): string {
  if (!time) return 'Unknown';
  const d = new Date(time);
  if (Number.isNaN(d.getTime())) return time;
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Draws a shareable receipt image. Kept dependency-free (native Canvas 2D)
 * rather than pulling in html2canvas for one screen. */
function renderReceiptCanvas(opts: {
  typeLabel: string; amountLine: string; secondaryLine?: string; valueLine: string;
  statusLabel: string; rows: { label: string; value: string }[]; hash?: string;
}): HTMLCanvasElement {
  const scale = 2;
  const width = 480;
  const rowH = 34;
  const height = 300 + opts.rows.length * rowH + (opts.hash ? 70 : 0);
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#0B0D10';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#8A8F98';
  ctx.font = '600 13px -apple-system, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CONVIA · TRANSACTION RECEIPT', width / 2, 40);

  ctx.fillStyle = '#5CE0A0';
  ctx.font = '700 13px -apple-system, Inter, sans-serif';
  ctx.fillText(opts.statusLabel.toUpperCase(), width / 2, 66);

  ctx.fillStyle = '#F5F6F7';
  ctx.font = '800 30px -apple-system, Inter, sans-serif';
  ctx.fillText(opts.amountLine, width / 2, 112);

  if (opts.secondaryLine) {
    ctx.fillStyle = '#5CE0A0';
    ctx.font = '600 15px -apple-system, Inter, sans-serif';
    ctx.fillText(opts.secondaryLine, width / 2, 136);
  }

  ctx.fillStyle = '#8A8F98';
  ctx.font = '500 14px -apple-system, Inter, sans-serif';
  ctx.fillText(opts.valueLine, width / 2, opts.secondaryLine ? 160 : 140);

  let y = (opts.secondaryLine ? 160 : 140) + 40;
  ctx.textAlign = 'left';
  ctx.strokeStyle = '#22262C';
  ctx.lineWidth = 1;
  for (const row of opts.rows) {
    ctx.fillStyle = '#8A8F98';
    ctx.font = '500 13px -apple-system, Inter, sans-serif';
    ctx.fillText(row.label, 24, y);
    ctx.fillStyle = '#F5F6F7';
    ctx.font = '600 13px -apple-system, Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(row.value, width - 24, y);
    ctx.textAlign = 'left';
    ctx.beginPath();
    ctx.moveTo(24, y + 12);
    ctx.lineTo(width - 24, y + 12);
    ctx.stroke();
    y += rowH;
  }

  if (opts.hash) {
    ctx.fillStyle = '#8A8F98';
    ctx.font = '500 12px -apple-system, Inter, sans-serif';
    ctx.fillText('TRANSACTION HASH', 24, y + 20);
    ctx.fillStyle = '#F5F6F7';
    ctx.font = '400 11px monospace';
    ctx.fillText(opts.hash.slice(0, 48) + '...', 24, y + 40);
  }

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

export function TransactionReceipt({ tx, open, onClose }: TransactionReceiptProps) {
  const { format } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'busy' | 'copied'>('idle');
  const [downloadState, setDownloadState] = useState<'idle' | 'busy'>('idle');

  if (!tx) return null;

  const meta = txMeta[tx.type] ?? txMeta.receive;
  const Icon = meta.icon;
  const hasRealHash = Boolean(tx.hash); // never fabricate on-chain data the app can't verify
  const timestamp = formatTimestamp(tx.time);
  const network = (tx as Transaction & { network?: string }).network || 'Ethereum';
  const explorerUrl = hasRealHash && EXPLORER[network] ? EXPLORER[network](tx.hash as string) : null;

  const handleCopyHash = () => {
    if (!tx.hash) return;
    navigator.clipboard?.writeText(tx.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAddress = () => {
    if (!tx.address) return;
    navigator.clipboard?.writeText(tx.address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
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
    { label: 'Network', value: network },
    { label: 'Status', value: status.label },
    { label: 'Date', value: timestamp },
  ].filter(Boolean) as { label: string; value: string }[];

  const buildReceiptCanvas = () =>
    renderReceiptCanvas({
      typeLabel: meta.label,
      amountLine: `${meta.sign}${tx.amount} ${tx.asset}`,
      secondaryLine: tx.assetTo ? `+${tx.amountTo} ${tx.assetTo}` : undefined,
      valueLine: `${meta.sign}${format(tx.valueUSD)}`,
      statusLabel: status.label,
      rows,
      hash: hasRealHash ? tx.hash : undefined,
    });

  const handleDownload = async () => {
    setDownloadState('busy');
    try {
      const canvas = buildReceiptCanvas();
      const blob = await canvasToBlob(canvas);
      if (!blob) throw new Error('render failed');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `convia-receipt-${tx.id ?? Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* canvas/export unsupported in this environment — fail silently, button stays usable */
    } finally {
      setDownloadState('idle');
    }
  };

  const summaryText = `${meta.label} ${meta.sign}${tx.amount} ${tx.asset} (${format(tx.valueUSD)}) · ${status.label} · ${timestamp}${explorerUrl ? `\n${explorerUrl}` : ''}`;

  const handleShare = async () => {
    setShareState('busy');
    try {
      const canvas = buildReceiptCanvas();
      const blob = await canvasToBlob(canvas);
      const file = blob ? new File([blob], 'convia-receipt.png', { type: 'image/png' }) : null;

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Transaction Receipt', text: summaryText });
      } else if (navigator.share) {
        await navigator.share({ title: 'Transaction Receipt', text: summaryText });
      } else {
        await navigator.clipboard.writeText(summaryText);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 1800);
        return;
      }
    } catch (e) {
      // AbortError means the user cancelled the native share sheet — not a failure
      if ((e as Error)?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(summaryText);
          setShareState('copied');
          setTimeout(() => setShareState('idle'), 1800);
          return;
        } catch {
          /* clipboard also unavailable — nothing more we can do */
        }
      }
    }
    setShareState('idle');
  };

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
            role="dialog"
            aria-modal="true"
            aria-label="Transaction receipt"
          >
            {/* Handle */}
            <div className="w-12 h-1 rounded-full mx-auto mt-3" style={{ background: 'var(--muted)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 mt-3 mb-4">
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Transaction Receipt</h3>
              <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2" style={{ background: 'var(--muted)' }}>
                <X size={18} style={{ color: 'var(--foreground)' }} />
              </button>
            </div>

            {/* Status badge */}
            <div className="flex justify-center mb-5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: status.bg }}>
                {tx.status === 'pending' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}>
                    <StatusIcon size={18} style={{ color: status.color }} />
                  </motion.div>
                ) : (
                  <StatusIcon size={18} style={{ color: status.color }} />
                )}
                <span style={{ color: status.color, fontSize: 14, fontWeight: 700 }}>{status.label}</span>
              </div>
            </div>

            {/* Amount hero */}
            <div className="text-center px-5 mb-6">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--muted)' }}>
                <Icon size={32} style={{ color: meta.color }} strokeWidth={2} />
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 4 }}>{meta.label}</p>
              <p style={{ color: meta.color, fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
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
              {rows.map((row, i) => {
                const copyable = row.label === 'Address' && tx.address;
                return (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-2.5"
                    style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                    {copyable ? (
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center gap-1.5 focus-visible:outline-none"
                        aria-label="Copy address"
                      >
                        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.value}
                        </span>
                        {addressCopied ? (
                          <Check size={12} style={{ color: 'var(--positive)', flexShrink: 0 }} />
                        ) : (
                          <Copy size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                        )}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Transaction hash — only rendered when a real hash exists */}
            {hasRealHash && (
              <div className="mx-5 rounded-[16px] p-4 mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Transaction Hash</p>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                      style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}
                    >
                      View on Explorer <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p style={{ color: 'var(--foreground)', fontSize: 11, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                    {(tx.hash as string).slice(0, 42)}...
                  </p>
                  <button onClick={handleCopyHash} aria-label="Copy hash" className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2" style={{ background: 'var(--card)' }}>
                    {copied ? <Check size={14} style={{ color: 'var(--positive)' }} /> : <Copy size={14} style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 px-5 mb-6">
              <button
                onClick={() => void handleShare()}
                disabled={shareState === 'busy'}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] focus-visible:outline-none focus-visible:ring-2"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', opacity: shareState === 'busy' ? 0.7 : 1 }}
              >
                {shareState === 'busy' ? (
                  <Loader size={16} className="animate-spin" style={{ color: 'var(--foreground)' }} />
                ) : shareState === 'copied' ? (
                  <Check size={16} style={{ color: 'var(--positive)' }} />
                ) : (
                  <Share2 size={16} style={{ color: 'var(--foreground)' }} />
                )}
                <span style={{ color: shareState === 'copied' ? 'var(--positive)' : 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>
                  {shareState === 'copied' ? 'Copied' : 'Share'}
                </span>
              </button>
              <button
                onClick={() => void handleDownload()}
                disabled={downloadState === 'busy'}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] focus-visible:outline-none focus-visible:ring-2"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)', opacity: downloadState === 'busy' ? 0.7 : 1 }}
              >
                {downloadState === 'busy' ? (
                  <Loader size={16} className="animate-spin" style={{ color: 'var(--foreground)' }} />
                ) : (
                  <Download size={16} style={{ color: 'var(--foreground)' }} />
                )}
                <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>Download</span>
              </button>
            </div>

            <div className="px-5 pb-8">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-3.5 rounded-[16px] text-white focus-visible:outline-none focus-visible:ring-2"
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
