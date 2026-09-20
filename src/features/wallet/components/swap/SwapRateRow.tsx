import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { formatRate } from './utils';

interface SwapRateRowProps {
  fromAsset: Asset;
  toAsset: Asset;
  rate: number;
  ratePulse: number;
  rateRefreshing: boolean;
  onRefresh: () => void;
}

/** Live rate chip — compact enterprise strip under the pair. */
export function SwapRateRow({
  fromAsset,
  toAsset,
  rate,
  ratePulse,
  rateRefreshing,
  onRefresh,
}: SwapRateRowProps) {
  const label =
    rate > 0
      ? `1 ${fromAsset.symbol} ≈ ${formatRate(rate)} ${toAsset.symbol}`
      : 'Fetching rate…';

  return (
    <motion.div
      key={ratePulse}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl mb-3"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="min-w-0">
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 10,
            fontWeight: 650,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          Rate
        </p>
        <p
          className="tabular-nums truncate"
          style={{ color: 'var(--foreground)', fontSize: 13.5, fontWeight: 650 }}
        >
          {label}
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh rate"
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          color: 'var(--muted-foreground)',
        }}
      >
        <RefreshCw
          size={14}
          className={rateRefreshing ? 'animate-spin' : undefined}
          style={{ color: rateRefreshing ? 'var(--primary)' : undefined }}
        />
      </button>
    </motion.div>
  );
}

/** Optional secondary row (price impact) — kept minimal. */
export function PriceImpactRow({ impactPct }: { impactPct: number }) {
  if (!Number.isFinite(impactPct) || impactPct <= 0.05) return null;
  const high = impactPct >= 3;
  return (
    <div className="flex justify-between items-center px-1 mb-2">
      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Price impact</span>
      <span
        className="tabular-nums"
        style={{
          color: high ? 'var(--warning, #f59e0b)' : 'var(--muted-foreground)',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {impactPct.toFixed(2)}%
      </span>
    </div>
  );
}
