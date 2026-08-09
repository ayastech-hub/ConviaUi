import { motion } from 'motion/react';
import { Zap, Flame } from 'lucide-react';

/** The big "Convia Points" balance card with level progress. */
export function PointsCard({ points }: { points: number }) {
  return (
    <div className="px-5 mb-4">
      <div className="rounded-[24px] p-5 relative overflow-hidden glass-refraction" style={{ background: 'var(--foreground)', boxShadow: '0 16px 48px var(--muted)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)', transform: 'translate(20%,-30%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} style={{ color: 'var(--muted-foreground)' }} />
            <span className="text-white opacity-80" style={{ fontSize: 14 }}>Convia Points</span>
          </div>
          <motion.p key={points} initial={{ scale: 1.2, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="text-white mb-1" style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2 }}>
            {points.toLocaleString()}
          </motion.p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 16 }}>
            ≈ ${(points / 1000).toFixed(2)} USDT value · Level 3 Trader
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (points / 3600) * 100)}%`, background: 'var(--foreground)' }} />
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{points.toLocaleString()} / 3,600 to Level 4</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The daily-login streak card. */
export function StreakCard() {
  return (
    <div className="px-5 mb-4">
      <div className="flex items-center gap-3 p-4 rounded-[20px]" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <Flame size={28} style={{ color: 'var(--muted-foreground)' }} />
        </motion.div>
        <div className="flex-1">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 24, fontWeight: 900 }}>7 Days</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Day streak · Earn 10pts/day</p>
        </div>
        <div className="text-right">
          <p style={{ color: 'var(--muted-foreground)', fontWeight: 700, fontSize: 14 }}>+70 pts</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>this week</p>
        </div>
      </div>
    </div>
  );
}
