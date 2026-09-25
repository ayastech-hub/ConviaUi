import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { useCurrency } from '../../../../shared/context/CurrencyContext';
import { PageTop } from '../../../../shared/components/PageTop';
import { BackButton } from '../../../../shared/components/BackButton';

interface WithdrawTokenListProps {
  assets: Asset[];
  goBack: () => void;
  onSelect: (a: Asset) => void;
}

/** Select Coin — balances first, hide zero by default, search. */
export function WithdrawTokenList({ assets, goBack, onSelect }: WithdrawTokenListProps) {
  const { format } = useCurrency();
  const [q, setQ] = useState('');
  const [hideZero, setHideZero] = useState(true);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = [...assets].sort((a, b) => (b.balance || 0) - (a.balance || 0) || a.symbol.localeCompare(b.symbol));
    if (hideZero) list = list.filter((a) => Number(a.balance) > 0);
    if (needle) {
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(needle) ||
          (a.name || '').toLowerCase().includes(needle),
      );
    }
    return list;
  }, [assets, q, hideZero]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={goBack} />
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, flex: 1, textAlign: 'center', marginRight: 40 }}>
          Select Coin
        </h1>
      </div>

      <div className="px-5 mb-3">
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
        </div>
        <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideZero}
            onChange={(e) => setHideZero(e.target.checked)}
            className="rounded"
          />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Hide zero balances</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {filtered.length === 0 && (
          <p className="text-center py-10" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No coins to show
          </p>
        )}
        {filtered.map((asset, i) => (
          <motion.button
            key={asset.id || asset.symbol}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 10) * 0.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(asset)}
            className="flex items-center gap-3 py-3.5 w-full text-left"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <AssetIcon symbol={asset.symbol} size={40} />
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="truncate">
                {asset.name || asset.symbol}
              </p>
            </div>
            <div className="text-right">
              <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                {(asset.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </p>
              <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                ≈ {format(asset.valueUSD || (asset.balance || 0) * (asset.price || 0))}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
