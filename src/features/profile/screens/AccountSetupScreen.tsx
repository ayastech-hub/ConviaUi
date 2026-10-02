import { motion } from 'motion/react';
import { Check, ChevronRight, Lock, Landmark, ShieldCheck, User, BadgeCheck } from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { useAccountSetup, type SetupStep } from '../../../shared/hooks/useAccountSetup';
import type { Screen } from '../../../shared/data/mockData';

interface Props {
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
}

const ICONS: Record<SetupStep['id'], typeof Lock> = {
  pin: Lock,
  bank: Landmark,
  profile: User,
  kyc_basic: ShieldCheck,
  kyc_advanced: BadgeCheck,
};

/**
 * Checklist of remaining account steps. User completes a step, returns here,
 * sees it ticked, and continues until finished.
 */
export function AccountSetupScreen({ goBack, navigate }: Props) {
  const { steps, percent, doneCount, total, loading, isKycPending, allDone, refresh } =
    useAccountSetup();

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
        <button
          type="button"
          onClick={() => refresh()}
          className="text-[12px] font-semibold px-2 py-1 rounded-lg"
          style={{ color: 'var(--primary)' }}
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        <div className="flex justify-center py-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--primary) 14%, transparent)' }}
          >
            <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
          </div>
        </div>

        <p
          className="text-center text-[14px] mb-6 px-4"
          style={{ color: 'var(--muted-foreground)', lineHeight: 1.45 }}
        >
          {isKycPending
            ? 'Your verification is under review. Finish any remaining steps below while you wait.'
            : allDone
              ? 'Withdrawals, cash-out, and bills are unlocked when verification is approved.'
              : 'Finish setting up your account to unlock cash-out, withdrawals, and higher limits.'}
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
              <motion.button
                key={step.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(step.screen)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                style={{
                  borderTop: i === 0 ? undefined : '1px solid var(--border)',
                  opacity: done ? 0.75 : 1,
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
                {!done && (
                  <ChevronRight size={17} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                )}
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-[11px] mt-6 px-4" style={{ color: 'var(--muted-foreground)' }}>
          After each step, return here to see progress. Restricted pages will open this list until
          required steps are done.
        </p>
      </div>
    </div>
  );
}
