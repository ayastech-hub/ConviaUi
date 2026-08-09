import { motion } from 'motion/react';
import { ArrowUpRight, Send } from 'lucide-react';

interface ChatInputBarProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onOpenPayment: () => void;
}

/** Message input bar with a quick-payment shortcut button. */
export function ChatInputBar({ input, setInput, onSend, onOpenPayment }: ChatInputBarProps) {
  return (
    <div className="px-4 pb-4 pt-2 glass-nav" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenPayment} className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
          <ArrowUpRight size={18} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex-1 flex items-center px-4 py-2.5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
          />
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onSend} className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: input.trim() ? 'var(--primary)' : 'var(--muted)' }}>
          <Send size={16} style={{ color: input.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }} />
        </motion.button>
      </div>
    </div>
  );
}
