import { motion } from 'motion/react';
import { Zap, Flame } from 'lucide-react';

/**
 * Points hero — fixed brand gradient so text stays readable in light and dark themes.
 * (Using var(--foreground) as the card fill made white labels invisible on dark theme.)
 */
export function PointsCard({ points }: { points: number }) {
  const nextLevelAt = 3600;
  const pct = Math.min(100, (points / nextLevelAt) * 100);

  return (
    <div className="px-5 mb-4">
      <div
        className="rounded-[24px] p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)',
          boxShadow: '0 16px 40px rgba(76, 29, 149, 0.35)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, #c4b5fd, transparent)',
            transform: 'translate(20%, -30%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} color="#fde68a" />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              Convia Points
            </span>
          </div>
          <motion.p
            key={points}
            initial={{ scale: 1.1, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              fontSize: 48,
              fontWeight: 900,
              letterSpacing: -2,
              color: '#ffffff',
              marginBottom: 4,
            }}
          >
            {points.toLocaleString()}
          </motion.p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 16 }}>
            ≈ ${(points / 1000).toFixed(2)} USDT equivalent
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.22)' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: '#fde68a' }}
              />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, whiteSpace: 'nowrap' }}>
              {points.toLocaleString()} / {nextLevelAt.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Optional streak strip — theme-safe colors. */
export function StreakCard() {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-[20px]"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--muted)' }}
      >
        <Flame size={24} style={{ color: 'var(--primary)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Earn by completing tasks</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
          Claim rewards on the Tasks tab when a goal is done
        </p>
      </div>
    </div>
  );
}
