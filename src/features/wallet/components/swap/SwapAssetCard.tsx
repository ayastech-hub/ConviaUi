import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { formatAmount } from './utils';

const PERCENT_PRESETS = [
  { label: '25%', v: 0.25 },
  { label: '50%', v: 0.5 },
  { label: 'Max', v: 1 },
];

interface SwapFromCardProps {
  variant: 'from';
  asset: Asset;
  amount: string;
  onAmountChange: (v: string) => void;
  onOpenPicker: () => void;
  usdValue: number;
  format: (n: number) => string;
  onSetPercentage: (pct: number) => void;
}

interface SwapToCardProps {
  variant: 'to';
  asset: Asset;
  amount: number;
  onOpenPicker: () => void;
  usdValue: number;
  format: (n: number) => string;
}

type SwapAssetCardProps = SwapFromCardProps | SwapToCardProps;

/** The "You pay" / "You receive" card. Renders an editable amount input for `from`, read-only for `to`. */
export function SwapAssetCard(props: SwapAssetCardProps) {
  const { asset, onOpenPicker, usdValue, format } = props;

  return (
    <div className="rounded-[20px] p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex justify-between items-center mb-3">
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
          {props.variant === 'from' ? 'You pay' : 'You receive'}
        </span>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
          Balance {formatAmount(asset.balance, asset.symbol)} {asset.symbol}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenPicker} className="flex items-center gap-2 px-3 py-2.5 rounded-[14px] flex-shrink-0" style={{ background: 'var(--muted)' }}>
          <AssetIcon symbol={asset.symbol} size={24} />
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>

        {props.variant === 'from' ? (
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={props.amount}
            onChange={(e) => props.onAmountChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-right"
            style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 700, minWidth: 0 }}
          />
        ) : (
          <p className="flex-1 text-right truncate" style={{ color: props.amount > 0 ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 26, fontWeight: 700 }}>
            {props.amount > 0 ? formatAmount(props.amount, asset.symbol) : '0.00'}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        {props.variant === 'from' ? (
          <div className="flex gap-1.5">
            {PERCENT_PRESETS.map((p) => (
              <motion.button key={p.label} whileTap={{ scale: 0.93 }} onClick={() => props.onSetPercentage(p.v)} className="px-2.5 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>
                {p.label}
              </motion.button>
            ))}
          </div>
        ) : <div />}
        {usdValue > 0 && <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>≈ {format(usdValue)}</p>}
      </div>
    </div>
  );
}
