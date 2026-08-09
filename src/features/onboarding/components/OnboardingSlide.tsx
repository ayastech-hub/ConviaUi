import { Globe, TrendingUp, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export interface OnboardingSlideData {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  accent: string;
  accentGlow: string;
  stat: string;
  statLabel: string;
}

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    icon: Globe,
    title: "Africa's Financial Universe",
    subtitle: 'One app for crypto, banking, payments, and investing. Built for Africa, loved by the world.',
    accent: 'var(--primary)',
    accentGlow: 'var(--muted)',
    stat: '12+ Currencies',
    statLabel: 'Across the continent',
  },
  {
    icon: TrendingUp,
    title: 'Trade & Grow Your Wealth',
    subtitle: 'Access multi-chain crypto, real-time markets, OTC trading, and off-ramp to any local currency.',
    accent: 'var(--positive)',
    accentGlow: 'var(--muted)',
    stat: '50K+ Traders',
    statLabel: 'Active community',
  },
  {
    icon: Users,
    title: 'Pay Anyone, Anywhere',
    subtitle: 'Send money by username. Chat with traders. Build wealth together as a community.',
    accent: 'var(--primary)',
    accentGlow: 'var(--muted)',
    stat: '24/7 Support',
    statLabel: 'Always here for you',
  },
];

interface OrbitalIconProps {
  icon: OnboardingSlideData['icon'];
  accent: string;
  accentGlow: string;
}

/** The floating icon with rotating orbit rings and dots, shown at the center of each slide. */
export function OrbitalIcon({ icon: Icon, accent, accentGlow }: OrbitalIconProps) {
  return (
    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.2 }} className="relative">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0" style={{ width: 140, height: 140, left: -14, top: -14 }}>
        <div className="w-full h-full rounded-full" style={{ border: `1px dashed ${accent}40`, borderTopColor: `${accent}80` }} />
      </motion.div>

      <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute" style={{ width: 116, height: 116, left: -2, top: -2 }}>
        <div className="w-full h-full rounded-full" style={{ border: `1px solid ${accent}20`, borderBottomColor: `${accent}60` }} />
      </motion.div>

      <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <div
          className="w-28 h-28 rounded-[32px] flex items-center justify-center glass-refraction"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
            border: `1px solid ${accent}40`,
            boxShadow: `0 20px 60px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          <Icon size={48} strokeWidth={1.5} style={{ color: accent }} />
        </div>
      </motion.div>

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: 6, height: 6, background: accent, top: '50%', left: '50%', marginLeft: -3, marginTop: -3 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
          initial={{ rotate: i * 120 }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, transform: `translateX(${56 + i * 6}px)` }} />
        </motion.div>
      ))}
    </motion.div>
  );
}

/** The stat badge ("12+ Currencies · Across the continent") shown below each slide's text. */
export function SlideStatBadge({ accent, stat, statLabel }: { accent: string; stat: string; statLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', damping: 15 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card"
      style={{ border: `1px solid ${accent}30`, background: `${accent}0d` }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}20` }}>
        <Zap size={14} style={{ color: accent }} />
      </div>
      <div>
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{stat}</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{statLabel}</p>
      </div>
    </motion.div>
  );
}
