import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { NETWORKS } from './types';

interface NetworkDropdownProps {
  open: boolean;
  networks: string[];
  selected: string;
  onSelect: (n: string) => void;
  onClose: () => void;
}

/** Compact bottom sheet for deposit network. */
export function NetworkDropdown({ open, networks, selected, onSelect, onClose }: NetworkDropdownProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            exit={{ y: 24 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-[20px] px-4 pt-3 pb-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-9 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              Network
            </p>
            <div className="max-h-[40vh] overflow-y-auto">
              {networks.map((n) => {
                const info = NETWORKS[n] || { label: n, name: n, estTime: '—', color: 'var(--muted)' };
                const active = selected === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      onSelect(n);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left"
                    style={{ background: active ? 'var(--muted)' : 'transparent' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: info.color || 'var(--muted)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 10,
                      }}
                    >
                      {(info.label || n).slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                        {info.name || n}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                        {info.label} · {info.estTime}
                      </p>
                    </div>
                    {active && <Check size={16} style={{ color: 'var(--foreground)' }} />}
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
