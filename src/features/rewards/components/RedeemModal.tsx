import { motion, AnimatePresence } from 'motion/react';
import { Loader, CheckCircle2 } from 'lucide-react';
import type { RedeemState } from './rewardsData';

interface RedeemModalProps {
  redeemState: RedeemState;
  points: number;
  maxRedeem: number;
  redeemAmount: string;
  setRedeemAmount: (v: string) => void;
  onCancel: () => void;
  onRedeem: () => void;
  onDone: () => void;
}

/** Bottom-sheet "Redeem Points" flow: amount entry followed by success confirmation. */
export function RedeemModal({ redeemState, points, maxRedeem, redeemAmount, setRedeemAmount, onCancel, onRedeem, onDone }: RedeemModalProps) {
  return (
    <AnimatePresence>
      {redeemState !== 'idle' && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => (redeemState === 'processing' ? null : onCancel())} className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 320 }} className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6" style={{ background: 'var(--card)' }}>
            {redeemState === 'processing' && (
              <>
                <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--muted)' }} />
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
                    <Loader size={28} className="animate-spin" style={{ color: 'var(--foreground)' }} />
                  </div>
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Redeem Points</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>1,000 points = $1 USDT</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3" style={{ background: 'var(--muted)' }}>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>$</span>
                  <input type="number" placeholder="0" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 700 }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>USDT</span>
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
                  Available: {points.toLocaleString()} pts · Max redeem: ${maxRedeem}
                </p>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel} className="flex-1 py-3.5 rounded-[14px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                    Cancel
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={onRedeem} className="flex-1 py-3.5 rounded-[14px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                    Redeem
                  </motion.button>
                </div>
              </>
            )}
            {redeemState === 'success' && (
              <div className="flex flex-col items-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }} className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
                  <CheckCircle2 size={40} style={{ color: 'var(--foreground)' }} />
                </motion.div>
                <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Redemption Successful!</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
                  ${redeemAmount || '0'} USDT has been added to your wallet
                </p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={onDone} className="w-full py-3.5 rounded-[14px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                  Done
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
