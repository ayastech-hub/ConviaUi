import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Lock, Landmark, ShieldCheck } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { SetPinFullScreen } from '../../../shared/components/PinFullScreen';
import { useAccountSetup, type SetupStepId } from '../../../shared/hooks/useAccountSetup';
import { useAuth } from '../../../shared/context/AuthContext';
import type { Screen } from '../../../shared/data/mockData';

interface Props {
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
}

const ICONS: Record<SetupStepId, typeof Lock> = {
  pin: Lock,
  bank: Landmark,
  kyc: ShieldCheck,
};

/**
 * Guided setup: list with ticks + bottom Next.
 * PIN opens set flow here. Next routes to the next incomplete step.
 */
export function AccountSetupScreen({ goBack, navigate }: Props) {
  const { userId } = useAuth();
  const {
    steps,
    percent,
    doneCount,
    total,
    loading,
    isKycPending,
    allDone,
    nextIncomplete,
    refresh,
  } = useAccountSetup();
  const [showSetPin, setShowSetPin] = useState(false);

  const runNext = () => {
    if (allDone || !nextIncomplete) {
      goBack();
      return;
    }
    if (nextIncomplete.id === 'pin') {
      setShowSetPin(true);
      return;
    }
    if (nextIncomplete.id === 'bank') {
      navigate('payment-methods');
      return;
    }
    if (nextIncomplete.id === 'kyc') {
      navigate('kyc');
    }
  };

  const nextLabel = (() => {
    if (allDone || !nextIncomplete) return 'Done';
    if (nextIncomplete.id === 'pin') return 'Set PIN';
    if (nextIncomplete.id === 'bank') return 'Add bank account';
    if (nextIncomplete.pending) return 'View verification status';
    return 'Verify identity';
  })();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 pb-2">
        <BackButton onClick={goBack} />
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-bold truncate" style={{ color: 'var(--foreground)' }}>
            Account setup
          </h1>
          <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
            {loading
              ? 'Loading…'
              : allDone
                ? 'You are all set'
                : `${doneCount} of ${total} complete · ${percent}%`}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex justify-center py-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--primary) 14%, transparent)' }}
          >
            <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
          </div>
        </div>

        <p
          className="text-center text-[13px] mb-5 px-2"
          style={{ color: 'var(--muted-foreground)', lineHeight: 1.45 }}
        >
          {isKycPending
            ? 'Verification is under review. Finish any remaining steps below while you wait.'
            : allDone
              ? 'Withdrawals and cash-out unlock when verification is approved.'
              : 'Use Next to complete each step. Finished steps show a tick.'}
        </p>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--card, var(--background))' }}
        >
          {steps.map((step, i) => {
            const Icon = ICONS[step.id];
            const done = step.done;
            const pending = step.pending && !done;
            return (
              <div
                key={step.id}
                className="w-full flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderTop: i === 0 ? undefined : '1px solid var(--border)',
                  opacity: done ? 0.8 : 1,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: done
                      ? 'color-mix(in srgb, #22c55e 18%, transparent)'
                      : pending
                        ? 'color-mix(in srgb, var(--primary) 14%, transparent)'
                        : 'var(--muted)',
                  }}
                >
                  {done ? (
                    <Check size={18} style={{ color: '#22c55e' }} strokeWidth={2.5} />
                  ) : (
                    <Icon
                      size={17}
                      style={{ color: pending ? 'var(--primary)' : 'var(--muted-foreground)' }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-semibold"
                    style={{
                      color: 'var(--foreground)',
                      textDecoration: done ? 'line-through' : undefined,
                    }}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {step.description}
                  </p>
                </div>
                {done && (
                  <span className="text-[11px] font-semibold" style={{ color: '#22c55e' }}>
                    Done
                  </span>
                )}
                {pending && (
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--primary)' }}>
                    Review
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="px-5 pt-3 shrink-0"
        style={{
          borderTop: '1px solid var(--border)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={runNext}
          className="w-full h-12 rounded-2xl font-bold text-[15px]"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #0a0a0a)',
          }}
        >
          {nextLabel}
        </motion.button>
      </div>

      {userId && (
        <SetPinFullScreen
          open={showSetPin}
          userId={userId}
          onClose={() => {
            setShowSetPin(false);
            refresh();
          }}
          onComplete={() => {
            setShowSetPin(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
