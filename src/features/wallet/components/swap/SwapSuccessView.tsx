import { motion } from 'motion/react';
import { Check, ArrowRight, FileText, RefreshCw } from 'lucide-react';
import type { Transaction } from '../../../../shared/data/mockData';
import { TransactionReceipt } from '../../../../shared/components/TransactionReceipt';
import { formatAmount, formatRate } from './utils';

export type SwapSettlement = {
  fromSymbol: string;
  toSymbol: string;
  amountIn: number;
  amountOut: number;
  /** Units of toAsset per 1 fromAsset (backend rate) */
  rate: number;
  fee: number;
  feeBps: number;
  feeAsset: string;
};

interface SwapSuccessViewProps {
  settlement: SwapSettlement;
  receiptTx: Transaction | null;
  showReceipt: boolean;
  onShowReceipt: () => void;
  onCloseReceipt: () => void;
  onSwapAgain: () => void;
  onDone: () => void;
}

/** Confirmation after swap — numbers only from API settlement, not local price math. */
export function SwapSuccessView({
  settlement,
  receiptTx,
  showReceipt,
  onShowReceipt,
  onCloseReceipt,
  onSwapAgain,
  onDone,
}: SwapSuccessViewProps) {
  const { fromSymbol, toSymbol, amountIn, amountOut, rate, fee, feeBps, feeAsset } = settlement;
  const rateLabel =
    rate > 0
      ? `1 ${fromSymbol} = ${formatRate(rate)} ${toSymbol}`
      : '—';

  return (
    <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full text-center"
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'var(--muted)' }}
        >
          <Check size={44} style={{ color: 'var(--positive)' }} />
        </div>

        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
          Swap Complete
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 24 }}>
          Ledger updated — balances refresh in the background
        </p>

        <div
          className="rounded-[20px] p-4 mb-5 text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You paid</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
              {formatAmount(amountIn, fromSymbol)} {fromSymbol}
            </span>
          </div>
          <div className="flex justify-center py-2">
            <ArrowRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You received</span>
            <span style={{ color: 'var(--positive)', fontWeight: 700, fontSize: 14 }}>
              {formatAmount(amountOut, toSymbol)} {toSymbol}
            </span>
          </div>
          <div className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Rate</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{rateLabel}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              Platform fee{feeBps > 0 ? ` (${(feeBps / 100).toFixed(2)}%)` : ''}
            </span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
              {fee > 0 ? `${formatAmount(fee, feeAsset)} ${feeAsset}` : '0'}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onShowReceipt}
            className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2"
            style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}
          >
            <FileText size={16} /> View Receipt
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onSwapAgain}
            className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2"
            style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}
          >
            <RefreshCw size={16} /> Swap Again
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onDone}
          className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2 mt-3"
          style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
        >
          <Check size={16} /> Done
        </motion.button>
      </motion.div>
      <TransactionReceipt tx={receiptTx} open={showReceipt} onClose={onCloseReceipt} />
    </div>
  );
}
