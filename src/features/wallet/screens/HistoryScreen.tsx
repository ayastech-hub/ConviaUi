import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import type { Transaction } from '../../../shared/data/mockData';
import { WalletHistoryList } from '../components/WalletHistoryList';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { PageTop } from '../../../shared/components/PageTop';

interface Props {
  goBack: () => void;
}

/** Full transaction history — ledger, swaps, deposits, withdrawals. */
export function HistoryScreen({ goBack }: Props) {
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          aria-label="Back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>
            History
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
            All activity on your account
          </p>
        </div>
      </div>

      <WalletHistoryList onSelectTransaction={setReceiptTx} />

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />
      <div style={{ height: 40 }} />
    </div>
  );
}
