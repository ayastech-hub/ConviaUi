import { motion } from 'motion/react';
import { ArrowDown, X } from 'lucide-react';
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

/** Bottom sheet confirm — enterprise ticket layout. */
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
      <motion.div
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.58)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-[61] mx-auto max-w-md rounded-t-[28px] px-5 pt-3 pb-9"
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />

        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11,
                fontWeight: 650,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}
            >
              Confirm swap
            </p>
            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, marginTop: 2 }}>
              Review details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            aria-label="Close"
          >
            <X size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        {/* Pair visual */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <AssetIcon symbol={fromAsset.symbol} size={32} />
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            <ArrowDown size={14} />
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <AssetIcon symbol={toAsset.symbol} size={32} />
          </div>
        </div>

        <div
          className="rounded-[22px] overflow-hidden mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Row
            label="You send"
            value={`${fromNum.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${fromAsset.symbol}`}
            sub={fromAsset.name}
            symbol={fromAsset.symbol}
          />
          <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
          <Row
            label="You receive"
            value={`${toAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${toAsset.symbol}`}
            sub={toAsset.name}
            symbol={toAsset.symbol}
            emphasize
          />
          {rate > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />
              <div className="flex items-center justify-between px-4 py-3.5">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Rate</span>
                <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 650 }}>
                  1 {fromAsset.symbol} ≈ {formatRate(rate)} {toAsset.symbol}
                </span>
              </div>
            </>
          )}
        </div>

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
          {confirming ? 'Swapping…' : `Swap ${fromAsset.symbol} → ${toAsset.symbol}`}
        </button>
      </motion.div>
    </>
  );
}

function Row({
  label,
  value,
  sub,
  symbol,
  emphasize,
}: {
  label: string;
  value: string;
  sub?: string;
  symbol: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <AssetIcon symbol={symbol} size={36} />
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}>{label}</p>
        {sub && (
          <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 1 }}>
            {sub}
          </p>
        )}
      </div>
      <p
        className="tabular-nums text-right shrink-0"
        style={{
          color: emphasize ? 'var(--primary)' : 'var(--foreground)',
          fontWeight: 800,
          fontSize: 15,
        }}
      >
        {value}
      </p>
    </div>
  );
}
