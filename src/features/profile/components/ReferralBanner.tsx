import { motion } from 'motion/react';
import { Gift } from 'lucide-react';

interface ReferralBannerProps {
  code: string;
  reward: string;
  onOpen: () => void;
}

/** "Refer friends & earn" promo card shown on the Profile screen. */
export function ReferralBanner({ code, reward, onOpen }: ReferralBannerProps) {
  return (
    <div className="px-5 mb-5">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onOpen}
        className="p-4 rounded-[20px] flex items-center gap-3"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <Gift size={20} style={{ color: 'var(--foreground)' }} />
        </div>
        <div className="flex-1">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Refer Friends & Earn</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{reward} per referral · Code: {code}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="px-3 py-2 rounded-xl"
          style={{ background: 'var(--primary)', color: '#FFF', fontSize: 12, fontWeight: 700 }}
        >
          Share
        </motion.button>
      </motion.div>
    </div>
  );
}
