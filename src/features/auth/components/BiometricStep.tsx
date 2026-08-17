import { motion } from 'motion/react';
import { Fingerprint, Shield, KeyRound, Loader, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../shared/context/LanguageContext';

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
  const { t } = useLanguage();
