import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';
import { ParticleField, GridOverlay } from '../components/BackgroundEffects';
import { ONBOARDING_SLIDES, OrbitalIcon, SlideStatBadge } from '../components/OnboardingSlide';
import { markOnboardingSeen } from '../../../shared/utils/firstVisit';

// Native device-PIN setup (`PinSetupFlow`) intentionally not imported here —
// see the comment at the top of `../components/PinSetupFlow.tsx` for why.
// On web, finishing the slides goes straight to sign up / login instead.

interface OnboardingScreenProps {
  navigate: (s: Screen) => void;
  switchTab: (s: Screen) => void;
}

export function OnboardingScreen({ navigate }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  // Kept for the top progress bar's subtle animation; purely decorative.
  const [, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 0.5)), 50);
    return () => clearInterval(timer);
  }, []);

  const goNext = () => {
    if (slide < ONBOARDING_SLIDES.length - 1) {
      setDirection(1);
      setSlide(slide + 1);
    } else {
      markOnboardingSeen();
      navigate('signup');
    }
  };

  const current = ONBOARDING_SLIDES[slide];
  const Icon = current.icon;

  return (
    <div className="relative h-full overflow-hidden" style={{ background: 'var(--background)' }}>
      <motion.div
        className="absolute inset-0"
        animate={{ background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${current.accentGlow} 0%, transparent 70%)` }}
        transition={{ duration: 0.7 }}
      />
      <GridOverlay color={current.accent} />
      <ParticleField color={current.accent} />

      <div className="absolute top-0 left-0 right-0 h-1 z-20" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: `linear-gradient(90deg, ${current.accent}, ${current.accent}aa)` }}
          animate={{ width: `${((slide + 1) / ONBOARDING_SLIDES.length) * 100}%` }}
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[14px] flex items-center justify-center glass-refraction" style={{ background: 'var(--primary)' }}>
              <ConviaLogo size={18} color="#FFFFFF" />
            </div>
            <span className="text-white text-xl" style={{ fontWeight: 800, letterSpacing: -0.5 }}>Convia</span>
          </motion.div>

          <div className="flex flex-col items-center gap-8 flex-1 justify-center">
            <OrbitalIcon icon={Icon} accent={current.accent} accentGlow={current.accentGlow} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-center">
              <h1 className="text-white mb-4 px-4" style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2 }}>
                {current.title}
              </h1>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 15, lineHeight: 1.6, maxWidth: 280 }}>
                {current.subtitle}
              </p>
            </motion.div>

            <SlideStatBadge accent={current.accent} stat={current.stat} statLabel={current.statLabel} />
          </div>

          <div className="w-full flex flex-col items-center gap-6">
            <div className="flex gap-2">
              {ONBOARDING_SLIDES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ width: i === slide ? 28 : 8, opacity: i === slide ? 1 : 0.3 }}
                  className="h-2 rounded-full"
                  style={{ background: i === slide ? current.accent : '#FFFFFF' }}
                />
              ))}
            </div>

            <div className="w-full flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="w-full h-[54px] rounded-[16px] flex items-center justify-center gap-2 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${current.accent}, ${current.accent}cc)`, fontWeight: 700, fontSize: 16, boxShadow: `0 8px 32px ${current.accentGlow}` }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)` }}
                  animate={{ x: '-100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="relative z-10">{slide < ONBOARDING_SLIDES.length - 1 ? 'Continue' : 'Get Started'}</span>
                <ChevronRight size={18} strokeWidth={2.5} className="relative z-10" />
              </motion.button>

              {slide === ONBOARDING_SLIDES.length - 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-2.5">
                  <button onClick={() => { markOnboardingSeen(); navigate('login'); }} className="flex items-center gap-1.5" style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>
                    I already have an account
                    <ArrowRight size={13} />
                  </button>
                  <button onClick={() => { markOnboardingSeen(); navigate('signup'); }} style={{ color: 'var(--muted-foreground)', fontSize: 14, fontWeight: 500 }}>
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
