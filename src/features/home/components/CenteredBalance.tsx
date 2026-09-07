import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ChevronDown, Check, X } from 'lucide-react';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { useCurrency, type Currency } from '../../../shared/context/CurrencyContext';
import { useAuth } from '../../../shared/context/AuthContext';

interface Props {
  balanceVisible: boolean;
  onToggle: () => void;
}

/** Large centered total + currency picker sheet. */
export function CenteredBalance({ balanceVisible, onToggle }: Props) {
  const { data, loading, source } = usePortfolio();
  const { format, currency, currencies, setCurrency } = useCurrency();
  const { status } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);

  const total = data ? Number(data.totalValueUsd) || 0 : 0;

  // Always show a numeric balance (0 when empty / signed out) — never "—"
  const display = !balanceVisible
    ? '••••••'
    : loading && status === 'authenticated' && data == null
      ? '…'
      : format(total);

  const pick = (c: Currency) => {
    setCurrency(c);
    setPickerOpen(false);
  };

  return (
    <div className="flex flex-col items-center px-5 pt-2 pb-5">
      <div className="flex items-center gap-2">
        <motion.p
          key={String(balanceVisible) + display + currency.code}
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

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setPickerOpen(true)}
        className="flex items-center gap-1 mt-2 px-2 py-1 rounded-full"
        style={{ color: 'var(--muted-foreground)', fontSize: 13 }}
        aria-label="Change display currency"
      >
        <span>
          Total balance in {currency.code}
          {source === 'mock' ? ' · demo' : source === 'live' ? ' · live' : ''}
        </span>
        <ChevronDown size={14} strokeWidth={2.2} />
      </motion.button>

      <AnimatePresence>
        {pickerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              onClick={() => setPickerOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Select currency"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto"
              style={{
                maxWidth: 480,
                maxHeight: '70dvh',
                background: 'var(--card)',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                border: '1px solid var(--border)',
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
              }}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
                  Display currency
                </p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--muted)' }}
                  aria-label="Close currency picker"
                >
                  <X size={16} style={{ color: 'var(--foreground)' }} />
                </button>
              </div>
              <p className="px-5 pb-3" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                Amounts convert from USD using supported rates
              </p>
              <div className="overflow-y-auto px-3 pb-2" style={{ maxHeight: '50dvh' }}>
                {(currencies.length ? currencies : []).map((c) => {
                  const active = c.code === currency.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => pick(c)}
                      className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left mb-1"
                      style={{
                        background: active ? 'var(--muted)' : 'transparent',
                      }}
                    >
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: 'var(--background)' }}
                      >
                        {c.flag || c.code.slice(0, 1)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
                          {c.code}
                        </p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{c.name}</p>
                      </div>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                        {c.symbol}
                      </span>
                      {active && <Check size={18} style={{ color: 'var(--primary)' }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
