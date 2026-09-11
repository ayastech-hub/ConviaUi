import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';
import { ONBOARDING_SLIDES } from '../components/OnboardingSlide';
import { markOnboardingSeen } from '../../../shared/utils/firstVisit';

interface OnboardingScreenProps {
  navigate: (s: Screen) => void;
  switchTab: (s: Screen) => void;
}

/** Enterprise first-run onboarding — calm, centered, no noise. */
export function OnboardingScreen({ navigate }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const last = slide === ONBOARDING_SLIDES.length - 1;
  const current = ONBOARDING_SLIDES[slide];
  const Icon = current.icon;

  const goNext = () => {
    if (!last) {
      setDirection(1);
      setSlide((s) => s + 1);
    } else {
      markOnboardingSeen();
      navigate('signup');
    }
  };

  const skip = () => {
    markOnboardingSeen();
    navigate('login');
  };

  return (
    <div
      className="relative h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* soft ambient */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[280px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)',
        }}
      />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ConviaLogo size={18} color="var(--foreground)" />
        </div>
        <button
          type="button"
          onClick={skip}
          style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 650 }}
        >
          Skip
        </button>
      </div>

      {/* slides */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[360px] flex flex-col items-center text-center"
          >
            <div
              className="w-[112px] h-[112px] rounded-[32px] flex items-center justify-center mb-9"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 48px rgba(0,0,0,0.18)',
              }}
            >
              <div
                className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
                style={{
                  background: 'color-mix(in oklab, var(--primary) 14%, transparent)',
                }}
              >
                <Icon size={34} strokeWidth={1.6} style={{ color: 'var(--primary)' }} />
              </div>
            </div>

            <h1
              style={{
                color: 'var(--foreground)',
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: '-0.04em',
                lineHeight: 1.15,
              }}
            >
              {current.title}
            </h1>
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 15,
                marginTop: 14,
                lineHeight: 1.55,
                maxWidth: 300,
              }}
            >
              {current.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* footer */}
      <div className="relative z-10 px-6 pb-10 pt-4">
        <div className="flex items-center justify-center gap-2 mb-6">
          {ONBOARDING_SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === slide ? 22 : 7,
                background: i === slide ? 'var(--primary)' : 'var(--muted-foreground)',
                opacity: i === slide ? 1 : 0.35,
              }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="w-full h-12 rounded-full flex items-center justify-center gap-2"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontWeight: 750,
            fontSize: 15,
          }}
        >
          {last ? 'Create account' : 'Continue'}
          <ArrowRight size={17} />
        </motion.button>

        {last && (
          <button
            type="button"
            onClick={() => {
              markOnboardingSeen();
              navigate('login');
            }}
            className="w-full mt-3 h-11"
            style={{ color: 'var(--muted-foreground)', fontSize: 14, fontWeight: 650 }}
          >
            I already have an account
          </button>
        )}
      </div>
    </div>
  );
}
