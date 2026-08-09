import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { CURRENCIES, type Currency } from '../../../shared/context/CurrencyContext';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';

interface CurrencyPickerViewProps {
  currentCode: string;
  onSelect: (currency: Currency) => void;
  onBack: () => void;
}

/** Full-screen currency selector, shown when the user taps "Currency" in Settings. */
export function CurrencyPickerView({ currentCode, onSelect, onBack }: CurrencyPickerViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Select Currency" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>
          All prices and balances across the app will use this currency.
        </p>
        <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {CURRENCIES.map((c, i) => (
            <motion.button
              key={c.code}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(c)}
              className="flex items-center gap-3 px-4 py-3.5 w-full"
              style={{ borderBottom: i < CURRENCIES.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>{c.flag}</span>
              </div>
              <div className="flex-1 text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{c.code} · {c.name}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>1 USD = {c.symbol}{c.rate.toLocaleString()}</p>
              </div>
              {currentCode === c.code && <Check size={18} style={{ color: 'var(--foreground)' }} />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
