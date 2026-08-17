import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { ChatContact } from '../../../../shared/data/mockData';
import { useLanguage } from '../../../../shared/context/LanguageContext';

const STAGE_LABELS = ['Submitted', 'Queued', 'Confirming', 'Finalized'];

interface SendSendingStepProps {
  format: (n: number) => string;
  amount: string;
  selectedContact: ChatContact | null;
  recipient: string;
  sendingStage: number;
}

/** Send step 4: animated blockchain visualization while the transaction "settles". */
export function SendSendingStep({ format, amount, selectedContact, recipient, sendingStage }: SendSendingStepProps) {
  const { t } = useLanguage();
