import { Flame, Sparkles } from 'lucide-react';

/** Hero points balance. */
export function PointsCard({ points }: { points: number }) {
  return (
    <div className="px-5 mb-4">
      <div
        className="relative overflow-hidden rounded-[28px] px-5 py-6"
        style={{
          background:
            'linear-gradient(145deg, color-mix(in oklab, var(--primary) 28%, var(--card)) 0%, var(--card) 55%)',
          border: '1px solid var(--border)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-16 -right-10 w-40 h-40 rounded-full"
          style={{
            background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 35%, transparent), transparent 70%)',
          }}
        />
        <div className="relative flex items-center gap-2 mb-2">
          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 650, letterSpacing: 0.4 }}>
            POINTS BALANCE
          </p>
        </div>
        <p
          style={{
            color: 'var(--foreground)',
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: '-0.05em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {Math.round(points).toLocaleString()}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 10 }}>
          Earn points from tasks and referrals
        </p>
      </div>
    </div>
  );
}

export function StreakCard({ days = 3 }: { days?: number }) {
  return (
    <div
      className="flex items-center gap-3 rounded-[20px] px-4 py-3.5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: 'color-mix(in oklab, var(--warning) 18%, transparent)' }}
      >
        <Flame size={18} style={{ color: 'var(--warning)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Daily streak</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
          {days} day{days === 1 ? '' : 's'} · keep logging in
        </p>
      </div>
      <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>
        {days}
      </p>
    </div>
  );
}
