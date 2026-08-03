import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Delete, Globe, TrendingUp, Users, Shield, Sparkles, ArrowRight, Lock, Zap } from 'lucide-react';
import type { Screen } from '../../data/mockData';
import { ConviaLogo } from '../ConviaLogo';

interface OnboardingScreenProps {
  navigate: (s: Screen) => void;
  switchTab: (s: Screen) => void;
}

const slides = [
  {
    icon: Globe,
    title: "Africa's Financial Universe",
    subtitle: 'One app for crypto, banking, payments, and investing. Built for Africa, loved by the world.',
    accent: '#6366F1',
    accentGlow: 'rgba(99,102,241,0.25)',
    stat: '12+ Currencies',
    statLabel: 'Across the continent',
  },
  {
    icon: TrendingUp,
    title: 'Trade & Grow Your Wealth',
    subtitle: 'Access multi-chain crypto, real-time markets, OTC trading, and off-ramp to any local currency.',
    accent: '#10B981',
    accentGlow: 'rgba(16,185,129,0.25)',
    stat: '50K+ Traders',
    statLabel: 'Active community',
  },
  {
    icon: Users,
    title: 'Pay Anyone, Anywhere',
    subtitle: 'Send money by username. Chat with traders. Build wealth together as a community.',
    accent: '#818CF8',
    accentGlow: 'rgba(129,140,248,0.25)',
    stat: '24/7 Support',
    statLabel: 'Always here for you',
  },
];

const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

function ParticleField({ color }: { color: string }) {
  const particles = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    })),
    [color]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            opacity: 0.15,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function GridOverlay({ color }: { color: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(${color}08 1px, transparent 1px), linear-gradient(90deg, ${color}08 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, black 30%, transparent 80%)',
      }}
    />
  );
}

