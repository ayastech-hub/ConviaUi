import { motion } from 'motion/react';
import { Fingerprint, Shield, KeyRound, Loader, AlertCircle } from 'lucide-react';

/**
 * ⚠️ NATIVE / MOBILE ONLY — NOT IMPORTED IN THE WEB BUILD.
 *
 * "Authenticate with Face ID or fingerprint" only makes sense on a device
 * with an actual biometric sensor exposed through a native API (iOS
 * LocalAuthentication, Android BiometricPrompt). A browser's closest
 * equivalent is the WebAuthn API, which is a materially different flow
 * (a passkey/security-key ceremony, not a fingerprint icon you tap), so
 * this isn't just "the same feature behind a flag" — it needs its own
 * implementation to be done properly on web.
 *
 * The component is kept here, fully implemented, for whenever this app
 * is wrapped in a native shell. Until then, `AuthScreen` does not render
 * or import this — on web, submitting login credentials goes straight to
 * the success state instead (see `AuthScreen.tsx`).
 *
 * If/when this gets wired back in for a native build, render it as a
 * step after credentials and call `onAuthenticate`; `onUsePasswordInstead`
 * should return the user to the credentials step.
 */

interface BiometricStepProps {
  loading: boolean;
  error?: string;
  onAuthenticate: () => void;
  onUsePasswordInstead: () => void;
}

export function BiometricStep({ loading, error, onAuthenticate, onUsePasswordInstead }: BiometricStepProps) {
  return (
    <motion.div key="biometric" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex flex-col items-center mb-8">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--primary)' }}>
          <Fingerprint size={40} style={{ color: '#fff' }} />
        </motion.div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Biometric Login</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}>Authenticate with Face ID or fingerprint to securely access your account</p>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
        <Shield size={14} style={{ color: 'var(--positive)', flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>Biometric data is stored securely on this device and never sent to our servers.</p>
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 mb-3" style={{ color: 'var(--destructive)', fontSize: 13 }}>
          <AlertCircle size={14} /> {error}
        </motion.p>
      )}

      <motion.button whileTap={{ scale: 0.97 }} onClick={onAuthenticate} disabled={loading} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2 mb-3" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        {loading ? <Loader size={18} className="animate-spin" /> : (<>Authenticate <Fingerprint size={18} /></>)}
      </motion.button>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onUsePasswordInstead} className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 glass-card" style={{ border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
        <KeyRound size={18} /> Use Password Instead
      </motion.button>
    </motion.div>
  );
}
