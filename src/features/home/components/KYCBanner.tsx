import { motion } from 'motion/react';
import { ShieldAlert, ChevronRight } from 'lucide-react';

/** "Verify your identity" prompt shown on Home for unverified accounts. */
export function KYCBanner({ onClick }: { onClick: () => void }) {
  return (
    <div className="px-5 mb-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="rounded-[16px] p-3.5 flex items-center gap-3 cursor-pointer"
        style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
          <ShieldAlert size={20} style={{ color: 'var(--muted-foreground)' }} />
        </div>
        <div className="flex-1">
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>Verify your identity</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Required for deposits, withdrawals & trading</p>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
      </motion.div>
    </div>
  );
}
