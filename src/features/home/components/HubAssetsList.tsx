import { motion } from 'motion/react';
import type { Asset } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';

interface Props {
  assets: Asset[];
  loading?: boolean;
  hideSmall: boolean;
  onToggleHide: () => void;
  onSeeAll?: () => void; // optional; portfolio removed
}

/** Asset rows: name, price + 24h %, qty, USD — Crypto-Bot list structure. */
export function HubAssetsList({ assets, loading, hideSmall, onToggleHide, onSeeAll }: Props) {
  const { format } = useCurrency();
  const list = hideSmall
    ? assets.filter((a) => Number(a.valueUSD) >= 1 || Number(a.balance) > 0)
    : assets;

  return (
    <div className="px-5 pb-28">
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>
          My Assets
        </p>
        <button
          type="button"
          onClick={onToggleHide}
          style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}
        >
          {hideSmall ? 'Show all' : 'Hide small balances'}
        </button>
      </div>

      {loading && list.length === 0 ? (
        <p className="py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          Loading assets…
        </p>
      ) : list.length === 0 ? (
        <p className="py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          No assets yet — deposit to get started
        </p>
      ) : (
        <div>
          {list.map((asset, i) => {
            const up = asset.change24h >= 0;
            return (
              <motion.div
                key={asset.id || asset.symbol}
                whileTap={{ scale: 0.99 }}
                className="flex items-center justify-between py-3.5"
                style={{
                  borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AssetIcon symbol={asset.symbol} size={40} />
                  <div className="min-w-0">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
                      {asset.name}
                    </p>
                    <p style={{ fontSize: 12, marginTop: 2 }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>
                        ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </span>{' '}
                      <span style={{ color: up ? 'var(--positive, #22c55e)' : 'var(--destructive)', fontWeight: 500 }}>
                        {up ? '+' : ''}
                        {asset.change24h.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                    {Number(asset.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
                    {asset.symbol}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                    {format(Number(asset.valueUSD) || 0)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
