import { motion } from 'motion/react';
import { Check, ArrowDown } from 'lucide-react';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { formatAmount, formatRate } from './utils';

export type SwapSettlement = {
  fromSymbol: string;
  toSymbol: string;
  amountIn: number;
  amountOut: number;
  rate: number;
  fee: number;
  feeBps: number;
  feeAsset: string;
};

interface SwapSuccessViewProps {
  settlement: SwapSettlement;
  onSwapAgain: () => void;
  onDone: () => void;
}

/** Success state — clean ticket, no fee/receipt noise. */
export function SwapSuccessView({ settlement, onSwapAgain, onDone }: SwapSuccessViewProps) {
  const { fromSymbol, toSymbol, amountIn, amountOut, rate } = settlement;
  const rateLabel = rate > 0 ? `1 ${fromSymbol} = ${formatRate(rate)} ${toSymbol}` : null;

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{ background: 'var(--background)' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="w-16 h-16 rounded-full mb-5 flex items-center justify-center"
          style={{
            background: 'color-mix(in oklab, var(--positive) 16%, var(--card))',
            border: '1px solid color-mix(in oklab, var(--positive) 35%, var(--border))',
          }}
        >
          <Check size={28} strokeWidth={2.5} style={{ color: 'var(--positive)' }} />
        </motion.div>

        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Swap complete
        </p>
        <p
          className="tabular-nums mt-2"
          style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}
        >
          +{formatAmount(amountOut, toSymbol)} {toSymbol}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>
          In your wallet now
        </p>

        <div
          className="w-full max-w-sm mt-7 rounded-[22px] overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <AssetIcon symbol={fromSymbol} size={32} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>
                You sent
              </span>
            </div>
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
              {formatAmount(amountIn, fromSymbol)} {fromSymbol}
            </span>
          </div>
          <div className="flex justify-center" style={{ color: 'var(--muted-foreground)' }}>
            <ArrowDown size={14} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <AssetIcon symbol={toSymbol} size={32} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>
                You got
              </span>
            </div>
            <span className="tabular-nums" style={{ color: 'var(--positive)', fontWeight: 800, fontSize: 15 }}>
              {formatAmount(amountOut, toSymbol)} {toSymbol}
            </span>
          </div>
          {rateLabel && (
            <div
              className="px-4 py-3 flex justify-between items-center"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Rate</span>
              <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
                {rateLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 flex flex-col gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onDone}
          className="w-full h-12 rounded-full font-semibold text-[15px]"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground, #fff)' }}
        >
          Done
        </button>
        <button
          type="button"
          onClick={onSwapAgain}
          className="w-full h-11 rounded-full font-semibold text-[14px]"
          style={{
            background: 'transparent',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          }}
        >
          Swap again
        </button>
      </div>
    </div>
  );
}
