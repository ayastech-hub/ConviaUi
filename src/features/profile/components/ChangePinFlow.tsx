import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, CheckCircle2, X } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';

const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

interface ChangePinFlowProps {
  onBack: () => void;
  /** Called once the 4th digit is entered and the success state has finished displaying. */
  onComplete: () => void;
}

/** "Change PIN" flow: 4-digit keypad entry followed by a brief success state. */
export function ChangePinFlow({ onBack, onComplete }: ChangePinFlowProps) {
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'enter' | 'success'>('enter');

  const handlePinKey = (key: string) => {
    if (key === 'del') {
      const idx = pinDigits.findIndex((d) => d === '');
      const target = idx === -1 ? 3 : idx - 1;
      if (target >= 0) {
        const next = [...pinDigits];
        next[target] = '';
        setPinDigits(next);
      }
      return;
    }
    if (key === '') return;
    const idx = pinDigits.findIndex((d) => d === '');
    if (idx === -1) return;
    const next = [...pinDigits];
    next[idx] = key;
    setPinDigits(next);
    if (idx === 3) {
      setTimeout(() => setPinStep('success'), 200);
      setTimeout(() => {
        setPinStep('enter');
        setPinDigits(['', '', '', '']);
        onComplete();
      }, 1800);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Change PIN" onBack={onBack} marginBottom={32} />

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {pinStep === 'enter' ? (
            <motion.div key="enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center gap-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Lock size={28} style={{ color: 'var(--foreground)' }} />
              </div>
              <div className="text-center">
                <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginBottom: 4 }}>Enter New PIN</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Choose a 4-digit PIN</p>
              </div>
              <div className="flex gap-4">
                {pinDigits.map((d, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border-2" style={{
                    background: d ? 'var(--primary)' : 'transparent',
                    borderColor: d ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                  }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
                {PIN_KEYS.map((key, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => key !== '' && handlePinKey(key)}
                    className="h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--card)', color: 'var(--foreground)', fontSize: 22, fontWeight: 500, cursor: key === '' ? 'default' : 'pointer', border: '1px solid var(--border)' }}
                  >
                    {key === 'del' ? <X size={18} style={{ color: 'var(--muted-foreground)' }} /> : key}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <CheckCircle2 size={44} style={{ color: 'var(--foreground)' }} />
              </div>
              <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>PIN Changed!</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
