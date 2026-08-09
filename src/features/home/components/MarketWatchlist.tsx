import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { fetchTokensInfo, type TokenMarketInfo } from '../../../shared/api/tokens';
import { marketData } from '../../../shared/data/mockData';

interface MarketWatchlistProps {
  onSeeAll: () => void;
  onSelectAsset: (symbol: string) => void;
}

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB'];

/** Markets row — prefers GET /tokens/info, falls back to static list if API down. */
export function MarketWatchlist({ onSeeAll, onSelectAsset }: MarketWatchlistProps) {
  const { format } = useCurrency();
  const [rows, setRows] = useState<
    Array<{ symbol: string; price: number; change: number; vol: string; live: boolean }>
  >([]);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchTokensInfo(DEFAULT_SYMBOLS);
        const tokens = res.tokens || [];
        if (!tokens.length) throw new Error('empty');
        if (cancelled) return;
        setSource('live');
        setRows(
          tokens.slice(0, 4).map((t: TokenMarketInfo) => ({
            symbol: String(t.symbol || '').toUpperCase(),
            price: Number(t.priceUsd) || 0,
            change: Number(t.change24h) || 0,
            vol: t.volume24h != null ? String(t.volume24h) : '—',
            live: true,
          })),
        );
      } catch {
        if (cancelled) return;
        setSource('fallback');
        setRows(
          marketData.slice(0, 4).map((a) => ({
            symbol: a.symbol,
            price: a.price,
            change: a.change,
            vol: a.vol,
            live: false,
          })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>
          Markets
          {source === 'live' && (
            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: 'var(--positive)' }}>LIVE</span>
          )}
        </h3>
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1"
          style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}
        >
          See all <ChevronRight size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((asset, i) => (
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
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Vol {asset.vol}</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                {asset.price ? format(asset.price) : '—'}
              </p>
              <p
                style={{
                  color: asset.change >= 0 ? 'var(--positive)' : 'var(--destructive)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {asset.change >= 0 ? '+' : ''}
                {asset.change.toFixed(2)}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
