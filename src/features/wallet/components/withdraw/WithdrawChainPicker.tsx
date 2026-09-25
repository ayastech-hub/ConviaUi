import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { networkInfoForKey } from '../deposit/types';

export type ChainFeeRow = {
  chainKey: string;
  feeAsset: string;
  feeAmount: number | null;
  feeUsd: number | null;
  loading?: boolean;
};

interface Props {
  open: boolean;
  symbol: string;
  chains: ChainFeeRow[];
  selected?: string;
  onSelect: (chainKey: string) => void;
  onClose: () => void;
}

export function WithdrawChainPicker({ open, symbol, chains, selected, onSelect, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
          <motion.div
            initial={{ y: 48 }}
            animate={{ y: 0 }}
            exit={{ y: 48 }}
            className="rounded-t-[24px] max-h-[78vh] overflow-y-auto px-4 pt-3 pb-10"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--muted-foreground)' }} />
            <div className="flex items-center justify-between px-1 mb-3">
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>Choose a Chain Type</h2>
              <button type="button" onClick={onClose} className="p-1">
                <X size={20} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>

            <div
              className="rounded-2xl px-3.5 py-3 mb-4"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, lineHeight: 1.45 }}>
                Make sure the network you withdraw on matches the network the recipient uses to deposit. Wrong
                network can mean permanent loss.
              </p>
            </div>

            {chains.map((row) => {
              const info = networkInfoForKey(row.chainKey);
              const active = selected === row.chainKey;
              const feeTxt =
                row.loading
                  ? 'Estimating fee…'
                  : row.feeAmount != null
                    ? `Fee: ${row.feeAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${row.feeAsset}${
                        row.feeUsd != null ? ` (≈$${row.feeUsd.toFixed(2)})` : ''
                      }`
                    : 'Fee: quote on amount';
              return (
                <button
                  key={row.chainKey}
                  type="button"
                  onClick={() => {
                    onSelect(row.chainKey);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl mb-1.5 text-left"
                  style={{
                    background: active ? 'var(--muted)' : 'var(--card)',
                    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--muted)' }}
                  >
                    <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 11 }}>
                      {(info.label || info.name).slice(0, 4)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                      {info.name}
                      {info.label && info.label !== info.name ? ` (${info.label})` : ''}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>{feeTxt}</p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
