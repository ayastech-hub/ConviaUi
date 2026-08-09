import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { InputField, SocialButton } from './FormPrimitives';
import type { PasswordStrength } from './passwordStrength';

interface CredentialsStepProps {
  mode: 'login' | 'signup' | 'forgot-password';
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  agreeTerms: boolean;
  setAgreeTerms: (v: boolean) => void;
  strength: PasswordStrength;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onQuickAccess: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

/**
 * The main email/password (or reset-email) form — the first step of the
 * Auth flow for all three modes (login/signup/forgot-password).
 *
 * Note: the original design also had a "Use Biometric" quick-access
 * button here for login. That's mobile-only (see
 * `../components/BiometricStep.tsx`) and intentionally omitted on web.
 */
export function CredentialsStep({
  mode, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
  showPassword, setShowPassword, agreeTerms, setAgreeTerms, strength,
  loading, error, onSubmit, onForgotPassword, onQuickAccess, onSignup, onLogin,
}: CredentialsStepProps) {
  return (
    <motion.div key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {mode !== 'forgot-password' && (
        <>
          <div className="flex flex-col gap-3 mb-6">
            <SocialButton icon="google" label="Continue with Google" onClick={onQuickAccess} />
            <SocialButton icon="apple" label="Continue with Apple" onClick={onQuickAccess} />
            <SocialButton icon="facebook" label="Continue with Facebook" onClick={onQuickAccess} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-4">
        <InputField icon={<Mail size={18} style={{ color: 'var(--muted-foreground)' }} />} type="email" placeholder="Email address" value={email} onChange={setEmail} />

        {mode !== 'forgot-password' && (
          <>
            <div>
              <InputField
                icon={<Lock size={18} style={{ color: 'var(--muted-foreground)' }} />}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={setPassword}
                trailing={
                  <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} style={{ color: 'var(--muted-foreground)' }} /> : <Eye size={18} style={{ color: 'var(--muted-foreground)' }} />}
                  </button>
                }
              />
              {mode === 'signup' && password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i < strength.score ? strength.color : 'var(--border)' }} />
                    ))}
                  </div>
                  <p style={{ color: strength.color, fontSize: 11, fontWeight: 600 }}>{strength.label}</p>
                </motion.div>
              )}
            </div>

            {mode === 'signup' && (
              <InputField icon={<Lock size={18} style={{ color: 'var(--muted-foreground)' }} />} type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={setConfirmPassword} />
            )}
          </>
        )}

        {mode === 'signup' && (
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setAgreeTerms(!agreeTerms)} className="flex items-start gap-3 text-left">
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: agreeTerms ? 'var(--primary)' : 'var(--muted)', border: `1.5px solid ${agreeTerms ? 'var(--primary)' : 'var(--border)'}` }}>
              {agreeTerms && <Check size={12} style={{ color: '#fff' }} strokeWidth={3} />}
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
              I agree to Convia's <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Terms of Service</span>, <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Privacy Policy</span>, and KYC verification requirements.
            </span>
          </motion.button>
        )}

        {mode === 'login' && (
          <div className="flex justify-end">
            <button onClick={onForgotPassword} style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>Forgot password?</button>
          </div>
        )}

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5" style={{ color: 'var(--destructive)', fontSize: 13 }}>
            <AlertCircle size={14} /> {error}
          </motion.p>
        )}

        <motion.button whileTap={{ scale: 0.97 }} onClick={onSubmit} disabled={loading} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
          {loading ? <Loader size={18} className="animate-spin" /> : mode === 'signup' ? 'Continue' : 'Sign In'}
          {!loading && <ArrowRight size={18} />}
        </motion.button>
      </div>

      {mode === 'login' && <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Don't have an account? <button onClick={onSignup} style={{ color: 'var(--foreground)', fontWeight: 700 }}>Sign up</button></p>}
      {mode === 'signup' && <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Already have an account? <button onClick={onLogin} style={{ color: 'var(--foreground)', fontWeight: 700 }}>Sign in</button></p>}
      {mode === 'forgot-password' && <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Remember your password? <button onClick={onLogin} style={{ color: 'var(--foreground)', fontWeight: 700 }}>Sign in</button></p>}

      <p className="text-center mt-4 mb-8" style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>By continuing, you agree to Convia's Terms of Service and Privacy Policy.</p>
    </motion.div>
  );
}
