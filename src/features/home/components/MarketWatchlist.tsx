import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { fetchTokensInfo, type TokenMarketInfo } from '../../../shared/api/tokens';
import { useTokenRegistry, CANONICAL_ASSETS } from '../../../shared/hooks/useTokenRegistry';
import { cacheGet, cacheSet } from '../../../shared/cache/queryCache';

interface MarketWatchlistProps {
  onSeeAll: () => void;
  onSelectAsset: (symbol: string) => void;
}

/** Markets from GET /tokens/info for registry symbols — no mock marketData. */
export function MarketWatchlist({ onSeeAll, onSelectAsset }: MarketWatchlistProps) {
  const { format } = useCurrency();
  const { assets, loading: regLoading } = useTokenRegistry();
  const [rows, setRows] = useState<
    Array<{ symbol: string; price: number; change: number; vol: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const symbols = (assets.length ? assets : CANONICAL_ASSETS.map((c) => ({ symbol: c.symbol }))).map((a) => a.symbol).slice(0, 12);
    if (!symbols.length) {
      if (!regLoading) {
        setRows([]);
        setLoading(false);
      }
      return;
    }
    const key = `markets:${symbols.join(',')}`;
    const cached = cacheGet<typeof rows>(key, 60_000);
    if (cached) {
      setRows(cached);
      setLive(true);
      setLoading(false);
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchTokensInfo(symbols);
        const tokens = res.tokens || [];
        if (cancelled) return;
        const mapped = tokens.map((t: TokenMarketInfo) => ({
          symbol: String(t.symbol || '').toUpperCase(),
          price: Number(t.priceUsd) || 0,
          change: Number(t.change24h) || 0,
          vol: t.volume24h != null ? String(t.volume24h) : '—',
        }));
        cacheSet(key, mapped);
        setRows(mapped.slice(0, 4));
        setLive(true);
      } catch {
        if (!cancelled && !cached) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assets, regLoading]);

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>
          Markets
          {live && (
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
      {loading && rows.length === 0 && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading markets…</p>
      )}
      {!loading && rows.length === 0 && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          No market data yet. Tokens appear when the registry and price API respond.
        </p>
      )}
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
