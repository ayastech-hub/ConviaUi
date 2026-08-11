import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Loader, AlertCircle, Gift, User } from 'lucide-react';
import { InputField, SocialButton } from './FormPrimitives';
import type { PasswordStrength } from './passwordStrength';

interface CredentialsStepProps {
  mode: 'login' | 'signup' | 'forgot-password';
  email: string;
  setEmail: (v: string) => void;
  username?: string;
  setUsername?: (v: string) => void;
  referralCode?: string;
  setReferralCode?: (v: string) => void;
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

const iconMuted = <Mail size={18} style={{ color: 'var(--muted-foreground)' }} />;
const lockIcon = <Lock size={18} style={{ color: 'var(--muted-foreground)' }} />;
const userIcon = <User size={18} style={{ color: 'var(--muted-foreground)' }} />;
const giftIcon = <Gift size={18} style={{ color: 'var(--muted-foreground)' }} />;

/**
 * Email/password (or reset-email) form for login / signup / forgot-password.
 */
export function CredentialsStep({
  mode,
  email,
  setEmail,
  username = '',
  setUsername,
  referralCode = '',
  setReferralCode,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  agreeTerms,
  setAgreeTerms,
  strength,
  loading,
  error,
  onSubmit,
  onForgotPassword,
  onQuickAccess,
  onSignup,
  onLogin,
}: CredentialsStepProps) {
  return (
    <motion.div
      key="credentials"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
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
        <InputField
          icon={iconMuted}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={setEmail}
        />

        {mode === 'signup' && setUsername && (
          <InputField
            icon={userIcon}
            type="text"
            placeholder="Username (optional)"
            value={username}
            onChange={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24))}
          />
        )}

        {mode === 'signup' && setReferralCode && (
          <InputField
            icon={giftIcon}
            type="text"
            placeholder="Referral code (optional)"
            value={referralCode}
            onChange={(v) => setReferralCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32))}
          />
        )}

        {mode !== 'forgot-password' && (
          <>
            <InputField
              icon={lockIcon}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              trailing={
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                  {showPassword ? (
                    <EyeOff size={18} style={{ color: 'var(--muted-foreground)' }} />
                  ) : (
                    <Eye size={18} style={{ color: 'var(--muted-foreground)' }} />
                  )}
                </button>
              }
            />
            {mode === 'signup' && password && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1">
                <div className="flex gap-1 mb-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full"
                      style={{ background: i < strength.score ? strength.color : 'var(--border)' }}
                    />
                  ))}
                </div>
                <p style={{ color: strength.color, fontSize: 11, fontWeight: 600 }}>{strength.label}</p>
              </motion.div>
            )}

            {mode === 'signup' && (
              <InputField
                icon={lockIcon}
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            )}
          </>
        )}

        {mode === 'signup' && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="flex items-start gap-3 text-left"
          >
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: agreeTerms ? 'var(--primary)' : 'transparent',
                border: `1.5px solid ${agreeTerms ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {agreeTerms && <Check size={12} style={{ color: '#fff' }} strokeWidth={3} />}
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
              I agree to Convia&apos;s{' '}
              <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Terms of Service</span>,{' '}
              <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Privacy Policy</span>, and KYC
              verification requirements.
            </span>
          </motion.button>
        )}

        {mode === 'login' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5"
            style={{ color: 'var(--destructive)', fontSize: 13 }}
          >
            <AlertCircle size={14} /> {error}
          </motion.p>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
          style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
        >
          {loading ? (
            <Loader size={18} className="animate-spin" />
          ) : mode === 'signup' ? (
            'Create account'
          ) : mode === 'forgot-password' ? (
            'Send reset link'
          ) : (
            'Sign In'
          )}
          {!loading && <ArrowRight size={18} />}
        </motion.button>
      </div>

      {mode === 'login' && (
        <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSignup} style={{ color: 'var(--foreground)', fontWeight: 700 }}>
            Sign up
          </button>
        </p>
      )}
      {mode === 'signup' && (
        <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
          Already have an account?{' '}
          <button type="button" onClick={onLogin} style={{ color: 'var(--foreground)', fontWeight: 700 }}>
            Sign in
          </button>
        </p>
      )}
      {mode === 'forgot-password' && (
        <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
          Remember your password?{' '}
          <button type="button" onClick={onLogin} style={{ color: 'var(--foreground)', fontWeight: 700 }}>
            Sign in
          </button>
        </p>
      )}

      <p
        className="text-center mt-4 mb-8"
        style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}
      >
        By continuing, you agree to Convia&apos;s Terms of Service and Privacy Policy.
      </p>
    </motion.div>
  );
}
