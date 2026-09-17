import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, Sparkles, Check } from 'lucide-react';

type Props = {
  amount: number;
  asset: string;
  onDone: () => void;
};

const CONFETTI_COLORS = [
  '#2dd4bf',
  '#34d399',
  '#fbbf24',
  '#f472b6',
  '#60a5fa',
  '#a78bfa',
  '#fb7185',
  '#fef08a',
];

function formatAmt(n: number) {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

/** Full-screen claim win celebration — confetti + ring burst + amount reveal */
export function ClaimCelebration({ amount, asset, onDone }: Props) {
  const [display, setDisplay] = useState(0);
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 140,
        delay: Math.random() * 0.35,
        duration: 1.6 + Math.random() * 1.2,
        rot: (Math.random() - 0.5) * 720,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
        size: 6 + Math.random() * 8,
        shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'rect' : 'diamond',
      })),
    [],
  );

  // Count-up amount
  useEffect(() => {
    const target = amount;
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amount]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, color-mix(in oklab, var(--primary) 28%, transparent), transparent 70%), color-mix(in oklab, var(--background) 92%, black)',
          backdropFilter: 'blur(12px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Confetti layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-[38%]"
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                x: p.x * 2.2,
                y: 280 + Math.random() * 200,
                opacity: [1, 1, 0],
                rotate: p.rot,
                scale: [1, 1.1, 0.6],
              }}
              transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                width: p.size,
                height: p.shape === 'rect' ? p.size * 0.45 : p.size,
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '2px' : '2px',
                background: p.color,
                transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
                boxShadow: `0 0 12px ${p.color}55`,
              }}
            />
          ))}
        </div>

        {/* Soft expanding rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 120,
              height: 120,
              border: '1.5px solid color-mix(in oklab, var(--primary) 50%, transparent)',
            }}
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 2.8 + i * 0.4, opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.08 * i, ease: 'easeOut' }}
          />
        ))}

        {/* Badge */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ scale: 0.5, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.05 }}
        >
          <motion.div
            className="relative mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full"
            style={{
              background:
                'linear-gradient(145deg, color-mix(in oklab, var(--primary) 90%, white), var(--primary))',
              boxShadow:
                '0 0 0 1px color-mix(in oklab, var(--primary) 40%, transparent), 0 20px 50px color-mix(in oklab, var(--primary) 35%, transparent)',
            }}
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.25 }}
            >
              <Check size={40} strokeWidth={2.5} style={{ color: 'var(--primary-foreground)' }} />
            </motion.div>
            <motion.div
              className="absolute -right-1 -top-1"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.45, type: 'spring' }}
            >
              <PartyPopper size={22} style={{ color: '#fbbf24' }} />
            </motion.div>
            <motion.div
              className="absolute -left-2 bottom-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.55, type: 'spring' }}
            >
              <Sparkles size={18} style={{ color: '#a78bfa' }} />
            </motion.div>
          </motion.div>

          <motion.p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Congratulations
          </motion.p>

          <motion.h1
            style={{
              color: 'var(--foreground)',
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -0.5,
              marginBottom: 8,
              lineHeight: 1.15,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            You claimed it!
          </motion.h1>

          <motion.div
            className="mt-2 mb-2 rounded-2xl px-6 py-4"
            style={{
              background: 'color-mix(in oklab, var(--card) 88%, transparent)',
              border: '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
              boxShadow: '0 12px 40px color-mix(in oklab, var(--primary) 12%, transparent)',
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <p
              className="tabular-nums"
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: -1,
                background: 'linear-gradient(90deg, var(--primary), #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatAmt(display)}
            </p>
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 14,
                fontWeight: 650,
                marginTop: 2,
                letterSpacing: 1,
              }}
            >
              {asset}
            </p>
          </motion.div>

          <motion.p
            style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 12, maxWidth: 260 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            Added to your balance. Enjoy the gift.
          </motion.p>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onDone}
            className="mt-8 w-full max-w-[280px] py-3.5 rounded-full font-bold text-[15px]"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '0 8px 28px color-mix(in oklab, var(--primary) 40%, transparent)',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            Done
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
