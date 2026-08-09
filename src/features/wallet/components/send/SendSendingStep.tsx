import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { ChatContact } from '../../../../shared/data/mockData';

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
  return (
    <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center text-center py-16">
      <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
        <motion.div className="absolute inset-0 rounded-full" style={{ border: '2px solid var(--border)' }} animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: 'var(--foreground)' }} />
        </motion.div>
        <motion.div className="absolute rounded-full" style={{ inset: 16, border: '2px dashed var(--border)' }} animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--positive)' }} />
        </motion.div>
        <motion.div className="absolute rounded-full flex items-center justify-center" style={{ inset: 40, background: 'var(--primary)' }} animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <ArrowUpRight size={28} style={{ color: '#fff' }} />
        </motion.div>
      </div>

      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Sending…</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 8 }}>{format(Number(amount))} to {selectedContact?.name ?? recipient}</p>

      <div className="flex items-center gap-2 mt-4">
        {STAGE_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <motion.div
              className="w-2.5 h-2.5 rounded-full"
              animate={{ background: sendingStage >= i ? 'var(--positive)' : 'var(--muted)', scale: sendingStage === i ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.6, repeat: sendingStage === i ? Infinity : 0 }}
            />
            <span style={{ fontSize: 10, fontWeight: sendingStage >= i ? 700 : 400, color: sendingStage >= i ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{label}</span>
            {i < 3 && <div className="w-4 h-px" style={{ background: 'var(--border)' }} />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
