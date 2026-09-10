import { motion, AnimatePresence } from 'motion/react';
import type { ReactNode } from 'react';

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Bottom enterprise confirm sheet — replaces window.confirm. */
export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep',
  destructive,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute left-0 right-0 bottom-0 z-[81] px-5 pt-4 pb-8"
            style={{
              background: 'var(--card)',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderTop: '1px solid var(--border)',
              maxWidth: 480,
              margin: '0 auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />
            <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, textAlign: 'center' }}>{title}</h3>
            {body && (
              <div className="mt-2.5 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.5 }}>
                {body}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="h-12 rounded-full font-bold text-[14px]"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="h-12 rounded-full font-bold text-[14px]"
                style={{
                  background: destructive ? 'var(--destructive, #ef4444)' : 'var(--primary)',
                  color: destructive ? '#fff' : 'var(--primary-foreground)',
                }}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
