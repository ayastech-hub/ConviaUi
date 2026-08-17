import { Loader } from 'lucide-react';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface WithdrawProcessingStepProps {
  amount: string;
  symbol: string;
  chain: string;
}

/** Loading spinner shown while a withdrawal is "submitting". */
export function WithdrawProcessingStep({ amount, symbol, chain }: WithdrawProcessingStepProps) {
  const { t } = useLanguage();
