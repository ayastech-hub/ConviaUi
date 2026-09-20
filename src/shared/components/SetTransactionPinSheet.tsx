import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Check } from 'lucide-react';
import { setTransactionPin } from '../api/security';
import { markPinConfigured, invalidatePinStatusCache } from '../security/ensureTransactionPin';
import { ApiError } from '../api/types';
import { PinBoxes } from './PinBoxes';

type Phase = 'create' | 'confirm' | 'done';

interface Props {
  open: boolean;
  userId: string;
  onClose: () => void;
  /** Called after PIN is saved successfully */
  onComplete: () => void;
  title?: string;
}

/**
 * Bottom sheet: create + confirm 6-digit transaction PIN in place
 * (no trip to Settings). Used when a money-out action needs a PIN
 * that has not been set yet.
 */
export function SetTransactionPinSheet({
  open,
  userId,
  onClose,
  onComplete,
  title = 'Set transaction PIN',
}: Props) {
  const [phase, setPhase] = useState<Phase>('create');
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [first, setFirst] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setPhase('create');
    setPin(Array(6).fill(''));
    setFirst('');
    setError(null);
    setBusy(false);
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const onUpdate = async (next: string[]) => {
    setPin(next);
    setError(null);
    const joined = next.join('');
    if (joined.length < 6) return;

    if (phase === 'create') {
      setFirst(joined);
      setPin(Array(6).fill(''));
      setPhase('confirm');
      return;
    }

    if (joined !== first) {
      setError('PINs do not match. Try again.');
      setPin(Array(6).fill(''));
      setPhase('create');
      setFirst('');
      return;
    }

    setBusy(true);
    try {
      await setTransactionPin(userId, joined);
      markPinConfigured(userId);
      invalidatePinStatusCache();
      markPinConfigured(userId);
      setPhase('done');
      setTimeout(() => {
        reset();
        onComplete();
      }, 600);
    } catch (e) {
      if (e instanceof ApiError) {
        const msg = String(e.body?.message || e.message || 'Could not save PIN');
        const code = String(e.code || e.body?.code || '');
        // Status cache was wrong — PIN already exists; treat as configured
        if (/already set|already_set|pin_already/i.test(msg + code)) {
          markPinConfigured(userId);
          invalidatePinStatusCache();
          markPinConfigured(userId);
          setPhase('done');
          setTimeout(() => {
            reset();
            onComplete();
          }, 400);
          return;
        }
        setError(msg);
      } else {
        setError('Could not save PIN');
      }
      setPin(Array(6).fill(''));
      setPhase('create');
      setFirst('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: 56 }}
            animate={{ y: 0 }}
            exit={{ y: 56 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[81] mx-auto max-w-md rounded-t-[24px] px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />

            {phase === 'done' ? (
              <div className="flex flex-col items-center py-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background: 'color-mix(in oklab, var(--positive) 16%, var(--card))',
                    border: '1px solid color-mix(in oklab, var(--positive) 35%, var(--border))',
                  }}
                >
                  <Check size={26} style={{ color: 'var(--positive)' }} />
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>PIN set</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
                  You can continue your transaction
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    <Lock size={22} style={{ color: 'var(--foreground)' }} />
                  </div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>{title}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
                    {phase === 'create'
                      ? 'Choose a 6-digit PIN to protect withdrawals and payments'
                      : 'Enter the same PIN again to confirm'}
                  </p>
                </div>

                <PinBoxes key={phase} value={pin} onChange={(n) => void onUpdate(n)} error={error || undefined} length={6} />

                {busy && (
                  <p className="text-center mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    Saving…
                  </p>
                )}

                <button
                  type="button"
                  disabled={busy}
                  onClick={handleClose}
                  className="w-full h-11 rounded-full font-semibold text-[14px] mt-5"
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
