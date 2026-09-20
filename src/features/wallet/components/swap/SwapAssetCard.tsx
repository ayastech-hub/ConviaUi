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

/** Token + amount card — dense, enterprise layout matching bills/utilities. */
export function SwapAssetCard(props: Props) {
  const { asset, onOpenPicker } = props;

  return (
    <div
      className="rounded-[22px] px-4 pt-3.5 pb-4"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 650,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {props.variant === 'from' ? 'You send' : 'You receive'}
        </span>
        {props.variant === 'from' && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <Wallet size={13} style={{ color: 'var(--muted-foreground)' }} />
              <span className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 12.5 }}>
                {props.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </span>
            </div>
            <button
              type="button"
              onClick={props.onMax}
              className="px-2 py-0.5 rounded-full"
              style={{
                color: 'var(--primary)',
                fontSize: 11,
                fontWeight: 750,
                background: 'color-mix(in oklab, var(--primary) 12%, transparent)',
              }}
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
          className="flex items-center gap-2.5 shrink-0 rounded-full pr-2.5 pl-1 py-1"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={asset.symbol} size={28} />
          <span style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 15 }}>{asset.symbol}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>

        {props.variant === 'from' ? (
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={props.amount}
            onChange={(e) => props.onAmountChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-right min-w-0 tabular-nums"
            style={{
              color: props.amount ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.6,
            }}
          />
        ) : (
          <p
            className="flex-1 text-right truncate tabular-nums"
            style={{
              color: props.amount > 0 ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.6,
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
