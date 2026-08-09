import { motion } from 'motion/react';
import { Check, ArrowRight, FileText, RefreshCw } from 'lucide-react';
import type { Asset, Transaction } from '../../../../shared/data/mockData';
import { TransactionReceipt } from '../../../../shared/components/TransactionReceipt';
import { formatAmount, formatRate } from './utils';

interface SwapSuccessViewProps {
  fromAsset: Asset;
  toAsset: Asset;
  fromNum: number;
  toAmount: number;
  rate: number;
  networkFeeUSD: number;
  format: (n: number) => string;
  receiptTx: Transaction | null;
  showReceipt: boolean;
  onShowReceipt: () => void;
  onCloseReceipt: () => void;
  onSwapAgain: () => void;
  onDone: () => void;
}

/** Confirmation view shown after a swap completes. */
export function SwapSuccessView({
  fromAsset, toAsset, fromNum, toAmount, rate, networkFeeUSD, format,
  receiptTx, showReceipt, onShowReceipt, onCloseReceipt, onSwapAgain, onDone,
}: SwapSuccessViewProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 18, stiffness: 220 }} className="w-full text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', damping: 12, stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center relative" style={{ background: 'var(--muted)' }}
        >
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', damping: 14, stiffness: 180 }}>
            <Check size={52} style={{ color: 'var(--positive)' }} />
          </motion.div>
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
            className="absolute inset-0 rounded-full" style={{ border: '2px solid var(--positive)' }}
          />
        </motion.div>

        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Swap Complete</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 24 }}>Your swap has settled instantly</p>

        <div className="rounded-[20px] p-4 mb-8 text-left" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between py-2.5">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You paid</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{formatAmount(fromNum, fromAsset.symbol)} {fromAsset.symbol}</span>
          </div>
          <div className="flex items-center justify-center my-1">
            <ArrowRight size={14} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You received</span>
            <span style={{ color: 'var(--positive)', fontWeight: 700, fontSize: 15 }}>{formatAmount(toAmount, toAsset.symbol)} {toAsset.symbol}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Rate</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>1 {fromAsset.symbol} = {formatRate(rate)} {toAsset.symbol}</span>
          </div>
          <div className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{format(networkFeeUSD)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onShowReceipt} className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
            <FileText size={16} /> View Receipt
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onSwapAgain} className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
            <RefreshCw size={16} /> Swap Again
          </motion.button>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onDone} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2 mt-3" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
          <Check size={16} /> Done
        </motion.button>
      </motion.div>
      <TransactionReceipt tx={receiptTx} open={showReceipt} onClose={onCloseReceipt} />
    </div>
  );
}
