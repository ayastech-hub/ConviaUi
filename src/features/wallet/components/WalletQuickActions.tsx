import { motion } from 'motion/react';
import { CreditCard, Landmark, ArrowDownToLine, ArrowUpFromLine, PieChart } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface WalletQuickActionsProps {
  onNavigate: (s: Screen) => void;
}

/** Buy/Sell primary buttons plus the Receive/Withdraw/Portfolio row, shown at the top of Wallet. */
export function WalletQuickActions({ onNavigate }: WalletQuickActionsProps) {
  const { t } = useLanguage();
  const secondary: { label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>; screen: Screen }[] = [
    { label: t('nav.receive'), icon: ArrowDownToLine, screen: 'receive' },
    { label: t('nav.withdraw'), icon: ArrowUpFromLine, screen: 'withdraw' },
    { label: t('portfolio.title'), icon: PieChart, screen: 'portfolio' },
  ];

  return (
    <div className="px-5 mb-4">
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('onramp')}
          className="flex items-center gap-3 p-4 rounded-[16px]"
          style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <CreditCard size={20} style={{ color: 'var(--positive)' }} />
          </div>
          <div className="text-left">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{t('onramp.title')}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{t('nav.buy')}</p>
          </div>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('offramp')}
          className="flex items-center gap-3 p-4 rounded-[16px]"
          style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Landmark size={20} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="text-left">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{t('offramp.title')}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{t('nav.withdraw')}</p>
          </div>
        </motion.button>
      </div>
      <div className="grid grid-cols-3 gap-2.5 mt-2.5">
        {secondary.map(({ label, icon: Icon, screen }) => (
          <motion.button
            key={screen}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onNavigate(screen)}
            className="flex flex-col items-center gap-2 p-3 rounded-[14px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <Icon size={17} style={{ color: 'var(--foreground)' }} strokeWidth={2} />
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}>{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
