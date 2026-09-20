import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import type { Asset } from '../data/mockData';
import { AssetIcon } from './AssetIcon';
import { useTokenRegistry } from '../hooks/useTokenRegistry';
import { useCurrency } from '../context/CurrencyContext';

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (a: Asset) => void;
  selected?: Asset | null;
  assets?: Asset[];
  excludeId?: string;
  title?: string;
  showBalances?: boolean;
}

export function AssetPicker({
  open,
  onClose,
  onSelect,
  selected,
  assets: assetsProp,
  excludeId,
  title = 'Select token',
  showBalances = true,
}: AssetPickerProps) {
  const { assets: registryAssets, loading } = useTokenRegistry();
  const { format } = useCurrency();
  const assets =
    Array.isArray(assetsProp) && assetsProp.length
      ? assetsProp
      : Array.isArray(registryAssets)
        ? registryAssets
        : [];
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const list = Array.isArray(assets) ? assets : [];
    const query = q.trim().toLowerCase();
    let rows = list.filter((a) => (excludeId ? a.id !== excludeId : true));
    if (query) {
      rows = rows.filter(
        (a) =>
          a.symbol.toLowerCase().includes(query) ||
          (a.name || '').toLowerCase().includes(query),
      );
    }
    return [...rows].sort(
      (a, b) => (b.valueUSD || 0) - (a.valueUSD || 0) || (b.balance || 0) - (a.balance || 0),
    );
  }, [assets, q, excludeId]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] px-4 pt-3 pb-8 max-h-[78vh] flex flex-col"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>{title}</h2>
              <button type="button" onClick={onClose} className="p-2" aria-label="Close">
                <X size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>
            <div
              className="flex items-center gap-2 px-3 h-11 rounded-2xl mb-3"
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
            <div className="overflow-y-auto flex-1 min-h-0">
              {loading && assets.length === 0 && (
                <p className="py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  Loading…
                </p>
              )}
              {!loading && filtered.length === 0 && (
                <p className="py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  No tokens available
                </p>
              )}
              {filtered.map((a) => {
                const bal = Number(a.balance) || 0;
                const active = selected?.symbol === a.symbol || selected?.id === a.id;
                return (
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
                      opacity: bal <= 0 && showBalances ? 0.55 : 1,
                      background: active
                        ? 'color-mix(in oklab, var(--primary) 8%, transparent)'
                        : 'transparent',
                    }}
                  >
                    <AssetIcon symbol={a.symbol} size={36} />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{a.symbol}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.name}</p>
                    </div>
                    {showBalances && (
                      <div className="text-right shrink-0">
                        <p
                          className="tabular-nums"
                          style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}
                        >
                          {bal > 0
                            ? bal.toLocaleString(undefined, {
                                maximumFractionDigits: bal < 1 ? 6 : 4,
                              })
                            : '0'}
                        </p>
                        <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                          {format(Number(a.valueUSD) || 0)}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
