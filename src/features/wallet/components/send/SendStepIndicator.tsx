import { Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export const SEND_STEPS: { key: string; label: string }[] = [
  { key: 'recipient', label: 'Recipient' },
  { key: 'amount', label: 'Amount' },
  { key: 'confirm', label: 'Confirm' },
];

/** The 3-step "Recipient → Amount → Confirm" progress row, shown during those steps only. */
export function SendStepIndicator({ activeKey }: { activeKey: string }) {
  const stepIndex = SEND_STEPS.findIndex((s) => s.key === activeKey);
  const visible = stepIndex !== -1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-1.5 px-5 mb-4">
          {SEND_STEPS.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <Fragment key={s.key}>
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ scale: active ? 1.1 : 1 }} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: done || active ? 'var(--primary)' : 'var(--muted)' }}>
                    {done ? <CheckCircle2 size={14} style={{ color: '#fff' }} /> : <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
                  </motion.div>
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: done || active ? 'var(--primary)' : 'var(--muted-foreground)' }}>{s.label}</span>
                </div>
                {i < SEND_STEPS.length - 1 && <div className="flex-1 h-0.5 rounded-full" style={{ background: done ? 'var(--primary)' : 'var(--border)' }} />}
              </Fragment>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
