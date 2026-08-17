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
