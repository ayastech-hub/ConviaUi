import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Check } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

interface AssetDropdownProps {
  open: boolean;
  assets: Asset[];
  selected: Asset;
  onSelect: (a: Asset) => void;
  onClose: () => void;
}

/** Bottom-sheet asset picker with search, used by Deposit (and similarly by other flows). */
export function AssetDropdown({ open, assets, selected, onSelect, onClose }: AssetDropdownProps) {
  const [q, setQ] = useState('');
  const filtered = assets.filter(
    (a) => a.symbol.toLowerCase().includes(q.toLowerCase()) || a.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '20px 16px 28px', border: '1px solid var(--border)', maxHeight: '78%', overflowY: 'auto' }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Select asset</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'var(--muted)', border: '1px solid var(--border)', marginBottom: 12 }}>
              <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
              <input
                placeholder="Search asset..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--foreground)', fontSize: 14 }}
              />
            </div>
            {filtered.map((a) => (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onSelect(a); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 10px', borderRadius: 14, background: selected.id === a.id ? 'var(--muted)' : 'transparent', border: '1px solid transparent', marginBottom: 2 }}
              >
                <AssetIcon symbol={a.symbol} size={38} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{a.symbol}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                    ${a.price < 1 ? a.price.toFixed(4) : a.price.toLocaleString('en', { maximumFractionDigits: 2 })}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: a.change24h >= 0 ? 'var(--positive)' : 'var(--destructive)' }}>
                    {a.change24h >= 0 ? '+' : ''}{a.change24h.toFixed(2)}%
                  </p>
                </div>
                {selected.id === a.id && <Check size={18} style={{ color: 'var(--foreground)' }} />}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
