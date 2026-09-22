import { motion } from 'motion/react';
import { Check, Loader } from 'lucide-react';
import { useCurrency, type Currency } from '../../../shared/context/CurrencyContext';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { CountryFlag } from '../../../shared/components/CountryFlag';

interface CurrencyPickerViewProps {
  currentCode: string;
  onSelect: (currency: Currency) => void;
  onBack: () => void;
}

/** Simple list of supported markets — no search (short list). */
export function CurrencyPickerView({ currentCode, onSelect, onBack }: CurrencyPickerViewProps) {
  const { currencies, loading } = useCurrency();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title="Currency" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {loading && currencies.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-10">
            <Loader size={16} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading…</span>
          </div>
        )}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {currencies.map((c, i) => {
            const on = currentCode === c.code;
            return (
              <motion.button
                key={c.code}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(c)}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-left"
                style={{
                  borderBottom:
                    i < currencies.length - 1
                      ? '1px solid color-mix(in oklab, var(--border) 85%, transparent)'
                      : 'none',
                  background: on
                    ? 'color-mix(in oklab, var(--primary) 10%, transparent)'
                    : 'transparent',
                }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                  style={{ background: 'var(--muted)' }}
                >
                  <CountryFlag code={c.code} size={24} />
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{c.code}</p>
                  <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 12.5 }}>
                    {c.name || c.code}
                  </p>
                </div>
                {on && <Check size={18} style={{ color: 'var(--primary)' }} />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
