import { motion } from 'motion/react';
import type { Asset } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';

interface AssetsListProps {
  assets: Asset[];
  loading?: boolean;
  emptyMessage?: string;
}

/** Asset rows for the Wallet "Assets" tab. Parent supplies live or filtered list. */
export function AssetsList({ assets, loading, emptyMessage }: AssetsListProps) {
  const { format } = useCurrency();

  if (loading) {
    return (
      <p className="px-5 py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
        Loading assets…
      </p>
    );
  }

  if (!assets.length) {
    return (
      <p className="px-5 py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
        {emptyMessage || 'No assets yet — deposit to get started'}
      </p>
    );
  }

  return (
    <div className="px-5">
      <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
        {assets.map((asset, i) => (
          <motion.div
            key={asset.id}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: i < assets.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <AssetIcon symbol={asset.symbol} size={40} />
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{format(asset.valueUSD)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
