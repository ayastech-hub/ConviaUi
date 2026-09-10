import { motion } from 'motion/react';
import { Banknote } from 'lucide-react';
import { BackButton } from '../../../../shared/components/BackButton';

interface ChatHeaderProps {
  goBack: () => void;
  onSendPayment: () => void;
}

/** Contact header for DM chat. */
export function ChatHeader({ goBack, onSendPayment }: ChatHeaderProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 pb-3.5 pt-1"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <BackButton onClick={goBack} />
      <div className="relative flex-shrink-0">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, color-mix(in oklab, var(--primary) 40%, #1a1a22), #0e1211)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 750,
            letterSpacing: '-0.02em',
          }}
        >
          KA
        </div>
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
          style={{ background: 'var(--positive)', border: '2px solid var(--background)' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 15, letterSpacing: '-0.02em' }}>
          Kwame Asante
        </p>
        <p style={{ color: 'var(--positive)', fontSize: 12, fontWeight: 600, marginTop: 1 }}>Online</p>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={onSendPayment}
        className="h-10 px-3.5 rounded-full flex items-center gap-1.5"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        <Banknote size={14} />
        Pay
      </motion.button>
    </div>
  );
}
