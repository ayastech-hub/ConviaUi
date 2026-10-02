import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useAccountSetup } from '../hooks/useAccountSetup';
import { useAuth } from '../context/AuthContext';

/**
 * Home status card for incomplete setup or verification under review.
 */
export function AccountSetupBanner({ onOpen }: { onOpen: () => void }) {
  const { status } = useAuth();
  const { loading, percent, allDone, isKycPending, isKycApproved, needsSetup } =
    useAccountSetup();

  if (status !== 'authenticated' || loading) return null;
  if (allDone && isKycApproved) return null;

  if (isKycPending) {
    return (
      <div className="px-5 mb-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onOpen}
          className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{
            background: 'color-mix(in srgb, var(--primary) 12%, var(--card, var(--background)))',
            border: '1px solid color-mix(in srgb, var(--primary) 28%, transparent)',
          }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
            style={{
              background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
              color: 'var(--primary)',
            }}
          >
            …
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14px]" style={{ color: 'var(--foreground)' }}>
              Verification under review
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Your identity check is in progress. Some services remain limited until approval.
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        </motion.button>
      </div>
    );
  }

  if (!needsSetup) return null;

  return (
    <div className="px-5 mb-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onOpen}
        className="w-full text-left rounded-2xl px-4 py-3.5 flex items-center gap-3"
        style={{
          background: 'color-mix(in srgb, #f59e0b 12%, var(--card, var(--background)))',
          border: '1px solid color-mix(in srgb, #f59e0b 25%, transparent)',
        }}
      >
        <div className="relative w-11 h-11 shrink-0">
          <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="color-mix(in srgb, #f59e0b 25%, transparent)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(percent / 100) * 94} 94`}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            {percent}%
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px]" style={{ color: 'var(--foreground)' }}>
            Complete account setup
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Finish verification to enable withdrawals and cash-out
          </p>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
      </motion.button>
    </div>
  );
}
