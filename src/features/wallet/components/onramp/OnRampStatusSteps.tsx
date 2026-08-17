import { motion } from 'motion/react';
import { Loader, CheckCircle2, Clock } from 'lucide-react';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface OnRampProcessingStepProps {
  currency: Currency;
  amount: string;
  youGet: number;
  symbol: string;
}

/** On-Ramp step 4: brief "converting" spinner. */
export function OnRampProcessingStep({ currency, amount, youGet, symbol }: OnRampProcessingStepProps) {
  const { t } = useLanguage();
