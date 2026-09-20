import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Check, ArrowLeft } from 'lucide-react';
import { PinBoxes } from './PinBoxes';
import { setTransactionPin } from '../api/security';
import { markPinConfigured, invalidatePinStatusCache } from '../security/ensureTransactionPin';
import { ApiError } from '../api/types';

/** Shared full-page PIN chrome — centered, not a bottom sheet. */
export function PinFullScreenShell({
  title,
  subtitle,
  onBack,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col"
      style={{ background: 'var(--background)' }}
    >
      <div className="px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2 flex items-center">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            aria-label="Back"
          >
            <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-sm flex flex-col items-center"
        >
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-6"
            style={{
              background: 'color-mix(in oklab, var(--primary) 14%, var(--card))',
              border: '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
            }}
          >
            <Lock size={26} style={{ color: 'var(--primary)' }} />
          </div>
          <h1
            style={{
              color: 'var(--foreground)',
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: -0.3,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 14,
                lineHeight: 1.45,
                textAlign: 'center',
                marginBottom: 28,
                maxWidth: 280,
              }}
            >
              {subtitle}
            </p>
          )}
          {children}
          {footer}
        </motion.div>
      </div>
    </div>
  );
}

interface EnterPinProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  error?: string | null;
  busy?: boolean;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}

/** Full-page enter PIN (withdraw / pay / etc). Submits only with 6 digits. */
export function EnterPinFullScreen({
  open,
  title = 'Confirm with PIN',
  subtitle = 'Enter your 6-digit transaction PIN',
  error,
  busy,
  onSubmit,
  onCancel,
}: EnterPinProps) {
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPin(Array(6).fill(''));
      setLocalError(null);
    }
  }, [open]);

  if (!open) return null;

  const joined = pin.join('');
  const complete = /^\d{6}$/.test(joined);
  const showError = localError || error;

  const trySubmit = (digits: string) => {
    if (!/^\d{6}$/.test(digits) || busy) return;
    setLocalError(null);
    onSubmit(digits);
  };

  return (
    <PinFullScreenShell title={title} subtitle={subtitle} onBack={onCancel}>
      <PinBoxes
        value={pin}
        onChange={(next) => {
          setPin(next);
          setLocalError(null);
          const j = next.join('');
          if (/^\d{6}$/.test(j)) {
            // slight delay so last digit paints before network
            setTimeout(() => trySubmit(j), 80);
          }
        }}
        error={showError || undefined}
        length={6}
      />
      <button
        type="button"
        disabled={!complete || busy}
        onClick={() => trySubmit(joined)}
        className="w-full h-12 rounded-full font-bold text-[15px] mt-8"
        style={{
          background: complete && !busy ? 'var(--primary)' : 'var(--muted)',
          color: complete && !busy ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
        }}
      >
        {busy ? 'Please wait…' : 'Continue'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onCancel}
        className="w-full h-11 rounded-full font-semibold text-[14px] mt-2"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Cancel
      </button>
    </PinFullScreenShell>
  );
}

interface SetPinProps {
  open: boolean;
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

/** Full-page create + confirm PIN (not a bottom sheet). */
export function SetPinFullScreen({ open, userId, onClose, onComplete }: SetPinProps) {
  const [phase, setPhase] = useState<'create' | 'confirm' | 'done'>('create');
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [first, setFirst] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase('create');
      setPin(Array(6).fill(''));
      setFirst('');
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const save = async (digits: string) => {
    setBusy(true);
    setError(null);
    try {
      await setTransactionPin(userId, digits);
      markPinConfigured(userId);
      invalidatePinStatusCache();
      markPinConfigured(userId);
      setPhase('done');
      setTimeout(() => onComplete(), 700);
    } catch (e) {
      if (e instanceof ApiError) {
        const msg = String(e.body?.message || e.message || 'Could not save PIN');
        const code = String(e.code || e.body?.code || '');
        if (/already set|already_set|pin_already/i.test(msg + code)) {
          markPinConfigured(userId);
          invalidatePinStatusCache();
          markPinConfigured(userId);
          setPhase('done');
          setTimeout(() => onComplete(), 500);
          return;
        }
        setError(msg);
      } else setError('Could not save PIN');
      setPhase('create');
      setFirst('');
      setPin(Array(6).fill(''));
    } finally {
      setBusy(false);
    }
  };

  const onUpdate = (next: string[]) => {
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
    void save(joined);
  };

  if (phase === 'done') {
    return (
      <PinFullScreenShell title="PIN set" subtitle="You can continue your transaction">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in oklab, var(--positive) 16%, var(--card))',
            border: '1px solid color-mix(in oklab, var(--positive) 35%, var(--border))',
          }}
        >
          <Check size={28} style={{ color: 'var(--positive)' }} />
        </div>
      </PinFullScreenShell>
    );
  }

  return (
    <PinFullScreenShell
      title={phase === 'create' ? 'Create transaction PIN' : 'Confirm your PIN'}
      subtitle={
        phase === 'create'
          ? 'Choose a 6-digit PIN to protect withdrawals and payments'
          : 'Enter the same PIN again'
      }
      onBack={onClose}
    >
      <PinBoxes key={phase} value={pin} onChange={onUpdate} error={error || undefined} length={6} />
      {busy && (
        <p className="mt-4" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
          Saving…
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={onClose}
        className="w-full h-11 rounded-full font-semibold text-[14px] mt-10"
        style={{
          background: 'var(--muted)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        }}
      >
        Cancel
      </button>
    </PinFullScreenShell>
  );
}
