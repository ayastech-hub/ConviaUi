import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, CheckCircle2 } from 'lucide-react';
import { cryptoAssets, type Asset } from '../data/mockData';
import { AssetIcon } from './AssetIcon';
import { useCurrency } from '../context/CurrencyContext';

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  excludeId?: string;
  title?: string;
}

export function AssetPicker({ open, onClose, onSelect, excludeId, title = 'Select token' }: AssetPickerProps) {
  const { format } = useCurrency();
  const [search, setSearch] = useState('');

  const filtered = cryptoAssets.filter(a => {
    if (excludeId && a.id === excludeId) return false;
    return a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (asset: Asset) => {
    onSelect(asset);
    setSearch('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] overflow-hidden"
            style={{ background: 'var(--card)', maxHeight: '70%' }}
          >
            <div className="sticky top-0 z-10 px-5 pt-4 pb-3" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
              <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted)' }} />
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{title}</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <X size={18} style={{ color: 'var(--foreground)' }} />
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-[12px]" style={{ background: 'var(--muted)' }}>
                <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  placeholder="Search token..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 14 }}
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 140px)' }}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>No tokens found</p>
                </div>
              ) : (
                filtered.map((asset, i) => (
                  <motion.button
                    key={asset.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(asset)}
                    className="flex items-center gap-3 px-5 py-3.5 w-full"
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <AssetIcon symbol={asset.symbol} size={36} />
                    <div className="flex-1 text-left">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.balance.toFixed(4)}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{format(asset.valueUSD)}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
