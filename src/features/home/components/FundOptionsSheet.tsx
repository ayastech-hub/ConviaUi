import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShoppingCart, ArrowDownLeft, ChevronRight, X } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen, param?: string) => void;
  mode?: 'deposit' | 'withdraw';
};

const DEPOSIT_ROWS = [
  {
    id: 'card',
    label: 'Credit/debit card',
    sub: 'Buy with card — fast & simple',
    badge: 'Recommended',
    Icon: CreditCard,
    screen: 'onramp' as Screen,
  },
  {
    id: 'buy',
    label: 'Buy crypto',
    sub: 'Card, bank transfer, and more',
    Icon: ShoppingCart,
    screen: 'onramp' as Screen,
  },
  {
    id: 'receive',
    label: 'Receive crypto assets',
    sub: 'Send from another wallet or exchange',
    Icon: ArrowDownLeft,
    screen: 'deposit' as Screen,
  },
];

const WITHDRAW_ROWS = [
  {
    id: 'sell',
    label: 'Sell to bank',
    sub: 'Cash out to your bank account',
    badge: 'Recommended',
    Icon: CreditCard,
    screen: 'offramp' as Screen,
  },
  {
    id: 'external',
    label: 'External wallet',
    sub: 'Withdraw on-chain to any address',
    Icon: ArrowDownLeft,
    screen: 'withdraw' as Screen,
  },
];

/** Compact bottom sheet for Add funds / Withdraw entry (not a full page). */
export function FundOptionsSheet({ open, onClose, onNavigate, mode = 'deposit' }: Props) {
  const rows = mode === 'withdraw' ? WITHDRAW_ROWS : DEPOSIT_ROWS;
  const title = mode === 'withdraw' ? 'Withdraw' : 'Deposit';

  const go = (screen: Screen) => {
    onClose();
    window.setTimeout(() => onNavigate(screen), 120);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={title}
            className="fixed left-0 right-0 bottom-0 z-[81] flex flex-col"
            style={{
              borderRadius: '20px 20px 0 0',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 -12px 40px rgba(0,0,0,0.4)',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: 'var(--muted-foreground)', opacity: 0.35 }}
              />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18 }}>{title}</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
                aria-label="Close"
              >
                <X size={18} style={{ color: 'var(--foreground)' }} />
              </motion.button>
            </div>

            <div className="px-4 pb-2 flex flex-col gap-2.5">
              {rows.map((row) => (
                <motion.button
                  key={row.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => go(row.screen)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <row.Icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
                        {row.label}
                      </span>
                      {'badge' in row && row.badge && (
                        <span
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                          style={{
                            background: 'color-mix(in oklab, var(--primary) 22%, transparent)',
                            color: 'var(--primary)',
                          }}
                        >
                          {row.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                      {row.sub}
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
