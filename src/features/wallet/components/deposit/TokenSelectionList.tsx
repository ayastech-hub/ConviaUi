import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Search } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { PageTop } from '../../../../shared/components/PageTop';
import { BackButton } from '../../../../shared/components/BackButton';

interface TokenSelectionListProps {
  assets: Asset[];
  goBack: () => void;
  onSelect: (a: Asset) => void;
}

/** Deposit token picker with search. */
export function TokenSelectionList({ assets, goBack, onSelect }: TokenSelectionListProps) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(needle) ||
        a.name.toLowerCase().includes(needle),
    );
  }, [assets, q]);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
        <BackButton onClick={goBack} />
        <div>
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>
            Deposit
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
            Select a token to deposit
          </p>
        </div>
      </div>

      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-2 px-3 h-11 rounded-xl"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search token"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      </div>

      <div className="px-5 pb-5">
        {filtered.map((a, i) => (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(a)}
            className="flex items-center gap-3 p-4 rounded-[16px] mb-3 w-full text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <AssetIcon symbol={a.symbol} size={40} />
            <div className="flex-1">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{a.symbol}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.name}</p>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                {(a.chains || []).length} networks
              </p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </motion.button>
        ))}
        {!filtered.length && (
          <p className="py-10 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No tokens match “{q}”
          </p>
        )}
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}
