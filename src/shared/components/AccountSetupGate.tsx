import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import { useAccountGates } from '../hooks/useAccountGates';
import { useAuth } from '../context/AuthContext';

type Mode = 'withdraw' | 'offramp' | 'bills' | 'external_send';

/**
 * Full-screen gate on arrival for pages that need KYC / setup.
 * Prefer this over waiting for an API error toast.
 */
export function AccountSetupGate({
  mode,
  onSetup,
  onBack,
}: {
  mode: Mode;
  onSetup: () => void;
  onBack?: () => void;
}) {
  const { status } = useAuth();
  const g = useAccountGates();

  if (status !== 'authenticated') {
    return (
      <GateShell
        title="Sign in required"
        body="Sign in to use this feature."
        primaryLabel="Go back"
        onPrimary={onBack}
      />
    );
  }

  if (g.loading) return null;

  if (g.isFrozen) {
    return (
      <GateShell
        title="Account frozen"
        body={g.frozenReason || 'Transfers and withdrawals are blocked. Contact support.'}
        primaryLabel="Go back"
        onPrimary={onBack}
      />
    );
  }

  if (g.isPending) {
    return (
      <GateShell
        title="Verification under review"
        body="Your identity check is still in progress. This feature unlocks after approval."
        primaryLabel="View account setup"
        onPrimary={onSetup}
        secondaryLabel={onBack ? 'Go back' : undefined}
        onSecondary={onBack}
      />
    );
  }

  if (g.needsKyc) {
    const feature =
      mode === 'offramp'
        ? 'cash-out'
        : mode === 'withdraw'
          ? 'withdrawals'
          : mode === 'bills'
            ? 'bill payments'
            : 'this feature';
    return (
      <GateShell
        title="Complete your profile"
        body={`Finish account setup and identity verification to use ${feature}.`}
        primaryLabel="Complete setup"
        onPrimary={onSetup}
        secondaryLabel={onBack ? 'Go back' : undefined}
        onSecondary={onBack}
      />
    );
  }

  return null;
}

/** True when this mode should block the page body. */
export function useShouldGateAccount(mode: Mode): boolean {
  const { status } = useAuth();
  const g = useAccountGates();
  if (status !== 'authenticated') return true;
  if (g.loading) return false;
  if (g.isFrozen) return true;
  if (mode === 'withdraw' || mode === 'offramp' || mode === 'bills' || mode === 'external_send') {
    return g.needsKyc || g.isPending;
  }
  return false;
}

function GateShell({
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'color-mix(in srgb, var(--primary) 14%, transparent)' }}
      >
        <ShieldAlert size={30} style={{ color: 'var(--primary)' }} />
      </div>
      <h2
        className="text-[18px] font-bold text-center mb-2"
        style={{ color: 'var(--foreground)' }}
      >
        {title}
      </h2>
      <p
        className="text-[13px] text-center mb-8 max-w-xs"
        style={{ color: 'var(--muted-foreground)', lineHeight: 1.5 }}
      >
        {body}
      </p>
      {onPrimary && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onPrimary}
          className="w-full max-w-xs h-12 rounded-2xl font-bold text-[14px]"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {primaryLabel}
        </motion.button>
      )}
      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          className="mt-3 text-[13px] font-semibold"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
