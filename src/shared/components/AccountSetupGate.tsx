import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';
import { useAccountGates } from '../hooks/useAccountGates';
import { useAuth } from '../context/AuthContext';

type Mode = 'withdraw' | 'offramp' | 'bills' | 'external_send';

/**
 * Blocks restricted money flows until account requirements are met.
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
        body="Please sign in to continue."
        primaryLabel="Go back"
        onPrimary={onBack}
      />
    );
  }

  if (g.loading) return null;

  if (g.isFrozen) {
    return (
      <GateShell
        title="Account restricted"
        body={
          g.frozenReason ||
          'Transfers and withdrawals are currently unavailable on this account. Contact support for assistance.'
        }
        primaryLabel="Go back"
        onPrimary={onBack}
      />
    );
  }

  if (g.isPending) {
    return (
      <GateShell
        title="Verification under review"
        body="Your identity verification is still in progress. This service will be available after approval."
        primaryLabel="View account status"
        onPrimary={onSetup}
        secondaryLabel={onBack ? 'Go back' : undefined}
        onSecondary={onBack}
      />
    );
  }

  if (g.needsKyc) {
    const service =
      mode === 'offramp'
        ? 'cash-out'
        : mode === 'withdraw'
          ? 'withdrawals'
          : mode === 'bills'
            ? 'bill payments'
            : 'this service';
    return (
      <GateShell
        title="Verification required"
        body={`Identity verification is required before you can use ${service}.`}
        primaryLabel="Complete account setup"
        onPrimary={onSetup}
        secondaryLabel={onBack ? 'Go back' : undefined}
        onSecondary={onBack}
      />
    );
  }

  return null;
}

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
