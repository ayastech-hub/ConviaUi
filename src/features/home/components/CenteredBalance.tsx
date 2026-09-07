import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useAuth } from '../../../shared/context/AuthContext';

interface Props {
  balanceVisible: boolean;
  onToggle: () => void;
}

/** Large centered total — matches modern wallet hubs; Convia portfolio API / mock. */
export function CenteredBalance({ balanceVisible, onToggle }: Props) {
  const { data, loading, source } = usePortfolio();
  const { format } = useCurrency();
  const { status } = useAuth();
  const total = data ? Number(data.totalValueUsd) || 0 : 0;

  const display =
    status !== 'authenticated'
      ? '—'
      : loading
        ? '…'
        : balanceVisible
          ? format(total)
          : '••••••';

  return (
    <div className="flex flex-col items-center px-5 pt-2 pb-5">
      <div className="flex items-center gap-2">
        <motion.p
          key={String(balanceVisible) + display}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          style={{
            color: 'var(--foreground)',
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          {display}
        </motion.p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          aria-label="Toggle balance visibility"
          className="p-1"
        >
          {balanceVisible ? (
            <Eye size={18} style={{ color: 'var(--muted-foreground)' }} />
          ) : (
            <EyeOff size={18} style={{ color: 'var(--muted-foreground)' }} />
          )}
        </motion.button>
      </div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>
        Total balance in USD
        {source === 'mock' ? ' · demo' : source === 'live' ? ' · live' : ''}
      </p>
    </div>
  );
}
