import { motion } from 'motion/react';
import { ArrowUpRight, Loader, CheckCircle2, Clock } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { BankAccount } from '../../../../shared/context/PaymentMethodsContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface OffRampReviewStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  selectedAsset: Asset;
  youGet: number;
  selectedAccount?: BankAccount;
  fee: number;
  onConfirm: () => void;
}

/** Off-Ramp step 2: review the conversion and payout account before confirming. */
export function OffRampReviewStep({ currency, format, amount, selectedAsset, youGet, selectedAccount, fee, onConfirm }: OffRampReviewStepProps) {
  const { t } = useLanguage();
