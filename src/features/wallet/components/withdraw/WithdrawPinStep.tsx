import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { PageTop } from '../../../../shared/components/PageTop';
import { PinBoxes } from '../../../../shared/components/PinBoxes';

interface WithdrawPinStepProps {
  pin: string[];
  onPinChange: (index: number, val: string) => void;
  /** Prefer full-array updates for continuous typing */
  onPinUpdate?: (next: string[]) => void;
  error: string;
  onCancel: () => void;
}

/** Confirm withdrawal with 4-digit PIN — continuous typing supported. */
export function WithdrawPinStep({ pin, onPinChange, onPinUpdate, error, onCancel }: WithdrawPinStepProps) {
  const handleUpdate = (next: string[]) => {
    if (onPinUpdate) {
      onPinUpdate(next);
      return;
    }
    next.forEach((d, i) => {
      if (d !== (pin[i] || '')) onPinChange(i, d);
    });
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Lock size={22} style={{ color: 'var(--foreground)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>
          Confirm withdrawal
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 28 }}>
          Enter your 4-digit PIN
        </p>
        <PinBoxes value={pin} onChange={handleUpdate} error={error} />
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onCancel}
          className="w-full max-w-sm mt-8 py-3.5 rounded-full"
          style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
}
