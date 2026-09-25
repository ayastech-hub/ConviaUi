import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';

interface Props {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
  onOnChain: () => void;
  onInternal: () => void;
}

export function WithdrawMethodSheet({ open, asset, onClose, onOnChain, onInternal }: Props) {
  return (
    <AnimatePresence>
      {open && asset && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            className="rounded-t-[24px] px-5 pt-3 pb-10"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted-foreground)' }} />
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Withdraw</h2>
              <button type="button" onClick={onClose} className="p-1">
                <X size={20} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>

            <button
              type="button"
              onClick={onOnChain}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl mb-2.5 text-left"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>On-Chain</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 3 }}>
                  Withdrawal to an on-chain address
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} />
            </button>

            <button
              type="button"
              onClick={onInternal}
              className="w-full flex items-center justify-between px-4 py-4 rounded-2xl text-left"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Internal Transfer</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 3 }}>
                  Send to a Convia user by username — 0 fee
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
