import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  CircleCheck,
} from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import {
  FeatureAlert,
  mapApiCodeToReason,
} from '../../../shared/components/FeatureAlert';
import { useLanguage } from '../../../shared/context/LanguageContext';
import {
  markPinConfigured,
  invalidatePinStatusCache,
} from '../../../shared/security/ensureTransactionPin';

interface ChangePinFlowProps {
  onBack: () => void;
}

type Step = 'current' | 'new' | 'confirm' | 'done';

export function ChangePinFlow({ onBack }: ChangePinFlowProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();

  const [step, setStep] = useState<Step>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<{
    code?: string;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      if (!userId) {
        if (active) {
          setHasPin(false);
          setStep('new');
          setCheckingStatus(false);
        }
        return;
      }

      setCheckingStatus(true);

      try {
        const status = await securityApi.getTransactionPinStatus(userId);

        if (!active) return;

        const configured = Boolean(
          status.hasPin ?? (status as { set?: boolean }).set,
        );

        setHasPin(configured);
        setStep(configured ? 'current' : 'new');
      } catch {
        if (!active) return;

        setHasPin(false);
        setStep('new');
      } finally {
        if (active) setCheckingStatus(false);
      }
    };

    void checkStatus();

    return () => {
      active = false;
    };
  }, [userId]);

  const clearError = () => {
    if (error) setError(null);
  };

  const goToNewPin = () => {
    clearError();

    if (!/^\d{6}$/.test(currentPin)) {
      setError({ message: 'Enter your 6-digit current PIN' });
      return;
    }

    setStep('new');
  };

  const goToConfirm = () => {
    clearError();

    if (!/^\d{6}$/.test(newPin)) {
      setError({ message: 'New PIN must be exactly 6 digits' });
      return;
    }

    if (newPin === currentPin && hasPin) {
      setError({ message: 'New PIN must be different from your current PIN' });
      return;
    }

    setStep('confirm');
  };

  const submit = async () => {
    if (!userId) {
      setError({ message: 'Sign in required' });
      return;
    }

    clearError();

    if (!/^\d{6}$/.test(newPin)) {
      setError({ message: 'PIN must be exactly 6 digits' });
      setStep('new');
      return;
    }

    if (newPin !== confirmPin) {
      setError({ message: 'PINs do not match' });
      return;
    }

    if (hasPin && !/^\d{6}$/.test(currentPin)) {
      setError({ message: 'Enter your current 6-digit PIN' });
      setStep('current');
      return;
    }

    setLoading(true);

    try {
      if (hasPin) {
        await securityApi.changeTransactionPin(userId, {
          currentPin,
          newPin,
        });
      } else {
        await securityApi.setTransactionPin(userId, newPin);
      }

      markPinConfigured(userId);
      invalidatePinStatusCache(userId);

      setStep('done');
    } catch (err) {
      if (err instanceof ApiError) {
        setError({
          code: err.code,
          message: err.body?.message || err.message,
        });
      } else {
        setError({ message: 'Could not update PIN' });
      }
    } finally {
      setLoading(false);
    }
  };

  const PinInput = ({
    value,
    onChange,
    label,
    autoFocus = false,
    autoComplete,
  }: {
    value: string;
    onChange: (value: string) => void;
    label: string;
    autoFocus?: boolean;
    autoComplete?: 'current-password' | 'new-password';
  }) => (
    <div>
      <label
        className="block mb-2"
        style={{
          color: 'var(--foreground)',
          fontSize: 13,
          fontWeight: 650,
        }}
      >
        {label}
      </label>

      <div
        className="relative rounded-[18px] overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          className="w-full h-[58px] bg-transparent outline-none text-center"
          style={{
            color: 'var(--foreground)',
            fontSize: 24,
            letterSpacing: 10,
            fontWeight: 750,
            paddingLeft: 10,
          }}
          aria-label={label}
        />
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <span
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11.5,
          }}
        >
          6 digits required
        </span>

        <span
          style={{
            color:
              value.length === 6
                ? 'var(--positive)'
                : 'var(--muted-foreground)',
            fontSize: 11.5,
            fontWeight: 650,
          }}
        >
          {value.length}/6
        </span>
      </div>
    </div>
  );

  const StepIndicator = () => {
    const items = hasPin
      ? [
          { id: 'current', label: 'Current' },
          { id: 'new', label: 'New' },
          { id: 'confirm', label: 'Confirm' },
        ]
      : [
          { id: 'new', label: 'New' },
          { id: 'confirm', label: 'Confirm' },
        ];

    const currentIndex = items.findIndex((item) => item.id === step);

    return (
      <div className="flex items-center mb-6">
        {items.map((item, index) => {
          const completed =
            step === 'done' ||
            (currentIndex >= 0 && index < currentIndex);
          const active = item.id === step;

          return (
            <div key={item.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      active || completed
                        ? 'color-mix(in oklab, var(--primary) 16%, var(--card))'
                        : 'var(--muted)',
                    border: `1px solid ${
                      active || completed
                        ? 'color-mix(in oklab, var(--primary) 40%, var(--border))'
                        : 'var(--border)'
                    }`,
                  }}
                >
                  {completed ? (
                    <CheckCircle2
                      size={15}
                      style={{ color: 'var(--primary)' }}
                    />
                  ) : (
                    <span
                      style={{
                        color: active
                          ? 'var(--primary)'
                          : 'var(--muted-foreground)',
                        fontSize: 11,
                        fontWeight: 750,
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                <span
                  className="hidden min-[380px]:block"
                  style={{
                    color: active
                      ? 'var(--foreground)'
                      : 'var(--muted-foreground)',
                    fontSize: 11.5,
                    fontWeight: active ? 700 : 550,
                  }}
                >
                  {item.label}
                </span>
              </div>

              {index < items.length - 1 && (
                <div
                  className="h-px flex-1 mx-2"
                  style={{
                    background:
                      index < currentIndex
                        ? 'color-mix(in oklab, var(--primary) 45%, var(--border))'
                        : 'var(--border)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (checkingStatus) {
    return (
      <div
        className="flex flex-col h-full"
        style={{ background: 'var(--background)' }}
      >
        <ScreenHeader title={t('security.pin')} onBack={onBack} />

        <div className="flex-1 px-5 pt-5">
          <div
            className="rounded-[24px] p-5"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <Loader2
                  size={18}
                  className="animate-spin"
                  style={{ color: 'var(--primary)' }}
                />
              </div>

              <div>
                <p
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Checking PIN status
                </p>
                <p
                  className="mt-1"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 12,
                  }}
                >
                  Securing your transaction settings…
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--background)' }}
    >
      <ScreenHeader title={t('security.pin')} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {error && (
          <div className="mb-4">
            <FeatureAlert
              reason={mapApiCodeToReason(error.code)}
              message={error.message}
              detail={error.code}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'done' ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-7"
            >
              <div
                className="rounded-[26px] p-6 text-center"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="mx-auto w-[76px] h-[76px] rounded-full flex items-center justify-center mb-5"
                  style={{
                    background:
                      'color-mix(in oklab, var(--primary) 12%, var(--card))',
                    border:
                      '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
                  }}
                >
                  <CheckCircle2
                    size={40}
                    strokeWidth={1.8}
                    style={{ color: 'var(--primary)' }}
                  />
                </div>

                <h2
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 20,
                    fontWeight: 750,
                  }}
                >
                  PIN updated
                </h2>

                <p
                  className="mt-2 max-w-[280px] mx-auto"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  Your 6-digit transaction PIN is now active for sensitive
                  account actions.
                </p>

                <div
                  className="mt-5 rounded-[17px] px-4 py-3 flex items-center gap-3 text-left"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <CircleCheck
                    size={17}
                    style={{ color: 'var(--positive)' }}
                  />
                  <span
                    style={{
                      color: 'var(--foreground)',
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    Transaction protection is enabled
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.985 }}
                onClick={onBack}
                className="w-full h-12 rounded-[17px] mt-4"
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Done
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              <div
                className="rounded-[24px] p-5 mb-5"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        'color-mix(in oklab, var(--primary) 12%, var(--card))',
                      border:
                        '1px solid color-mix(in oklab, var(--primary) 22%, var(--border))',
                    }}
                  >
                    <ShieldCheck
                      size={20}
                      style={{ color: 'var(--primary)' }}
                    />
                  </div>

                  <div>
                    <p
                      style={{
                        color: 'var(--foreground)',
                        fontSize: 15,
                        fontWeight: 750,
                      }}
                    >
                      Transaction PIN
                    </p>
                    <p
                      className="mt-1"
                      style={{
                        color: 'var(--muted-foreground)',
                        fontSize: 12.5,
                        lineHeight: 1.45,
                      }}
                    >
                      A 6-digit PIN protects sensitive actions and recovery
                      operations.
                    </p>
                  </div>
                </div>
              </div>

              <StepIndicator />

              <div
                className="rounded-[24px] p-5"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {step === 'current' && (
                  <>
                    <div className="flex items-center gap-2 mb-5">
                      <LockKeyhole
                        size={17}
                        style={{ color: 'var(--primary)' }}
                      />
                      <p
                        style={{
                          color: 'var(--foreground)',
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        Verify current PIN
                      </p>
                    </div>

                    <PinInput
                      value={currentPin}
                      onChange={(value) => {
                        setCurrentPin(value);
                        clearError();
                      }}
                      label="Current PIN"
                      autoFocus
                      autoComplete="current-password"
                    />

                    <motion.button
                      whileTap={{ scale: 0.985 }}
                      onClick={goToNewPin}
                      disabled={currentPin.length !== 6}
                      className="w-full h-12 rounded-[17px] mt-5 flex items-center justify-center gap-2"
                      style={{
                        background:
                          currentPin.length === 6
                            ? 'var(--primary)'
                            : 'var(--muted)',
                        color:
                          currentPin.length === 6
                            ? '#fff'
                            : 'var(--muted-foreground)',
                        fontWeight: 700,
                        border:
                          currentPin.length === 6
                            ? 'none'
                            : '1px solid var(--border)',
                      }}
                    >
                      Continue
                      <ArrowRight size={17} />
                    </motion.button>
                  </>
                )}

                {step === 'new' && (
                  <>
                    <div className="flex items-center gap-2 mb-5">
                      <LockKeyhole
                        size={17}
                        style={{ color: 'var(--primary)' }}
                      />
                      <p
                        style={{
                          color: 'var(--foreground)',
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        Create new PIN
                      </p>
                    </div>

                    <PinInput
                      value={newPin}
                      onChange={(value) => {
                        setNewPin(value);
                        clearError();
                      }}
                      label="New 6-digit PIN"
                      autoFocus
                      autoComplete="new-password"
                    />

                    <motion.button
                      whileTap={{ scale: 0.985 }}
                      onClick={goToConfirm}
                      disabled={newPin.length !== 6}
                      className="w-full h-12 rounded-[17px] mt-5 flex items-center justify-center gap-2"
                      style={{
                        background:
                          newPin.length === 6
                            ? 'var(--primary)'
                            : 'var(--muted)',
                        color:
                          newPin.length === 6
                            ? '#fff'
                            : 'var(--muted-foreground)',
                        fontWeight: 700,
                        border:
                          newPin.length === 6
                            ? 'none'
                            : '1px solid var(--border)',
                      }}
                    >
                      Continue
                      <ArrowRight size={17} />
                    </motion.button>
                  </>
                )}

                {step === 'confirm' && (
                  <>
                    <div className="flex items-center gap-2 mb-5">
                      <CheckCircle2
                        size={17}
                        style={{ color: 'var(--primary)' }}
                      />
                      <p
                        style={{
                          color: 'var(--foreground)',
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        Confirm your PIN
                      </p>
                    </div>

                    <PinInput
                      value={confirmPin}
                      onChange={(value) => {
                        setConfirmPin(value);
                        clearError();
                      }}
                      label="Confirm new PIN"
                      autoFocus
                      autoComplete="new-password"
                    />

                    <motion.button
                      whileTap={{ scale: 0.985 }}
                      disabled={loading || confirmPin.length !== 6}
                      onClick={() => void submit()}
                      className="w-full h-12 rounded-[17px] mt-5 flex items-center justify-center gap-2"
                      style={{
                        background:
                          confirmPin.length === 6 && !loading
                            ? 'var(--primary)'
                            : 'var(--muted)',
                        color:
                          confirmPin.length === 6 && !loading
                            ? '#fff'
                            : 'var(--muted-foreground)',
                        fontWeight: 700,
                        border:
                          confirmPin.length === 6 && !loading
                            ? 'none'
                            : '1px solid var(--border)',
                      }}
                    >
                      {loading && (
                        <Loader2 size={17} className="animate-spin" />
                      )}
                      {loading ? 'Updating PIN…' : 'Update PIN'}
                    </motion.button>
                  </>
                )}
              </div>

              <div
                className="mt-4 px-4 py-3.5 rounded-[18px] flex items-start gap-3"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <ShieldCheck
                  size={16}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: 'var(--muted-foreground)' }}
                />
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 11.5,
                    lineHeight: 1.5,
                  }}
                >
                  Never share your transaction PIN. Convia will never ask you
                  to disclose it through chat, email, or support.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}