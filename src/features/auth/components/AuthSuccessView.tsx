import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface AuthSuccessViewProps {
  mode: 'login' | 'signup' | 'forgot-password';
}

/** Brief confirmation shown after a successful login, signup, or password-reset request. */
export function AuthSuccessView({ mode }: AuthSuccessViewProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-8" style={{ background: 'var(--background)' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--muted)' }}>
          <CheckCircle2 size={44} style={{ color: 'var(--positive)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>
          {mode === 'forgot-password' ? 'Link Sent!' : mode === 'signup' ? 'Account Created!' : 'Signed In!'}
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center' }}>
          {mode === 'forgot-password' ? 'Check your email for a reset link' : mode === 'signup' ? 'Welcome to Convia' : 'Redirecting to your dashboard...'}
        </p>
      </motion.div>
    </div>
  );
}
