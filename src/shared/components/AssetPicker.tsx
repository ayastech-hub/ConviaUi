import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import type { Asset } from '../data/mockData';
import { AssetIcon } from './AssetIcon';
import { useTokenRegistry } from '../hooks/useTokenRegistry';

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  selected?: Asset | null;
  /** Optional subset; defaults to live registry */
  assets?: Asset[];
}

/** Token picker from GET /tokens registry — never falls back to mock cryptoAssets. */
export function AssetPicker({ open, onClose, onSelect, selected, assets: assetsProp }: AssetPickerProps) {
  const { assets: registryAssets, loading } = useTokenRegistry();
  const assets = assetsProp?.length ? assetsProp : registryAssets;
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query),
    );
  }, [assets, q]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col"
          style={{ background: 'var(--background)' }}
        >
          <div style={{ height: 50 }} />
          <div className="flex items-center gap-3 px-5 mb-4">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[14px]"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search token"
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', fontSize: 14 }}
              />
            </div>
            <button type="button" onClick={onClose} aria-label="Close">
              <X size={22} style={{ color: 'var(--foreground)' }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            {loading && assets.length === 0 && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading tokens…</p>
            )}
            {!loading && assets.length === 0 && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                No tokens in registry. Seed tokens on the backend.
              </p>
            )}
            {filtered.map((a) => (
              <button
                key={a.id || a.symbol}
                type="button"
                onClick={() => {
                  onSelect(a);
                  onClose();
                }}
                className="w-full flex items-center gap-3 py-3 text-left"
                style={{
                  borderBottom: '1px solid var(--border)',
                  opacity: selected?.symbol === a.symbol ? 1 : 0.95,
                }}
              >
                <AssetIcon symbol={a.symbol} size={36} />
                <div className="flex-1">
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{a.symbol}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.name}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
