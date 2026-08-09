import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { Asset } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AssetIcon } from '../../../shared/components/AssetIcon';

interface AssetsListProps {
  assets: Asset[];
}

/** The "Assets" tab content on Wallet: one row per asset with a sparkline and current value. */
export function AssetsList({ assets }: AssetsListProps) {
  const { format } = useCurrency();

  return (
    <div className="px-5">
      <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
        {assets.map((asset, i) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: i < assets.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <AssetIcon symbol={asset.symbol} size={40} />
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.chains[0]}</p>
              </div>
            </div>

            <div style={{ width: 60, height: 28 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={asset.sparkline.map((v, idx) => ({ v, idx }))}>
                  <defs>
                    <linearGradient id={`spark-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={asset.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={asset.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={asset.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)'}
                    strokeWidth={1.5}
                    fill={`url(#spark-${asset.id})`}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-right">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{format(asset.valueUSD)}</p>
              <p style={{ color: asset.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)', fontSize: 12, fontWeight: 600 }}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
