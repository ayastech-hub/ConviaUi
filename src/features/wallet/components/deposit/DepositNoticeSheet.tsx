import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle } from 'lucide-react';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { networkInfoForKey } from './types';

interface Props {
  open: boolean;
  symbol: string;
  chainKey: string;
  minDeposit: number;
  onConfirm: () => void;
  onClose: () => void;
}

/** Slide-to-confirm network/asset notice before revealing deposit address. */
export function DepositNoticeSheet({ open, symbol, chainKey, minDeposit, onConfirm, onClose }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const info = networkInfoForKey(chainKey);
  const THRESH = 0.72;

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const max = rect.width - 52;
    const x = Math.max(0, Math.min(max, e.clientX - rect.left - 26));
    setDragX(x);
    if (x / max >= THRESH) {
      setDragging(false);
      setDragX(0);
      onConfirm();
    }
  };
  const onPointerUp = () => {
    setDragging(false);
    setDragX(0);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.55)' }}
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
            <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--muted-foreground)' }} />
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>Notice</h2>
              <button type="button" onClick={onClose} className="p-1">
                <X size={20} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>

            <div className="flex gap-2.5 mb-3">
              <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: 'var(--foreground)', fontSize: 13.5, lineHeight: 1.5 }}>
                Only deposit <strong>{symbol}</strong> on this network. Sending the wrong asset or using a
                different chain can result in permanent loss.
              </p>
            </div>
            <div className="flex gap-2.5 mb-4">
              <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: 'var(--foreground)', fontSize: 13.5, lineHeight: 1.5 }}>
                Use the same chain type for deposits and withdrawals.
              </p>
            </div>

            <div
              className="rounded-2xl px-3.5 py-3 mb-6 space-y-2.5"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Coin</span>
                <span className="flex items-center gap-1.5" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
                  <AssetIcon symbol={symbol} size={18} /> {symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Chain Type</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                  {info.name}
                  {info.label ? ` (${info.label})` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Minimum Deposit</span>
                <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                  {minDeposit > 0 ? minDeposit : '—'} {symbol}
                </span>
              </div>
            </div>

            <div
              ref={trackRef}
              className="relative h-14 rounded-full overflow-hidden select-none touch-none"
              style={{ background: 'var(--muted)', border: '2px solid var(--primary)' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <p
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ color: 'var(--muted-foreground)', fontWeight: 600, fontSize: 14 }}
              >
                Slide to confirm
              </p>
              <motion.div
                className="absolute top-1 bottom-1 left-1 w-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--primary)', x: dragX }}
              >
                <span style={{ color: 'var(--primary-foreground, #fff)', fontWeight: 800, fontSize: 18 }}>→</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
