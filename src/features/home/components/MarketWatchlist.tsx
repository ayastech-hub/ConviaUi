import { motion } from 'motion/react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { marketData, type Screen } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AssetIcon } from '../../../shared/components/AssetIcon';

interface MarketWatchlistProps {
  onSeeAll: () => void;
  onSelectAsset: (symbol: string) => void;
}

/** "Markets" preview list (top 4 assets) on Home, linking through to Trade / token detail. */
export function MarketWatchlist({ onSeeAll, onSelectAsset }: MarketWatchlistProps) {
  const { format } = useCurrency();

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>Markets</h3>
        <button onClick={onSeeAll} className="flex items-center gap-1" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>
          See all <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {marketData.slice(0, 4).map((asset, i) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectAsset(asset.symbol)}
            className="flex items-center justify-between p-3 rounded-[16px] glass-card cursor-pointer"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <AssetIcon symbol={asset.symbol} />
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Vol ${asset.vol}</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{format(asset.price)}</p>
              <div className="flex items-center gap-1 justify-end">
                {asset.change >= 0
                  ? <TrendingUp size={11} style={{ color: 'var(--positive)' }} />
                  : <TrendingDown size={11} style={{ color: 'var(--destructive)' }} />}
                <p style={{ color: asset.change >= 0 ? 'var(--positive)' : 'var(--destructive)', fontSize: 12, fontWeight: 600 }}>
                  {asset.change >= 0 ? '+' : ''}{asset.change}%
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
