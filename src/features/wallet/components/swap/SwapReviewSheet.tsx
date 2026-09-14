import { motion } from 'motion/react';
import { X, ArrowDown } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { formatAmount, formatRate } from './utils';

interface SwapReviewSheetProps {
  fromAsset: Asset;
  toAsset: Asset;
  fromNum: number;
  toAmount: number;
  fromUSD: number;
  toUSD: number;
  format: (n: number) => string;
  rate: number;
  priceImpactPct: number;
  effectiveSlippage: string;
  minReceived: number;
  networkFeeUSD: number;
  route: string[];
  confirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Compact review — confirm runs swap immediately. */
export function SwapReviewSheet({
  fromAsset,
  toAsset,
  fromNum,
  toAmount,
  format,
  rate,
  confirming,
  onClose,
  onConfirm,
}: SwapReviewSheetProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={confirming ? undefined : onClose}
        className="absolute inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[24px] px-5 pt-3 pb-6"
        style={{
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          maxHeight: '55vh',
        }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted)' }} />
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>Confirm swap</h3>
          <button
            type="button"
            disabled={confirming}
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <X size={16} style={{ color: 'var(--foreground)' }} />
          </button>
        </div>

        <div
          className="rounded-2xl px-4 py-3 mb-3"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AssetIcon symbol={fromAsset.symbol} size={28} />
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{fromAsset.symbol}</span>
            </div>
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
              {fromNum.toLocaleString(undefined, { maximumFractionDigits: 8 })}
            </span>
          </div>
          <div className="flex justify-center my-2">
            <ArrowDown size={16} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AssetIcon symbol={toAsset.symbol} size={28} />
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{toAsset.symbol}</span>
            </div>
            <span className="tabular-nums" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 18 }}>
              {toAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
            </span>
          </div>
        </div>

        <div className="flex justify-between mb-4 px-1">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Rate</span>
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
            1 {fromAsset.symbol} ≈ {formatRate(rate)} {toAsset.symbol}
          </span>
        </div>

        <button
          type="button"
          disabled={!!confirming}
          onClick={onConfirm}
          className="w-full py-3.5 rounded-full font-bold text-[15px]"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            opacity: confirming ? 0.85 : 1,
          }}
        >
          {confirming ? 'Swapping…' : 'Confirm'}
        </button>
      </motion.div>
    </>
  );
}
