import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Delete } from 'lucide-react';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';

/**
 * ⚠️ NATIVE / MOBILE ONLY — NOT IMPORTED IN THE WEB BUILD.
 *
 * This is a device-level 4-digit PIN lock, the kind you set up once on a
 * phone to gate the app itself (separate from the account password).
 * That pattern belongs to native mobile apps with a secure enclave /
 * keychain to store the PIN hash — it doesn't have a meaningful web
 * equivalent, since a browser tab has no concept of "unlock the app
 * before showing anything".
 *
 * The component is kept here, fully implemented, for whenever this
 * screen set is wrapped in a native shell (e.g. via Capacitor/Expo) or
 * ported to Claude Code's mobile app shell. Until then, `OnboardingScreen`
 * does not render or import this — on web, finishing onboarding goes
 * straight to sign up / login instead (see `OnboardingScreen.tsx`).
 *
 * If/when this gets wired back in for a native build, render it after
 * the last onboarding slide in place of navigating to signup, and call
 * `onComplete` once the PIN is confirmed.
 */

const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

interface PinSetupFlowProps {
  /** Called once the user has entered the same 4-digit PIN twice. */
  onComplete: () => void;
}

export function PinSetupFlow({ onComplete }: PinSetupFlowProps) {
  const [phase, setPhase] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handlePinKey = (key: string) => {
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      setPinError('');
      return;
    }
    if (key === '') return;
    const next = pin + key;
    if (next.length > 4) return;
    setPin(next);

    if (next.length === 4) {
      setTimeout(() => {
        if (phase === 'create') {
          setFirstPin(next);
          setPin('');
          setPhase('confirm');
        } else if (next === firstPin) {
          onComplete();
        } else {
          setPinError('PINs do not match. Try again.');
          setPin('');
        }
      }, 200);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center px-8 relative overflow-hidden" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full flex flex-col items-center gap-8 relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-refraction" style={{ background: 'var(--primary)' }}>
            <ConviaLogo size={26} color="#FFFFFF" />
          </div>
          <span className="text-white text-2xl" style={{ fontWeight: 800, letterSpacing: -0.5 }}>Convia</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
        >
          <Lock size={12} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>SECURE PIN SETUP</span>
        </motion.div>

        <div className="text-center">
          <h2 className="text-white mb-2" style={{ fontSize: 22, fontWeight: 700 }}>
            {phase === 'create' ? 'Create your PIN' : 'Confirm your PIN'}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
            {phase === 'create' ? 'Choose a 4-digit PIN to secure your account' : 'Enter your PIN again to confirm'}
          </p>
        </div>

        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: i < pin.length ? 1.2 : 1, borderColor: i < pin.length ? 'var(--primary)' : 'rgba(255,255,255,0.2)' }}
              className="w-4 h-4 rounded-full border-2"
              style={{ background: i < pin.length ? 'var(--primary)' : 'transparent' }}
            />
          ))}
        </div>

        {pinError && (
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ color: 'var(--destructive)', fontSize: 13 }}>
            {pinError}
          </motion.p>
        )}

        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
          {PIN_KEYS.map((key, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.88 }}
              onClick={() => key !== '' && handlePinKey(key)}
              className="h-16 rounded-2xl flex items-center justify-center glass-card"
              style={{
                background: key === '' ? 'transparent' : undefined,
                color: 'var(--foreground)',
                fontSize: 22,
                fontWeight: 500,
                cursor: key === '' ? 'default' : 'pointer',
                border: key === '' ? 'none' : '1px solid var(--muted)',
              }}
            >
              {key === 'del' ? <Delete size={20} style={{ color: 'var(--muted-foreground)' }} /> : key}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
