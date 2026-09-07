import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ChevronDown, Check, Search, X } from 'lucide-react';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { useCurrency, type Currency } from '../../../shared/context/CurrencyContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { CurrencyIcon } from '../../../shared/icons/CurrencyIcon';

interface Props {
  balanceVisible: boolean;
  onToggle: () => void;
}

/** Large centered total + enterprise currency sheet with flag icons. */
export function CenteredBalance({ balanceVisible, onToggle }: Props) {
  const { data, loading, source } = usePortfolio();
  const { format, currency, currencies, setCurrency } = useCurrency();
  const { status } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [q, setQ] = useState('');

  const total = data ? Number(data.totalValueUsd) || 0 : 0;

  const display = !balanceVisible
    ? '••••••'
    : loading && status === 'authenticated' && data == null
      ? '…'
      : format(total);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return currencies;
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(needle) ||
        c.name.toLowerCase().includes(needle) ||
        c.symbol.toLowerCase().includes(needle),
    );
  }, [currencies, q]);

  const pick = (c: Currency) => {
    setCurrency(c);
    setPickerOpen(false);
    setQ('');
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
        className="flex items-center gap-2 mt-2.5 pl-1.5 pr-2.5 py-1.5 rounded-full"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          fontSize: 13,
          fontWeight: 600,
        }}
        aria-label="Change display currency"
      >
        <CurrencyIcon code={currency.code} size={18} />
        <span>
          {currency.code}
          {source === 'mock' ? ' · demo' : source === 'live' ? ' · live' : ''}
        </span>
        <ChevronDown size={14} strokeWidth={2.2} style={{ color: 'var(--muted-foreground)' }} />
      </motion.button>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 8 }}>
        Total balance
      </p>

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
              style={{ background: 'rgba(0,0,0,0.55)' }}
              onClick={() => {
                setPickerOpen(false);
                setQ('');
              }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Select currency"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="fixed z-50 left-1/2 top-[12%] -translate-x-1/2 w-[min(92vw,400px)] flex flex-col overflow-hidden"
              style={{
                maxHeight: 'min(72dvh, 560px)',
                background: 'var(--card)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 pt-5 pb-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>
                    Display currency
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                    Portfolio converts from USD
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickerOpen(false);
                    setQ('');
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--muted)' }}
                  aria-label="Close"
                >
                  <X size={16} style={{ color: 'var(--foreground)' }} />
                </button>
              </div>

              <div className="px-4 py-3">
                <div
                  className="flex items-center gap-2 px-3 h-11 rounded-xl"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search code or name"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: 'var(--foreground)' }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pb-4">
                {list.map((c) => {
                  const active = c.code === currency.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => pick(c)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left"
                      style={{
                        background: active ? 'var(--muted)' : 'transparent',
                      }}
                    >
                      <CurrencyIcon code={c.code} size={40} />
                      <div className="flex-1 min-w-0 text-left">
                        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
                          {c.code}
                        </p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{c.name}</p>
                      </div>
                      <span
                        className="tabular-nums"
                        style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}
                      >
                        {c.symbol}
                      </span>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: active ? 'var(--primary)' : 'var(--border)',
                        }}
                      >
                        {active && <Check size={14} color="#fff" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
                {!list.length && (
                  <p className="py-10 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    No currencies match “{q}”
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
