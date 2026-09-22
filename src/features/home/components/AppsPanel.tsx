import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { DualIconBox, DualToneIcon, type DualIconKey } from './icons/DualToneIcons';
import { trackRecentUse } from '../../../shared/utils/recentlyUsed';

type Item = {
  id: string;
  label: string;
  icon: DualIconKey;
  screen?: Screen;
  param?: string;
  action?: 'send-sheet' | 'deposit-sheet';
};

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Manage assets',
    items: [
      { id: 'send', label: 'Send / Withdraw', icon: 'send', action: 'send-sheet' },
      { id: 'receive', label: 'Receive', icon: 'receive', action: 'deposit-sheet' },
      { id: 'buy', label: 'Buy crypto', icon: 'buy', screen: 'onramp' },
      { id: 'sell', label: 'Sell crypto', icon: 'sell', screen: 'offramp' },
      { id: 'swap', label: 'Swap', icon: 'swap', screen: 'swap' },
      { id: 'history', label: 'History', icon: 'history', screen: 'history' },
    ],
  },
  {
    title: 'Bills & utilities',
    items: [
      { id: 'airtime', label: 'Airtime', icon: 'airtime', screen: 'airtime' },
      { id: 'data', label: 'Data', icon: 'data', screen: 'data' },
      { id: 'power', label: 'Electricity', icon: 'power', screen: 'electricity' },
      { id: 'tv', label: 'TV & cable', icon: 'tv', screen: 'tv' },
      { id: 'betting', label: 'Betting', icon: 'betting', screen: 'betting' },
    ],
  },
  {
    title: 'Pay',
    items: [
      { id: 'qr', label: 'QR pay', icon: 'qr', screen: 'scan' },
      { id: 'bank', label: 'Bank transfer', icon: 'bank', screen: 'onramp' },
      { id: 'card', label: 'Card', icon: 'card', screen: 'onramp' },
      { id: 'request', label: 'Request', icon: 'request', screen: 'request' },
      { id: 'reqlink', label: 'Payment link', icon: 'reqlink', screen: 'request-link' },
      { id: 'scan', label: 'Scanner', icon: 'scan', screen: 'scan' },
    ],
  },
  {
    title: 'Rewards & gifts',
    items: [
      { id: 'rewards', label: 'Rewards', icon: 'rewards', screen: 'rewards' },
      { id: 'gifts', label: 'Gifts', icon: 'gifts', screen: 'giveaway' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'security', label: 'Security', icon: 'security', screen: 'security' },
      { id: 'support', label: 'Support', icon: 'support', screen: 'support-center' },
    ],
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen, param?: string) => void;
  onOpenSend?: () => void;
  onOpenDeposit?: () => void;
};

export function AppsPanel({ open, onClose, onNavigate, onOpenSend, onOpenDeposit }: Props) {
  const go = (item: Item) => {
    trackRecentUse(
      (item.screen || (item.action === 'send-sheet' ? 'send' : 'deposit')) as Screen,
      item.param,
      item.label,
    );
    onClose();
    window.setTimeout(() => {
      if (item.action === 'send-sheet' && onOpenSend) {
        onOpenSend();
        return;
      }
      if (item.action === 'deposit-sheet' && onOpenDeposit) {
        onOpenDeposit();
        return;
      }
      if (item.screen) onNavigate(item.screen, item.param);
    }, 140);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label="More"
            className="fixed left-0 right-0 bottom-0 z-[81] flex flex-col"
            style={{
              maxHeight: '88vh',
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
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>More</p>
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

            <div className="overflow-y-auto px-4 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {SECTIONS.map((sec) => (
                <div key={sec.title} className="mb-6">
                  <p
                    className="px-1 mb-3"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {sec.title}
                  </p>
                  <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                    {sec.items.map((item) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => go(item)}
                        className="flex flex-col items-center gap-2 py-1"
                      >
                        <DualIconBox>
                          <DualToneIcon name={item.icon} />
                        </DualIconBox>
                        <span
                          className="text-center leading-tight"
                          style={{
                            color: 'var(--foreground)',
                            fontSize: 11,
                            fontWeight: 500,
                            maxWidth: 72,
                          }}
                        >
                          {item.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
