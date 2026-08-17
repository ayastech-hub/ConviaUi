import { motion } from 'motion/react';
import { Check, Loader } from 'lucide-react';
import { useCurrency, type Currency } from '../../../shared/context/CurrencyContext';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface CurrencyPickerViewProps {
  currentCode: string;
  onSelect: (currency: Currency) => void;
  onBack: () => void;
}

/** Currencies derived from GET /banks/countries (supported markets), not a static world list. */
export function CurrencyPickerView({ currentCode, onSelect, onBack }: CurrencyPickerViewProps) {
  const { t } = useLanguage();
  const { currencies, loading } = useCurrency();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title={t('currency.select')} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>
          Supported operating markets only (from bank directory).
        </p>
        {loading && currencies.length === 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Loader size={16} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading…</span>
          </div>
        )}
        <div
          className="rounded-[20px] overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {currencies.map((c, i) => (
            <motion.button
              key={c.code}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(c)}
              className="flex items-center gap-3 px-4 py-3.5 w-full"
              style={{ borderBottom: i < currencies.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>{c.flag}</span>
              </div>
              <div className="flex-1 text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                  {c.code} · {c.name}
                </p>
              </div>
              {currentCode === c.code && <Check size={18} style={{ color: 'var(--foreground)' }} />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
