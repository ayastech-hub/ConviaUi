import { motion } from 'motion/react';
import { ChevronLeft, ArrowUpRight, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  goBack: () => void;
  onSendPayment: () => void;
}

/** Contact header at the top of the direct-message chat screen. */
export function ChatHeader({ goBack, onSendPayment }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
        <ChevronLeft size={18} style={{ color: 'var(--foreground)' }} />
      </motion.button>
      <div className="relative">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)', color: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}>KA</div>
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: 'var(--foreground)', border: '2px solid var(--background)' }} />
      </div>
      <div className="flex-1">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Kwame Asante</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@kwame_builds · Online</p>
      </div>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onSendPayment} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
        <ArrowUpRight size={16} style={{ color: 'var(--foreground)' }} />
      </motion.button>
      <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
        <MoreVertical size={16} style={{ color: 'var(--muted-foreground)' }} />
      </motion.button>
    </div>
  );
}
