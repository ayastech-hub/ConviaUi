import { motion } from 'motion/react';
import { ChevronDown, Wallet } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { decimalsFor } from './utils';

type FromProps = {
  variant: 'from';
  asset: Asset;
  amount: string;
  onAmountChange: (v: string) => void;
  onOpenPicker: () => void;
  onMax: () => void;
  balance: number;
};

type ToProps = {
  variant: 'to';
  asset: Asset;
  amount: number;
  onOpenPicker: () => void;
  quoteLoading?: boolean;
};

type Props = FromProps | ToProps;

/**
 * Crypto-Bot style row: label + MAX, then token chip + large amount.
 * Uses Convia tokens (no foreign blues).
 */
export function SwapAssetCard(props: Props) {
  const { asset, onOpenPicker } = props;

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-3 px-0.5">
        <span style={{ color: 'var(--muted-foreground)', fontSize: 14, fontWeight: 500 }}>
          {props.variant === 'from' ? 'You send' : 'You receive'}
        </span>
        {props.variant === 'from' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Wallet size={14} style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                {props.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </span>
            </div>
            <button
              type="button"
              onClick={props.onMax}
              style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}
            >
              MAX
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onOpenPicker}
          className="flex items-center gap-2.5 shrink-0"
        >
          <AssetIcon symbol={asset.symbol} size={36} />
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18 }}>
            {asset.symbol}
          </span>
          <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>

        {props.variant === 'from' ? (
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={props.amount}
            onChange={(e) => props.onAmountChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-right min-w-0"
            style={{
              color: props.amount ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: -0.5,
            }}
          />
        ) : (
          <p
            className="flex-1 text-right truncate"
            style={{
              color: props.amount > 0 ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: -0.5,
            }}
          >
            {props.quoteLoading
              ? '…'
              : props.amount > 0
                ? props.amount.toLocaleString(undefined, {
                    maximumFractionDigits: decimalsFor(asset.symbol, 8),
                  })
                : '0'}
          </p>
        )}
      </div>
    </div>
  );
}
