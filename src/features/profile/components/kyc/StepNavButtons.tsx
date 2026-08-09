import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavButtonsProps {
  onBack: () => void;
  onContinue: () => void;
  backDisabled?: boolean;
}

/** The "back arrow + Continue" button row shared by the Personal/Document/Selfie KYC steps. */
export function StepNavButtons({ onBack, onContinue, backDisabled }: StepNavButtonsProps) {
  return (
    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onBack}
        disabled={backDisabled}
        className="flex items-center justify-center gap-1.5 py-3.5 rounded-[16px]"
        style={{
          background: 'var(--muted)',
          color: backDisabled ? 'var(--muted-foreground)' : 'var(--foreground)',
          fontWeight: 700, fontSize: 15, width: 56,
          opacity: backDisabled ? 0.5 : 1,
          border: backDisabled ? 'none' : '1px solid var(--border)',
        }}
      >
        <ArrowLeft size={18} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] text-white"
        style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
      >
        Continue <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}
