import { motion } from 'motion/react';
import { RefreshCw, Info } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { formatRate, impactLevelFor, IMPACT_COLORS, IMPACT_LABELS } from './utils';

interface SwapRateRowProps {
  fromAsset: Asset;
  toAsset: Asset;
  rate: number;
  ratePulse: number;
  rateRefreshing: boolean;
  onRefresh: () => void;
}

/** "1 ETH = 2,450 USDT" row with a refresh button, shown once an amount is entered. */
export function SwapRateRow({ fromAsset, toAsset, rate, ratePulse, rateRefreshing, onRefresh }: SwapRateRowProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between px-1 mb-3">
      <div className="flex items-center gap-2">
        <motion.span key={ratePulse} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
          1 {fromAsset.symbol} = {formatRate(rate)} {toAsset.symbol}
        </motion.span>
        <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={onRefresh} aria-label="Refresh rate" className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <RefreshCw size={11} style={{ color: 'var(--muted-foreground)' }} className={rateRefreshing ? 'animate-spin' : ''} />
        </motion.button>
      </div>
      <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{rateRefreshing ? 'Updating…' : 'Updated just now'}</span>
    </motion.div>
  );
}

/** Price-impact badge row, shown once an amount is entered. */
export function PriceImpactRow({ priceImpactPct }: { priceImpactPct: number }) {
  const level = impactLevelFor(priceImpactPct);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between px-3 py-2.5 rounded-[12px] mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Price impact</span>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, fontWeight: 700, color: IMPACT_COLORS[level] }}>{priceImpactPct.toFixed(2)}%</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: 'var(--muted)', color: IMPACT_COLORS[level] }}>
          {IMPACT_LABELS[level]}{level === 'low' ? ' impact' : ''}
        </span>
      </div>
    </motion.div>
  );
}
