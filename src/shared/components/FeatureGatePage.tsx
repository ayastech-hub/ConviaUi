import { motion } from 'motion/react';
import { ShieldOff } from 'lucide-react';
import { PageTop } from './PageTop';
import { BackButton } from './BackButton';

type Props = {
  title?: string;
  featureLabel: string;
  reason?: string | null;
  country?: string;
  goBack: () => void;
};

/**
 * Full-screen block when admin suspended a feature for the user's country.
 * User never reaches the real flow UI.
 */
export function FeatureGatePage({
  title = 'Unavailable',
  featureLabel,
  reason,
  country,
  goBack,
}: Props) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-4 pb-2">
        <BackButton onClick={goBack} />
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>{title}</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background: 'color-mix(in oklab, var(--muted-foreground) 12%, var(--card))',
            border: '1px solid var(--border)',
          }}
        >
          <ShieldOff size={28} style={{ color: 'var(--muted-foreground)' }} />
        </motion.div>
        <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, letterSpacing: -0.3 }}>
          {featureLabel} unavailable
        </p>
        <p
          className="mt-3 max-w-sm"
          style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.5 }}
        >
          {reason ||
            `This service is not available${country ? ` in ${country}` : ' in your region'} right now.`}
        </p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={goBack}
          className="mt-8 w-full max-w-xs rounded-full"
          style={{
            height: 48,
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Go back
        </motion.button>
      </div>
    </div>
  );
}
