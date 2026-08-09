import { Fragment } from 'react';
import { motion } from 'motion/react';
import { X, ArrowDownUp, ArrowRight, Route, Check } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { formatAmount, formatRate, impactLevelFor, IMPACT_COLORS, IMPACT_LABELS } from './utils';

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
  onClose: () => void;
  onConfirm: () => void;
}

/** The bottom-sheet "Review Swap" modal, shown before confirming a swap. */
export function SwapReviewSheet({
  fromAsset, toAsset, fromNum, toAmount, fromUSD, toUSD, format, rate,
  priceImpactPct, effectiveSlippage, minReceived, networkFeeUSD, route, onClose, onConfirm,
}: SwapReviewSheetProps) {
  const impactLevel = impactLevelFor(priceImpactPct);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)' }} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden" style={{ background: 'var(--card)' }}
      >
        <div className="sticky top-0 px-5 pt-4 pb-3" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted)' }} />
          <div className="flex items-center justify-between">
            <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Review Swap</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <X size={18} style={{ color: 'var(--foreground)' }} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="py-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You pay</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>≈ {format(fromUSD)}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <AssetIcon symbol={fromAsset.symbol} size={32} />
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18 }}>{formatAmount(fromNum, fromAsset.symbol)} {fromAsset.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{fromAsset.name}</p>
              </div>
            </div>

            <div className="flex justify-center -my-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)', border: '3px solid var(--card)' }}>
                <ArrowDownUp size={15} style={{ color: 'var(--foreground)' }} />
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 mt-1">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You receive</span>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>≈ {format(toUSD)}</span>
            </div>
            <div className="flex items-center gap-3">
              <AssetIcon symbol={toAsset.symbol} size={32} />
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18 }}>{formatAmount(toAmount, toAsset.symbol)} {toAsset.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{toAsset.name}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[16px] p-4 mb-5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between py-1.5">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Exchange rate</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>1 {fromAsset.symbol} = {formatRate(rate)} {toAsset.symbol}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Price impact</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: IMPACT_COLORS[impactLevel] }}>{priceImpactPct.toFixed(2)}% · {IMPACT_LABELS[impactLevel]}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Slippage tolerance</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{effectiveSlippage}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Minimum received</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{formatAmount(minReceived, toAsset.symbol)} {toAsset.symbol}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
              <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{format(networkFeeUSD)} · {fromAsset.chains[0]}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <Route size={12} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Route</span>
              </div>
              <div className="flex items-center gap-1">
                {route.map((sym, i) => (
                  <Fragment key={`${sym}-r-${i}`}>
                    {i > 0 && <ArrowRight size={10} style={{ color: 'var(--muted-foreground)' }} />}
                    <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>{sym}</span>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
            <Check size={18} /> Confirm Swap
          </motion.button>
          <p className="text-center mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
            Output is estimated. You will receive at least {formatAmount(minReceived, toAsset.symbol)} {toAsset.symbol} or the transaction will revert.
          </p>
        </div>
      </motion.div>
    </>
  );
}
