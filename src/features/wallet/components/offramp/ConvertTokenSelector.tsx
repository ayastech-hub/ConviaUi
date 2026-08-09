import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

interface ConvertTokenSelectorProps {
  assets: Asset[];
  selected: Asset;
  open: boolean;
  onToggle: () => void;
  onSelect: (a: Asset) => void;
  onClose: () => void;
}

/** "Convert" token dropdown for the Off-Ramp form. */
export function ConvertTokenSelector({ assets, selected, open, onToggle, onSelect, onClose }: ConvertTokenSelectorProps) {
  return (
    <div className="mb-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Convert</p>
      <div className="relative">
        <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] glass-card" style={{ border: '1px solid var(--border)' }}>
          <AssetIcon symbol={selected.symbol} size={28} />
          <div className="flex-1 text-left">
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selected.symbol}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Bal: {selected.balance.toFixed(2)} {selected.symbol}</p>
          </div>
          <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={onClose} />
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full left-0 right-0 mt-1 rounded-[16px] overflow-hidden glass-card z-50" style={{ border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}>
                {assets.map((asset) => (
                  <button key={asset.id} onClick={() => onSelect(asset)} className="w-full flex items-center gap-3 px-4 py-3" style={{ borderBottom: asset.id !== assets[assets.length - 1].id ? '1px solid var(--border)' : 'none' }}>
                    <AssetIcon symbol={asset.symbol} size={24} />
                    <div className="flex-1 text-left">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.symbol}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{asset.name}</p>
                    </div>
                    {selected.id === asset.id && <CheckCircle2 size={16} style={{ color: 'var(--foreground)' }} />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
