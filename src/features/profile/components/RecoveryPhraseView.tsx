import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';

const RECOVERY_WORDS = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'];

interface RecoveryPhraseViewProps {
  onBack: () => void;
}

/** "Recovery Phrase" view: warns the user, then reveals the 12-word seed phrase. */
export function RecoveryPhraseView({ onBack }: RecoveryPhraseViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Recovery Phrase" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
          <AlertTriangle size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
            Never share your recovery phrase with anyone. Convia staff will never ask for it.
          </p>
        </div>
        <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>Your 12-word recovery phrase</p>
          <div className="grid grid-cols-3 gap-2">
            {RECOVERY_WORDS.map((word, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-[10px]" style={{ background: 'var(--muted)' }}>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>{word}</span>
              </div>
            ))}
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-[16px] text-white mb-3" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
          Copy to Clipboard
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onBack} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15, border: '1px solid var(--border)' }}>
          I've Saved It
        </motion.button>
      </div>
    </div>
  );
}
