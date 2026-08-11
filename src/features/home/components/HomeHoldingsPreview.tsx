import { motion } from 'motion/react';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';

interface Props {
  onSeeAll: () => void;
}

/** Home token list with balances (0 shown, not —). Same catalog as Wallet. */
export function HomeHoldingsPreview({ onSeeAll }: Props) {
  const { format } = useCurrency();
  const { assets, loading } = useWalletAssets();
  const rows = assets.slice(0, 8);

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>Your assets</h3>
        <button type="button" onClick={onSeeAll} style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          See all
        </button>
      </div>
      {loading && !rows.length ? (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading assets…</p>
      ) : (
        <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
          {rows.map((asset, i) => (
            <motion.div
              key={asset.symbol}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <AssetIcon symbol={asset.symbol} size={36} />
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                  {(Number(asset.balance) || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                  {format(Number(asset.valueUSD) || 0)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
