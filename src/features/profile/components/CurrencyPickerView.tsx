import { motion } from 'motion/react';
import { Check, Loader } from 'lucide-react';
import { useCurrency, type Currency } from '../../../shared/context/CurrencyContext';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { CurrencyIcon } from '../../../shared/icons/CurrencyIcon';

interface CurrencyPickerViewProps {
  currentCode: string;
  onSelect: (currency: Currency) => void;
  onBack: () => void;
}

/** Currencies from GET /banks/countries (supported markets only). */
export function CurrencyPickerView({ currentCode, onSelect, onBack }: CurrencyPickerViewProps) {
  const { t } = useLanguage();
  const { currencies, loading } = useCurrency();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title={t('currency.select')} subtitle="Supported operating markets" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16, lineHeight: 1.45 }}>
          Display currency for balances and amounts. Markets come from the bank directory.
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
          {currencies.map((c, i) => {
            const on = currentCode === c.code;
            return (
              <motion.button
                key={c.code}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(c)}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-left"
                style={{ borderBottom: i < currencies.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)' }}
                >
                  <CurrencyIcon code={c.code} size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                    {c.code}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="truncate">
                    {c.name}
                  </p>
                </div>
                {on && <Check size={18} style={{ color: 'var(--foreground)' }} />}
              </motion.button>
            );
          })}
          {!loading && currencies.length === 0 && (
            <p className="px-4 py-8 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              No markets loaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
