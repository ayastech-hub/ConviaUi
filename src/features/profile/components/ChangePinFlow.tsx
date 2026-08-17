import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface ChangePinFlowProps {
  onBack: () => void;
}

/** Set or change transaction PIN via POST/PUT /security/:userId/transaction-pin. */
export function ChangePinFlow({ onBack }: ChangePinFlowProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const [step, setStep] = useState<'current' | 'new' | 'confirm' | 'done'>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userId) return;
    securityApi
      .getTransactionPinStatus(userId)
      .then((s) => {
        const hp = Boolean(s.hasPin ?? (s as { set?: boolean }).set);
        setHasPin(hp);
        if (!hp) setStep('new');
      })
      .catch(() => {
        setHasPin(false);
        setStep('new');
      });
  }, [userId]);

  const submit = async () => {
    if (!userId) {
      setError({ message: 'Sign in required' });
      return;
    }
    if (newPin !== confirmPin) {
      setError({ message: 'PINs do not match' });
      return;
    }
    if (!/^\d{6}$/.test(newPin)) {
      setError({ message: 'PIN must be 6 digits' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (hasPin) {
        await securityApi.changeTransactionPin(userId, { currentPin, newPin });
      } else {
        await securityApi.setTransactionPin(userId, newPin);
      }
      setStep('done');
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.body.message || err.message });
      else setError({ message: 'Could not update PIN' });
    } finally {
      setLoading(false);
    }
  };

  const PinInput = ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
  }) => (
    <div className="mb-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 8 }}>{label}</p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="w-full rounded-[14px] px-4 py-3.5 text-center"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          fontSize: 22,
          letterSpacing: 8,
          fontWeight: 700,
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title={t('security.pin')} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />}
        <AnimatePresence mode="wait">
          {step === 'done' ? (
            <motion.div
              key="done"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 mt-10"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <CheckCircle2 size={44} style={{ color: 'var(--positive)' }} />
              </div>
              <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>PIN updated</h3>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onBack}
                className="w-full py-3.5 rounded-[16px] text-white"
                style={{ background: 'var(--primary)', fontWeight: 700 }}
              >
                Done
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16, lineHeight: 1.45 }}>
                Required to reveal recovery phrase and for sensitive actions. Backend expects a 6-digit PIN.
              </p>
              {hasPin !== false && step === 'current' && (
                <>
                  <PinInput value={currentPin} onChange={setCurrentPin} label="Current PIN" />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep('new')}
                    disabled={currentPin.length < 4}
                    className="w-full py-3.5 rounded-[16px] text-white"
                    style={{ background: 'var(--primary)', fontWeight: 700 }}
                  >
                    Continue
                  </motion.button>
                </>
              )}
              {(step === 'new' || (!hasPin && step === 'current')) && (
                <>
                  <PinInput value={newPin} onChange={setNewPin} label="New 6-digit PIN" />
                  <PinInput value={confirmPin} onChange={setConfirmPin} label="Confirm new PIN" />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    onClick={() => void submit()}
                    className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
                    style={{ background: 'var(--primary)', fontWeight: 700 }}
                  >
                    {loading ? <Loader size={18} className="animate-spin" /> : null}
                    Save PIN
                  </motion.button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
