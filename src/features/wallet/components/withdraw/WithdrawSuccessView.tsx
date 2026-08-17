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
  return (
    <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
        <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <CheckCircle2 size={52} style={{ color: 'var(--positive)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8, fontSize: 22 }}>{t('withdraw.submitted')}</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 4 }}>{amount} {symbol} sent to</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'monospace', marginBottom: 4 }}>{address.slice(0, 16)}...{address.slice(-8)}</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 32 }}>Network: {chain} · Estimated arrival: 5-30 min</p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onShowReceipt}
          className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 mb-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}
        >
          <Receipt size={18} style={{ color: 'var(--foreground)' }} />
          View Receipt
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onDone} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
          Done
        </motion.button>
      </motion.div>
      <TransactionReceipt tx={receiptTx} open={showReceipt} onClose={onCloseReceipt} />
    </div>
  );
}
