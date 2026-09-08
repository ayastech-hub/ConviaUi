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

function splitAmount(n: number, decimals: number) {
  const formatted = n.toLocaleString('en', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const dot = formatted.lastIndexOf('.');
  if (decimals === 0 || dot < 0) return { whole: formatted, frac: '' };
  return { whole: formatted.slice(0, dot), frac: formatted.slice(dot) };
}

/**
 * Enterprise wallet hero.
 * Currency picker sits ABOVE the digits; code/symbol uses muted white,
 * the number uses high-contrast tabular figures.
 */
export function CenteredBalance({ balanceVisible, onToggle }: Props) {
  const { data, loading } = usePortfolio();
  const { currency, currencies, setCurrency, convert } = useCurrency();
  const { status } = useAuth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [q, setQ] = useState('');

  const totalUsd = data ? Number(data.totalValueUsd) || 0 : 0;
  const converted = convert(totalUsd);
  const decimals = (currency.rate || 1) > 100 ? 0 : 2;
  const { whole, frac } = splitAmount(Number.isFinite(converted) ? converted : 0, decimals);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return currencies;
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(needle) ||
        c.name.toLowerCase().includes(needle) ||
        (c.symbol || '').toLowerCase().includes(needle),
    );
  }, [currencies, q]);

  const pick = (c: Currency) => {
    setCurrency(c);
    setPickerOpen(false);
    setQ('');
  };

  const showSkeleton = loading && status === 'authenticated' && data == null;

  return (
    <div className="flex flex-col items-center px-5 pt-1 pb-6">
      {/* Currency picker — ABOVE the amount, muted vs digits */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setPickerOpen(true)}
        className="flex items-center gap-1.5 mb-3"
        aria-label="Change display currency"
      >
        <CurrencyIcon code={currency.code} size={16} />
        <span
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {currency.code}
        </span>
        <ChevronDown size={13} strokeWidth={2.4} style={{ color: 'var(--muted-foreground)' }} />
      </motion.button>

      {/* Amount + hide */}
      <div className="flex items-start justify-center gap-2">
        <motion.div
          key={String(balanceVisible) + currency.code + whole + frac}
          initial={{ opacity: 0.55, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-baseline justify-center"
          style={{ lineHeight: 1 }}
        >
          {!balanceVisible ? (
            <span
              className="tabular-nums"
              style={{
                color: 'var(--foreground)',
                fontSize: 42,
                fontWeight: 650,
                letterSpacing: 4,
              }}
            >
              ••••••
            </span>
          ) : showSkeleton ? (
            <span
              className="tabular-nums"
              style={{ color: 'var(--muted-foreground)', fontSize: 42, fontWeight: 600 }}
            >
              …
            </span>
          ) : (
            <>
              <span
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 22,
                  fontWeight: 600,
                  marginRight: 6,
                  position: 'relative',
                  top: -8,
                }}
              >
                {currency.symbol}
              </span>
              <span
                className="tabular-nums"
                style={{
                  color: 'var(--foreground)',
                  fontSize: 42,
                  fontWeight: 650,
                  letterSpacing: -1.4,
                }}
              >
                {whole}
              </span>
              {frac ? (
                <span
                  className="tabular-nums"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 22,
                    fontWeight: 550,
                    letterSpacing: -0.6,
                  }}
                >
                  {frac}
                </span>
              ) : null}
            </>
          )}
        </motion.div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          aria-label="Toggle balance visibility"
          className="mt-1.5 p-1.5 rounded-full"
          style={{ background: 'transparent' }}
        >
          {balanceVisible ? (
            <Eye size={18} style={{ color: 'var(--muted-foreground)' }} />
          ) : (
            <EyeOff size={18} style={{ color: 'var(--muted-foreground)' }} />
          )}
        </motion.button>
      </div>

      <p
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 12,
          fontWeight: 500,
          marginTop: 10,
          letterSpacing: 0.2,
        }}
      >
        Total balance
      </p>

      <AnimatePresence>
        {pickerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close backdrop"
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
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="fixed z-50 left-1/2 -translate-x-1/2 flex flex-col overflow-hidden"
              style={{
                top: 'max(12%, env(safe-area-inset-top))',
                width: 'min(92vw, 400px)',
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
                    Converted from USD
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
                  style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                >
                  <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search code or name"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: 'var(--foreground)' }}
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
                      style={{ background: active ? 'var(--muted)' : 'transparent' }}
                    >
                      <CurrencyIcon code={c.code} size={40} />
                      <div className="flex-1 min-w-0">
                        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
                          {c.code}
                        </p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{c.name}</p>
                      </div>
                      <span
                        className="tabular-nums"
                        style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}
                      >
                        {c.symbol}
                      </span>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: active ? 'var(--primary)' : 'transparent',
                          border: active ? 'none' : '1px solid var(--border)',
                        }}
                      >
                        {active ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
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
