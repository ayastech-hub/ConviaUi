import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { AIRTIME_BILLER, DATA_BILLER, type NgOperator } from '../../../shared/utils/ngPhone';
import { ProviderIcon } from '../../../shared/icons/ProviderIcon';

const OPS: NgOperator[] = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'];

type Props = {
  open: boolean;
  mode: 'data' | 'airtime';
  currentCode: string | null;
  onClose: () => void;
  onPick: (code: string, name: string) => void;
};

export function NetworkSheet({ open, mode, currentCode, onClose, onPick }: Props) {
  const map = mode === 'data' ? DATA_BILLER : AIRTIME_BILLER;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 48 }}
            animate={{ y: 0 }}
            exit={{ y: 48 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] px-5 pt-3 pb-10"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
            <div className="flex items-center justify-between mb-2">
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Choose network</h2>
              <button type="button" onClick={onClose} className="p-2" aria-label="Close">
                <X size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>
              Auto-detected from number when possible. Ported numbers may need a manual pick.
            </p>
            <ul className="list-none m-0 p-0">
              {OPS.map((op) => {
                const b = map[op];
                const active = currentCode === b.code;
                return (
                  <li key={op}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(b.code, b.name);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3.5 py-3.5 text-left"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <ProviderIcon name={b.name} size={40} rounded="full" />
                      <span style={{ flex: 1, fontWeight: 600, color: 'var(--foreground)', fontSize: 16 }}>
                        {b.name}
                      </span>
                      {active && <Check size={18} style={{ color: 'var(--primary)' }} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
