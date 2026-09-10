import { motion } from 'motion/react';
import { Banknote, Send } from 'lucide-react';

interface ChatInputBarProps {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onOpenPayment: () => void;
}

/** Composer with pay shortcut. */
export function ChatInputBar({ input, setInput, onSend, onOpenPayment }: ChatInputBarProps) {
  const canSend = Boolean(input.trim());
  return (
    <div className="px-4 pb-5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onOpenPayment}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          aria-label="Send payment"
        >
          <Banknote size={18} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div
          className="flex-1 flex items-center px-4 h-11 rounded-2xl"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Message"
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
          />
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={onSend}
          disabled={!canSend}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: canSend ? 'var(--primary)' : 'var(--muted)',
            boxShadow: canSend ? '0 4px 14px color-mix(in oklab, var(--primary) 40%, transparent)' : 'none',
          }}
        >
          <Send
            size={16}
            style={{ color: canSend ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
          />
        </motion.button>
      </div>
    </div>
  );
}