export function OnboardingScreen({ navigate, switchTab }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const [phase, setPhase] = useState<'slides' | 'pin-create' | 'pin-confirm'>('slides');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 0.5));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const goNext = () => {
    if (slide < slides.length - 1) {
      setDirection(1);
      setSlide(slide + 1);
    } else {
      setPhase('pin-create');
    }
  };

  const handlePinKey = (key: string) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
      setPinError('');
      return;
    }
    if (key === '') return;
    const next = pin + key;
    if (next.length > 4) return;
    setPin(next);

    if (next.length === 4) {
      setTimeout(() => {
        if (phase === 'pin-create') {
          setFirstPin(next);
          setPin('');
          setPhase('pin-confirm');
        } else {
          if (next === firstPin) {
            switchTab('home');
          } else {
            setPinError('PINs do not match. Try again.');
            setPin('');
          }
        }
      }, 200);
    }
  };

  if (phase !== 'slides') {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B0F19, #131826)' }}>
        <ParticleField color="#6366F1" />
        <GridOverlay color="#6366F1" />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full flex flex-col items-center gap-8 relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-refraction" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.95))', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
              <ConviaLogo size={26} color="#FFFFFF" />
            </div>
            <span className="text-white text-2xl" style={{ fontWeight: 800, letterSpacing: -0.5 }}>Convia</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <Lock size={12} style={{ color: '#818CF8' }} />
            <span style={{ color: '#818CF8', fontSize: 11, fontWeight: 600 }}>SECURE PIN SETUP</span>
          </motion.div>

          <div className="text-center">
            <h2 className="text-white mb-2" style={{ fontSize: 22, fontWeight: 700 }}>
              {phase === 'pin-create' ? 'Create your PIN' : 'Confirm your PIN'}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>
              {phase === 'pin-create'
                ? 'Choose a 4-digit PIN to secure your account'
                : 'Enter your PIN again to confirm'}
            </p>
          </div>

          <div className="flex gap-4">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{
                  scale: i < pin.length ? 1.2 : 1,
                  borderColor: i < pin.length ? '#6366F1' : 'rgba(255,255,255,0.2)',
                }}
                className="w-4 h-4 rounded-full border-2"
                style={{
                  background: i < pin.length ? '#6366F1' : 'transparent',
                }}
              />
            ))}
          </div>

          {pinError && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#EF4444', fontSize: 13 }}
            >
              {pinError}
            </motion.p>
          )}

          <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
            {PIN_KEYS.map((key, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.88 }}
                onClick={() => key !== '' && handlePinKey(key)}
                className="h-16 rounded-2xl flex items-center justify-center glass-card"
                style={{
                  background: key === '' ? 'transparent' : undefined,
                  color: '#F1F5F9',
                  fontSize: 22,
                  fontWeight: 500,
                  cursor: key === '' ? 'default' : 'pointer',
                  border: key === '' ? 'none' : '1px solid rgba(99,102,241,0.15)',
                }}
              >
                {key === 'del' ? <Delete size={20} style={{ color: '#94A3B8' }} /> : key}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="relative h-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B0F19, #131826)' }}>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${current.accentGlow} 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.7 }}
      />

      {/* Grid overlay */}
      <GridOverlay color={current.accent} />

      {/* Particles */}
      <ParticleField color={current.accent} />

      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 z-20" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: `linear-gradient(90deg, ${current.accent}, ${current.accent}aa)` }}
          animate={{ width: `${((slide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide}
          custom={direction}
          initial={{ opacity: 0, x: direction * 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: direction * -80, scale: 0.95 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 flex flex-col items-center justify-between px-8 py-16 z-10"
        >
          {/* Brand header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-[14px] flex items-center justify-center glass-refraction" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.95))', boxShadow: '0 6px 20px rgba(99,102,241,0.3)' }}>
              <ConviaLogo size={18} color="#FFFFFF" />
            </div>
            <span className="text-white text-xl" style={{ fontWeight: 800, letterSpacing: -0.5 }}>Convia</span>
          </motion.div>

          {/* Center content */}
          <div className="flex flex-col items-center gap-8 flex-1 justify-center">
            {/* Icon with orbital rings */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.2 }}
              className="relative"
            >
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
                style={{
                  width: 140,
                  height: 140,
                  left: -14,
                  top: -14,
                }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    border: `1px dashed ${current.accent}40`,
                    borderTopColor: `${current.accent}80`,
                  }}
                />
              </motion.div>

              {/* Inner counter-rotating ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute"
                style={{
                  width: 116,
                  height: 116,
                  left: -2,
                  top: -2,
                }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    border: `1px solid ${current.accent}20`,
                    borderBottomColor: `${current.accent}60`,
                  }}
                />
              </motion.div>

              {/* Floating icon */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="w-28 h-28 rounded-[32px] flex items-center justify-center glass-refraction"
                  style={{
                    background: `linear-gradient(135deg, ${current.accent}33, ${current.accent}11)`,
                    border: `1px solid ${current.accent}40`,
                    boxShadow: `0 20px 60px ${current.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                >
                  <Icon size={48} strokeWidth={1.5} style={{ color: current.accent }} />
                </div>
              </motion.div>

              {/* Orbiting dots */}
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: current.accent,
                    top: '50%',
                    left: '50%',
                    marginLeft: -3,
                    marginTop: -3,
                  }}
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  initial={{ rotate: i * 120 }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: current.accent,
                      transform: `translateX(${56 + i * 6}px)`,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-center"
            >
              <h1 className="text-white mb-4 px-4" style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                {current.title}
              </h1>
              <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, maxWidth: 280 }}>
                {current.subtitle}
              </p>
            </motion.div>

            {/* Stat badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 15 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-card"
              style={{ border: `1px solid ${current.accent}30`, background: `${current.accent}0d` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${current.accent}20` }}>
                <Zap size={14} style={{ color: current.accent }} />
              </div>
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{current.stat}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{current.statLabel}</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom controls */}
          <div className="w-full flex flex-col items-center gap-6">
            {/* Progress dots */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === slide ? 28 : 8,
                    opacity: i === slide ? 1 : 0.3,
                  }}
                  className="h-2 rounded-full"
                  style={{ background: i === slide ? current.accent : '#FFFFFF' }}
                />
              ))}
            </div>

            {/* CTA buttons */}
            <div className="w-full flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="w-full h-[54px] rounded-[16px] flex items-center justify-center gap-2 text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${current.accent}, ${current.accent}cc)`,
                  fontWeight: 700, fontSize: 16,
                  boxShadow: `0 8px 32px ${current.accentGlow}`,
                }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                  }}
                  animate={{ x: '-100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="relative z-10">{slide < slides.length - 1 ? 'Continue' : 'Get Started'}</span>
                <ChevronRight size={18} strokeWidth={2.5} className="relative z-10" />
              </motion.button>

              {slide === slides.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center gap-2.5"
                >
                  <button
                    onClick={() => navigate('login')}
                    className="flex items-center gap-1.5"
                    style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}
                  >
                    I already have an account
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => navigate('signup')}
                    style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}
                  >
                    I don't have an account — Sign up
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
