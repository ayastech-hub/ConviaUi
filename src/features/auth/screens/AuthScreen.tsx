import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';
import type { Screen } from '../../../shared/data/mockData';
import { passwordStrength } from '../components/passwordStrength';
import { CredentialsStep } from '../components/CredentialsStep';
import { PhoneStep } from '../components/PhoneStep';
import { OtpStep } from '../components/OtpStep';
import { AuthSuccessView } from '../components/AuthSuccessView';
import { useAuth } from '../../../shared/context/AuthContext';
import { ApiError } from '../../../shared/api/types';
import * as authApi from '../../../shared/api/auth';

// Native biometric login (`BiometricStep`) intentionally not imported here —
// see the comment at the top of `../components/BiometricStep.tsx` for why.
// On web, submitting login credentials goes straight to the success state.

interface AuthScreenProps {
  mode: 'login' | 'signup' | 'forgot-password';
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

type Step = 'credentials' | 'phone' | 'otp';

export function AuthScreen({ mode, navigate, goBack, switchTab }: AuthScreenProps) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    try {
      const pathMatch = (window.location.pathname || '').match(/^\/ref\/([A-Za-z0-9_-]+)/i);
      const q = new URLSearchParams(window.location.search).get('ref');
      return (pathMatch?.[1] || q || localStorage.getItem('convia_ref') || '').trim();
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('credentials');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const finishWithSuccess = (delay: number) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => switchTab('home'), 1500);
    }, delay);
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !email.includes('@')) { setError('Please enter a valid email address'); return; }
    if (mode !== 'forgot-password' && !password) { setError('Please enter your password'); return; }

    if (mode === 'signup') {
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (strength.score < 3) { setError('Password is too weak. Use 8+ chars with upper/lower/numbers/symbols'); return; }
      if (!agreeTerms) { setError('Please accept the Terms of Service to continue'); return; }
      // Optional phone step still available; registration hits the API after OTP or skip.
      setStep('phone');
      return;
    }

    if (mode === 'forgot-password') {
      setLoading(true);
      try {
        await authApi.sendPasswordResetEmail(email);
        setSuccess(true);
        setTimeout(() => goBack(), 1500);
      } catch (err) {
        const msg = err instanceof ApiError ? (err.body.message || err.code) : 'Could not send reset email';
        setError(String(msg));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Live login
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => switchTab('home'), 800);
    } catch (err) {
      const msg = err instanceof ApiError
        ? (err.code === 'invalid_credentials' ? 'Invalid email or password' : (err.body.message || err.code))
        : 'Login failed — is the API running?';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async () => {
    setLoading(true);
    setError('');
    try {
      if (referralCode.trim()) {
        try { localStorage.setItem('convia_ref', referralCode.trim()); } catch { /* ignore */ }
      }
      await register(email, password, username.trim() || undefined, referralCode.trim() || undefined);
      setSuccess(true);
      setTimeout(() => switchTab('home'), 800);
    } catch (err) {
      const msg = err instanceof ApiError
        ? (err.code === 'username_taken' ? 'That username is taken — pick another' : (err.body.message || err.code))
        : 'Registration failed — is the API running?';
      setError(String(msg));
      setStep('credentials');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 8) { setError('Please enter a valid phone number'); return; }
    setError('');
    setLoading(true);
    try {
      await authApi.sendPhoneOtp(phone);
      setStep('otp');
    } catch (err) {
      // If phone OTP is not configured on the backend, fall through to email registration.
      if (err instanceof ApiError && (err.status === 501 || err.status === 503)) {
        await completeSignup();
        return;
      }
      // Still allow signup without phone verification when provider is down
      await completeSignup();
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.some((d) => !d)) { setError('Please enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      // Prefer completing email registration (backend register is the primary path).
      // Phone verify-otp creates sessions for phone-first users; we still register email account.
      await completeSignup();
    } catch (err) {
      const msg = err instanceof ApiError ? (err.body.message || err.code) : 'Verification failed';
      setError(String(msg));
      setLoading(false);
    }
  };

  const titles = { login: 'Welcome Back', signup: 'Create Account', 'forgot-password': 'Reset Password' };
  const subtitles = { login: 'Sign in to your Convia account', signup: "Join Africa's financial universe", 'forgot-password': "We'll send you a reset link" };

  if (success) {
    return <AuthSuccessView mode={mode} />;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div style={{ height: 12 }} />

      <div className="px-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <ConviaLogo size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>{titles[mode]}</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{subtitles[mode]}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'credentials' && (
            <CredentialsStep
              mode={mode}
              email={email} setEmail={setEmail}
              username={username} setUsername={setUsername}
              referralCode={referralCode} setReferralCode={setReferralCode}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              agreeTerms={agreeTerms} setAgreeTerms={setAgreeTerms}
              strength={strength}
              loading={loading}
              error={error}
              onSubmit={handleSubmit}
              onForgotPassword={() => navigate('forgot-password')}
              onQuickAccess={() => switchTab('home')}
              onSignup={() => navigate('signup')}
              onLogin={() => navigate('login')}
            />
          )}

          {step === 'phone' && (
            <PhoneStep phone={phone} setPhone={setPhone} error={error} onSubmit={handlePhoneSubmit} />
          )}

          {step === 'otp' && (
            <OtpStep phone={phone} otp={otp} setOtp={setOtp} loading={loading} error={error} onSubmit={handleOtpSubmit} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
