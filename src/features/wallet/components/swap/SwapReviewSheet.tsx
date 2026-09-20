import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { formatRate } from './utils';

interface SwapReviewSheetProps {
  fromAsset: Asset;
  toAsset: Asset;
  fromNum: number;
  toAmount: number;
  rate: number;
  confirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function SwapReviewSheet({
  fromAsset,
  toAsset,
  fromNum,
  toAmount,
  rate,
  confirming,
  onConfirm,
  onClose,
}: SwapReviewSheetProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 48 }}
        animate={{ y: 0 }}
        exit={{ y: 48 }}
        className="fixed bottom-0 left-0 right-0 z-[61] mx-auto max-w-md rounded-t-[28px] px-5 pt-3 pb-8"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 650,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Confirm swap
        </p>

        <div
          className="rounded-[20px] px-4 py-3.5 mb-3"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <AssetIcon symbol={fromAsset.symbol} size={30} />
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{fromAsset.symbol}</span>
            </div>
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
              {fromNum.toLocaleString(undefined, { maximumFractionDigits: 8 })}
            </span>
          </div>
          <div className="flex justify-center my-2" style={{ color: 'var(--muted-foreground)' }}>
            <ArrowDown size={15} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <AssetIcon symbol={toAsset.symbol} size={30} />
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{toAsset.symbol}</span>
            </div>
            <span className="tabular-nums" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 17 }}>
              {toAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
            </span>
          </div>
        </div>

        {rate > 0 && (
          <div className="flex justify-between mb-5 px-0.5">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Rate</span>
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
              1 {fromAsset.symbol} ≈ {formatRate(rate)} {toAsset.symbol}
            </span>
          </div>
        )}

        <button
          type="button"
          disabled={!!confirming}
          onClick={onConfirm}
          className="w-full h-12 rounded-full font-bold text-[15px]"
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
