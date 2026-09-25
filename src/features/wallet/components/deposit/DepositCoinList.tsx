import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, HelpCircle } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { PageTop } from '../../../../shared/components/PageTop';
import { BackButton } from '../../../../shared/components/BackButton';

interface Props {
  assets: Asset[];
  goBack: () => void;
  onSelect: (a: Asset) => void;
  onHelp?: () => void;
}

export function DepositCoinList({ assets, goBack, onSelect, onHelp }: Props) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = [...assets].sort((a, b) => a.symbol.localeCompare(b.symbol));
    if (!needle) return list;
    return list.filter(
      (a) =>
        a.symbol.toLowerCase().includes(needle) ||
        (a.name || '').toLowerCase().includes(needle),
    );
  }, [assets, q]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={goBack} />
        <h1
          style={{
            color: 'var(--foreground)',
            fontWeight: 800,
            fontSize: 18,
            flex: 1,
            textAlign: 'center',
            marginRight: 40,
          }}
        >
          Select Coin
        </h1>
      </div>

      <div className="px-5 mb-3">
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full mb-3"
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
        <button
          type="button"
          onClick={onHelp}
          className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <HelpCircle size={18} style={{ color: 'var(--muted-foreground)' }} />
          <div className="flex-1">
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>How to Deposit?</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Learn more →</p>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {filtered.map((asset, i) => (
          <motion.button
            key={asset.id || asset.symbol}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(asset)}
            className="flex items-center gap-3 py-3 w-full text-left"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <AssetIcon symbol={asset.symbol} size={40} />
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="truncate">
                {asset.name || asset.symbol}
              </p>
            </div>
          </motion.button>
        ))}
        {!filtered.length && (
          <p className="text-center py-12" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No Results
          </p>
        )}
      </div>
    </div>
  );
}
