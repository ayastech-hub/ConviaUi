import { motion } from 'motion/react';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import { useAuth } from '../../../shared/context/AuthContext';

/** Shown on Home only when signed in and KYC is not approved. */
export function KYCBanner({ onClick }: { onClick: () => void }) {
  const { status } = useAuth();
  const { needsKyc, isPending, loading } = useKycStatus();

  if (status !== 'authenticated' || loading || !needsKyc) return null;

  return (
    <div className="px-5 mb-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="rounded-[16px] p-3.5 flex items-center gap-3 cursor-pointer"
        style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)' }}
        >
          <ShieldAlert size={20} style={{ color: '#D97706' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
            {isPending ? 'Verification in review' : 'Verify your identity'}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {isPending
              ? 'Some features stay limited until KYC is approved'
              : 'Unlock higher limits, off-ramp, and withdrawals'}
          </p>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} />
      </motion.div>
    </div>
  );
}
