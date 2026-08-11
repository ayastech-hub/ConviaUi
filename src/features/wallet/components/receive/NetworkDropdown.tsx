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

function networkInfo(n: string) {
  if (NETWORKS[n]) return NETWORKS[n];
  // Registry may return chainKey ("ethereum") or chain name — never crash
  const label = n || 'Network';
  return {
    name: label,
    label: label.length > 12 ? label.slice(0, 12) : label,
    color: 'var(--primary)',
    estTime: '—',
  };
}

/** Bottom-sheet network picker — safe for registry chain keys not in NETWORKS map. */
export function NetworkDropdown({ open, networks, selected, onSelect, onClose }: NetworkDropdownProps) {
  const list = (networks || []).filter(Boolean);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: 'var(--card)',
              borderRadius: '24px 24px 0 0',
              padding: '20px 16px 28px',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: 'var(--border)',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
              Select network
            </p>
            {!list.length ? (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, padding: '12px 4px' }}>
                No deposit networks for this token yet. An admin must enable a chain variant in the registry.
              </p>
            ) : (
              list.map((n) => {
                const info = networkInfo(n);
                const active = selected === n;
                return (
                  <motion.button
                    key={n}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(n);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '14px 12px',
                      borderRadius: 14,
                      background: active ? 'var(--muted)' : 'transparent',
                      border: '1px solid transparent',
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: info.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: n === 'BSC' || n === 'BASE' ? '#000' : '#FFF',
                        fontWeight: 800,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {(info.label || n).slice(0, 3).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{info.name}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                        {info.label}
                        {info.estTime && info.estTime !== '—' ? ` · ~${info.estTime}` : ''}
                      </p>
                    </div>
                    {active && <Check size={18} style={{ color: 'var(--primary)' }} />}
                  </motion.button>
                );
              })
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
