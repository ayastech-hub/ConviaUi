import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

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
  return (
    <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--muted)' }}>
          <Lock size={28} style={{ color: 'var(--foreground)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Enter PIN</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 32 }}>Enter your 4-digit PIN to confirm withdrawal</p>
        <div className="flex gap-3 justify-center mb-6">
          {pin.map((d, i) => (
            <input
              key={i}
              id={`pin-${i}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => onPinChange(i, e.target.value)}
              className="w-14 h-14 rounded-2xl text-center"
              style={{ background: 'var(--card)', border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`, color: 'var(--foreground)', fontSize: 24, fontWeight: 800, outline: 'none' }}
              autoFocus={i === 0}
            />
          ))}
        </div>
        {error && <p style={{ color: 'var(--destructive)', fontSize: 13, marginBottom: 16 }}>{error}</p>}
        
        <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
}
