import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  CircleDollarSign,
  ArrowLeftRight,
  QrCode,
  Building2,
  Smartphone,
  Gift,
  Zap,
  Tv,
  Droplets,
  Trophy,
  Users,
  Headphones,
  Shield,
  History,
  ScanLine,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

type Item = { id: string; label: string; Icon: LucideIcon; screen?: Screen; serviceId?: string };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Manage assets',
    items: [
      { id: 'send', label: 'Send', Icon: ArrowUpRight, screen: 'send' },
      { id: 'receive', label: 'Receive', Icon: ArrowDownLeft, screen: 'deposit' },
      { id: 'buy', label: 'Buy crypto', Icon: CreditCard, screen: 'onramp' },
      { id: 'sell', label: 'Sell crypto', Icon: CircleDollarSign, screen: 'offramp' },
      { id: 'swap', label: 'Swap', Icon: ArrowLeftRight, screen: 'swap' },
      { id: 'withdraw', label: 'Withdraw', Icon: ArrowUpRight, screen: 'withdraw' },
    ],
  },
  {
    title: 'Payment',
    items: [
      { id: 'qr', label: 'QR pay', Icon: QrCode, screen: 'scan' },
      { id: 'bank', label: 'Bank transfer', Icon: Building2, screen: 'onramp' },
      { id: 'card', label: 'Card', Icon: CreditCard, screen: 'onramp' },
      { id: 'airtime', label: 'Mobile top-up', Icon: Smartphone, screen: 'services', serviceId: 'airtime' },
      { id: 'data', label: 'Data', Icon: Zap, screen: 'services', serviceId: 'data' },
      { id: 'power', label: 'Electricity', Icon: Droplets, screen: 'services', serviceId: 'electricity' },
      { id: 'tv', label: 'TV & cable', Icon: Tv, screen: 'services', serviceId: 'bills' },
    ],
  },
  {
    title: 'Rewards',
    items: [
      { id: 'rewards', label: 'Rewards', Icon: Trophy, screen: 'rewards' },
      { id: 'gifts', label: 'Gifts', Icon: Gift, screen: 'giveaway' },
      { id: 'request', label: 'Request', Icon: Users, screen: 'request' },
      { id: 'reqlink', label: 'Payment link', Icon: QrCode, screen: 'request-link' },
    ],
  },
  {
    title: 'Others',
    items: [
      { id: 'history', label: 'History', Icon: History, screen: 'history' },
      { id: 'scan', label: 'Scanner', Icon: ScanLine, screen: 'scan' },
      { id: 'security', label: 'Security', Icon: Shield, screen: 'security' },
      { id: 'support', label: 'Support', Icon: Headphones, screen: 'support-center' },
    ],
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen, param?: string) => void;
};

export function AppsPanel({ open, onClose, onNavigate }: Props) {
  const go = (item: Item) => {
    onClose();
    if (item.screen) {
      // small delay so sheet closes smoothly
      window.setTimeout(() => onNavigate(item.screen!, item.serviceId), 120);
    }
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
            aria-modal="true"
            aria-label="All apps"
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
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--muted-foreground)', opacity: 0.35 }} />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>Apps</p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
                aria-label="Close apps"
              >
                <X size={18} style={{ color: 'var(--foreground)' }} />
              </motion.button>
            </div>
            <div className="overflow-y-auto px-4 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {SECTIONS.map((sec) => (
                <div key={sec.title} className="mb-6">
                  <p
                    className="px-1 mb-3"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {sec.title}
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {sec.items.map((item) => (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => go(item)}
                        className="flex flex-col items-center gap-2 py-2"
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{
                            background: 'var(--muted)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <item.Icon size={22} style={{ color: 'var(--primary)' }} strokeWidth={2} />
                        </div>
                        <span
                          className="text-center leading-tight"
                          style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 500, maxWidth: 72 }}
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
