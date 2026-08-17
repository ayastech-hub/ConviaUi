import { motion } from 'motion/react';
import { CheckCircle2, Receipt } from 'lucide-react';
import type { Transaction } from '../../../../shared/data/mockData';
import { TransactionReceipt } from '../../../../shared/components/TransactionReceipt';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface WithdrawSuccessViewProps {
  amount: string;
  symbol: string;
  address: string;
  chain: string;
  receiptTx: Transaction | null;
  showReceipt: boolean;
  onShowReceipt: () => void;
  onCloseReceipt: () => void;
  onDone: () => void;
}

/** Confirmation view shown after a withdrawal is submitted. */
export function WithdrawSuccessView({
  amount, symbol, address, chain, receiptTx, showReceipt, onShowReceipt, onCloseReceipt, onDone,
}: WithdrawSuccessViewProps) {
  const { t } = useLanguage();
