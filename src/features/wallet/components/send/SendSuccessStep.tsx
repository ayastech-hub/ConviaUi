import { motion } from 'motion/react';
import { CheckCircle2, Copy, FileText, RefreshCw } from 'lucide-react';
import type { Asset, ChatContact } from '../../../../shared/data/mockData';

interface SendSuccessStepProps {
  format: (n: number) => string;
  amount: string;
  selectedContact: ChatContact | null;
  recipient: string;
  cryptoAmount: number;
  selectedAsset: Asset;
  txHash: string;
  shortenHash: (h: string) => string;
  copied: boolean;
  onCopyHash: () => void;
  onShowReceipt: () => void;
  onSendAnother: () => void;
  onDone: () => void;
}

/** Send step 5: success confirmation with tx hash, receipt link, and next actions. */
export function SendSuccessStep({
  format, amount, selectedContact, recipient, cryptoAmount, selectedAsset,
  txHash, shortenHash, copied, onCopyHash, onShowReceipt, onSendAnother, onDone,
}: SendSuccessStepProps) {
  return (
    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-10">
      <motion.div
        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--muted)' }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 240 }}>
          <CheckCircle2 size={56} style={{ color: 'var(--positive)' }} />
        </motion.div>
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
        Sent Successfully
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 4 }}>
        {format(Number(amount))} sent to {selectedContact?.name ?? recipient}
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 24 }}>
        {cryptoAmount.toFixed(6)} {selectedAsset.symbol} · Confirmed on {selectedAsset.chains[0]}
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3 w-full" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>TX HASH</span>
        <span className="flex-1 text-left" style={{ color: 'var(--foreground)', fontSize: 11, fontFamily: 'monospace' }}>{shortenHash(txHash)}</span>
        <button onClick={onCopyHash} className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'var(--muted)' }}>
          {copied ? <CheckCircle2 size={13} style={{ color: 'var(--positive)' }} /> : <Copy size={13} style={{ color: 'var(--foreground)' }} />}
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        whileTap={{ scale: 0.97 }} onClick={onShowReceipt}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <FileText size={16} style={{ color: 'var(--foreground)' }} />
        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>View Receipt</span>
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex gap-3 w-full">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onSendAnother} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]" style={{ background: 'var(--muted)' }}>
          <RefreshCw size={16} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Send Another</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onDone} className="flex-1 py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
          Done
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
