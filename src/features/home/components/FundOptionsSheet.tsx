import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { DualIconBox, DualToneIcon, type DualIconKey } from './icons/DualToneIcons';

export type FundSheetMode = 'deposit' | 'send';

type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen, param?: string) => void;
  mode?: FundSheetMode;
};

type Row = {
  id: string;
  label: string;
  sub: string;
  badge?: string;
  icon: DualIconKey;
  screen: Screen;
};

const DEPOSIT_ROWS: (Row & { param?: string })[] = [
  {
    id: 'receive',
    label: 'Deposit address',
    sub: 'Receive crypto on-chain to your wallet',
    badge: 'On-chain',
    icon: 'receive',
    screen: 'deposit',
  },
  {
    id: 'card',
    label: 'Credit / debit card',
    sub: 'Buy crypto with card',
    badge: 'Recommended',
    icon: 'card',
    screen: 'onramp',
    param: 'card',
  },
  {
    id: 'bank',
    label: 'Bank transfer',
    sub: 'Pay from your local bank account',
    icon: 'bank',
    screen: 'onramp',
    param: 'bank',
  },
];

const SEND_ROWS: (Row & { param?: string })[] = [
  {
    id: 'onchain',
    label: 'On-Chain',
    sub: 'Withdraw crypto to an external address',
    icon: 'send',
    screen: 'withdraw',
    param: 'onchain',
  },
  {
    id: 'internal',
    label: 'Internal Transfer',
    sub: 'Send to a Convia user — 0 fee',
    badge: 'Zero fee',
    icon: 'request',
    screen: 'withdraw',
    param: 'internal',
  },
  {
    id: 'bank',
    label: 'Withdraw to bank',
    sub: 'Cash out to your bank account',
    icon: 'bank',
    screen: 'offramp',
  },
];

export function FundOptionsSheet({ open, onClose, onNavigate, mode = 'deposit' }: Props) {
  const rows = mode === 'send' ? SEND_ROWS : DEPOSIT_ROWS;
  const title = mode === 'send' ? 'Send / Withdraw' : 'Deposit';

  const go = (screen: Screen, param?: string) => {
    onClose();
    window.setTimeout(() => onNavigate(screen, param), 120);
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
              boxShadow: '0 -12px 40px rgba(0,0,0,0.35)',
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
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
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>{title}</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="flex items-center justify-center p-1"
                style={{ background: 'transparent', border: 'none' }}
                aria-label="Close"
              >
                <X size={22} strokeWidth={2.35} style={{ color: 'var(--foreground)' }} />
              </motion.button>
            </div>

            <div className="px-4 pb-2 flex flex-col gap-2.5">
              {rows.map((row) => (
                <motion.button
                  key={row.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => go(row.screen, (row as { param?: string }).param)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <DualIconBox size={44}>
                    <span style={{ transform: 'scale(0.82)', transformOrigin: 'center' }}>
                      <DualToneIcon name={row.icon} />
                    </span>
                  </DualIconBox>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
                        {row.label}
                      </span>
                      {row.badge ? (
                        <span
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                          style={{
                            background: 'color-mix(in oklab, var(--primary) 22%, transparent)',
                            color: 'var(--primary)',
                          }}
                        >
                          {row.badge}
                        </span>
                      ) : null}
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
