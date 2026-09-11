import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Loader, AlertCircle, Gift, User } from 'lucide-react';
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

/** Clean enterprise email/password form. */
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
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot-password';

  return (
    <motion.div
      key="credentials"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col flex-1"
    >
      {/* Social */}
      {!isForgot && (
        <>
          <div className="flex flex-col gap-2.5 mb-5">
            <SocialBtn provider="google" onClick={onQuickAccess} />
            <SocialBtn provider="apple" onClick={onQuickAccess} />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-3.5">
        <Field
          icon={<Mail size={17} style={{ color: 'var(--muted-foreground)' }} />}
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        {isSignup && setUsername && (
          <Field
            icon={<User size={17} style={{ color: 'var(--muted-foreground)' }} />}
            type="text"
            placeholder="Username"
            value={username}
            onChange={setUsername}
            autoComplete="username"
          />
        )}

        {!isForgot && (
          <Field
            icon={<Lock size={17} style={{ color: 'var(--muted-foreground)' }} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={setPassword}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            trailing={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1">
                {showPassword ? (
                  <EyeOff size={16} style={{ color: 'var(--muted-foreground)' }} />
                ) : (
                  <Eye size={16} style={{ color: 'var(--muted-foreground)' }} />
                )}
              </button>
            }
          />
        )}

        {isSignup && (
          <>
            <Field
              icon={<Lock size={17} style={{ color: 'var(--muted-foreground)' }} />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
            {/* Strength */}
            <div className="px-1">
              <div className="flex gap-1 mb-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{
                      background:
                        i < strength.score
                          ? strength.score <= 1
                            ? 'var(--destructive)'
                            : strength.score === 2
                              ? 'var(--warning)'
                              : 'var(--positive)'
                          : 'var(--muted)',
                    }}
                  />
                ))}
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{strength.label}</p>
            </div>
            {setReferralCode && (
              <Field
                icon={<Gift size={17} style={{ color: 'var(--muted-foreground)' }} />}
                type="text"
                placeholder="Referral code (optional)"
                value={referralCode}
                onChange={setReferralCode}
              />
            )}
            <label className="flex items-start gap-2.5 px-1 cursor-pointer">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: agreeTerms ? 'var(--primary)' : 'var(--muted)',
                  border: agreeTerms ? 'none' : '1px solid var(--border)',
                }}
              >
                {agreeTerms && <Check size={12} style={{ color: 'var(--primary-foreground)' }} strokeWidth={3} />}
              </button>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45 }}>
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
          </>
        )}

        {mode === 'login' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 650 }}
            >
              Forgot password?
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-start gap-2 mt-4 px-3.5 py-3 rounded-2xl"
          style={{
            background: 'color-mix(in oklab, var(--destructive) 12%, var(--card))',
            border: '1px solid color-mix(in oklab, var(--destructive) 30%, var(--border))',
          }}
        >
          <AlertCircle size={16} style={{ color: 'var(--destructive)', marginTop: 1, flexShrink: 0 }} />
          <p style={{ color: 'var(--foreground)', fontSize: 13, lineHeight: 1.4 }}>{error}</p>
        </div>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        onClick={onSubmit}
        className="w-full h-12 rounded-full mt-6 flex items-center justify-center gap-2"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontWeight: 750,
          fontSize: 15,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader size={18} className="animate-spin" />
        ) : (
          <>
            {isForgot ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'}
            <ArrowRight size={17} />
          </>
        )}
      </motion.button>

      <p className="text-center mt-6 mb-4" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
        {isForgot ? (
          <>
            Remember it?{' '}
            <button type="button" onClick={onLogin} style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign in
            </button>
          </>
        ) : isSignup ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={onLogin} style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign in
            </button>
          </>
        ) : (
          <>
            New to Convia?{' '}
            <button type="button" onClick={onSignup} style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create account
            </button>
          </>
        )}
      </p>
    </motion.div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  trailing,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 h-12 rounded-2xl"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent outline-none"
        style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
      />
      {trailing}
    </div>
  );
}

function SocialBtn({
  provider,
  onClick,
}: {
  provider: 'google' | 'apple';
  onClick: () => void;
}) {
  const isGoogle = provider === 'google';
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="w-full h-12 rounded-2xl flex items-center justify-center gap-3 relative"
      style={{
        background: isGoogle ? '#FFFFFF' : '#000000',
        color: isGoogle ? '#1F1F1F' : '#FFFFFF',
        border: isGoogle ? '1px solid #DADCE0' : '1px solid #000000',
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: '-0.01em',
        boxShadow: isGoogle ? '0 1px 2px rgba(60,64,67,0.12)' : '0 1px 2px rgba(0,0,0,0.25)',
      }}
    >
      {isGoogle ? <GoogleMark /> : <AppleMark />}
      <span>{isGoogle ? 'Continue with Google' : 'Continue with Apple'}</span>
    </motion.button>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden>
      <path d="M13.29 9.52c-.02-2.02 1.65-2.99 1.72-3.04-0.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.3 2-.7 1.21-.18 3 .5 3.98.5.72 1.08 1.52 1.85 1.49.74-.03 1.02-.48 1.91-.48.9 0 1.15.48 1.93.46.8-.02 1.3-.73 1.79-1.45.56-.82.79-1.61.8-1.65-.02-.01-1.54-.59-1.56-2.35zM11.1 3.5c.4-.49.68-1.17.6-1.85-.58.02-1.28.39-1.7.87-.37.43-.7 1.12-.61 1.78.65.05 1.31-.33 1.71-.8z" />
    </svg>
  );
}
