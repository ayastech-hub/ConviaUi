import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface WithdrawPinStepProps {
  pin: string[];
  onPinChange: (index: number, val: string) => void;
  error: string;
  onCancel: () => void;
}

/**
 * Transaction-confirmation PIN (distinct from the native device-lock PIN
 * covered in onboarding — this is an ordinary "confirm this transaction"
 * step, which works fine with regular text inputs on web).
 */
export function WithdrawPinStep({ pin, onPinChange, error, onCancel }: WithdrawPinStepProps) {
  const { t } = useLanguage();
