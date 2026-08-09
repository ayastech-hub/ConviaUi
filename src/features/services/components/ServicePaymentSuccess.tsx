import { motion } from 'motion/react';
import { Check, Receipt } from 'lucide-react';

export interface ServiceSuccessInfo {
  label: string;
  amount: number;
  provider: string;
}

interface ServicePaymentSuccessProps {
  info: ServiceSuccessInfo;
  onNewPayment: () => void;
  onViewReceipt: () => void;
  onBackToHome: () => void;
}

/** Confirmation screen shown after a bill/service payment completes. */
export function ServicePaymentSuccess({ info, onNewPayment, onViewReceipt, onBackToHome }: ServicePaymentSuccessProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 flex flex-col items-center justify-center" style={{ minHeight: '65%' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'var(--muted)', border: '2px solid var(--positive)' }}
      >
        <Check size={40} style={{ color: 'var(--positive)' }} strokeWidth={3} />
      </motion.div>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Payment Successful</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
        {info.label} payment of ${info.amount} to {info.provider} completed
      </p>
      <div className="w-full rounded-[16px] p-4 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between py-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Service</span>
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{info.label}</span>
        </div>
        <div className="flex justify-between py-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Provider</span>
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{info.provider}</span>
        </div>
        <div className="flex justify-between py-2" style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>
          <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Amount Paid</span>
          <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 800 }}>${info.amount}</span>
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onNewPayment} className="w-full py-3.5 rounded-[16px] text-white mb-3" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        New Payment
      </motion.button>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onViewReceipt} className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
        <Receipt size={18} style={{ color: 'var(--foreground)' }} />
        View Receipt
      </motion.button>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onBackToHome} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
        Back to Home
      </motion.button>
    </motion.div>
  );
}
