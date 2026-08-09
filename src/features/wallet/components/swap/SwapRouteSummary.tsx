import { Fragment } from 'react';
import { motion } from 'motion/react';
import { Route, ArrowRight, Info, Zap } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { formatAmount } from './utils';

interface SwapRouteSummaryProps {
  route: string[];
  minReceived: number;
  toAsset: Asset;
  fromAsset: Asset;
  networkFeeUSD: number;
  format: (n: number) => string;
}

/** Route, minimum received, and network fee panel shown below the slippage selector. */
export function SwapRouteSummary({ route, minReceived, toAsset, fromAsset, networkFeeUSD, format }: SwapRouteSummaryProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[16px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
      <div className="flex justify-between items-center py-1.5">
        <div className="flex items-center gap-1.5">
          <Route size={13} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Route</span>
        </div>
        <div className="flex items-center gap-1">
          {route.map((sym, i) => (
            <Fragment key={`${sym}-${i}`}>
              {i > 0 && <ArrowRight size={11} style={{ color: 'var(--muted-foreground)' }} />}
              <span style={{ color: i === 0 || i === route.length - 1 ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 12, fontWeight: i === 0 || i === route.length - 1 ? 700 : 500 }}>{sym}</span>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <Info size={13} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Minimum received</span>
        </div>
        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{formatAmount(minReceived, toAsset.symbol)} {toAsset.symbol}</span>
      </div>

      <div className="flex justify-between items-center py-1.5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <Zap size={13} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
        </div>
        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{format(networkFeeUSD)} · {fromAsset.chains[0]}</span>
      </div>
    </motion.div>
  );
}
