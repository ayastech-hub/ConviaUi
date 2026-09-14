import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';
import type { Screen } from '../../../shared/data/mockData';
import { passwordStrength } from '../components/passwordStrength';
import { CredentialsStep } from '../components/CredentialsStep';
import { OtpStep } from '../components/OtpStep';
import { AuthSuccessView } from '../components/AuthSuccessView';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { ApiError } from '../../../shared/api/types';
import * as authApi from '../../../shared/api/auth';
import { PageTop } from '../../../shared/components/PageTop';
import { countryFromIso, type PhoneCountry } from '../components/phoneCountries';

// Native biometric login (`BiometricStep`) intentionally not imported here —
// see the comment at the top of `../components/BiometricStep.tsx` for why.
// On web, submitting login credentials goes straight to the success state.

interface AuthScreenProps {
  mode: 'login' | 'signup' | 'forgot-password';
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

type Step = 'credentials' | 'otp';

export function AuthScreen({ mode, navigate, goBack, switchTab }: AuthScreenProps) {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
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
  const [phoneNational, setPhoneNational] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => countryFromIso('NG'));
  const [phoneE164, setPhoneE164] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('credentials');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);


  useEffect(() => {
    if (mode !== 'signup') return;
    const e = email.trim().toLowerCase();
    if (!e) { setEmailStatus('idle'); return; }
    if (!e.includes('@') || e.length < 5) { setEmailStatus(e.includes('@') ? 'invalid' : 'idle'); return; }
    setEmailStatus('checking');
    const tmr = setTimeout(() => {
      void authApi
        .checkEmailAvailable(e)
        .then((r) => setEmailStatus(r.available ? 'available' : 'taken'))
        .catch(() => setEmailStatus('idle'));
    }, 450);
    return () => clearTimeout(tmr);
  }, [email, mode]);

  // Live username availability
  useEffect(() => {
    if (mode !== 'signup') return;
    const u = username.trim().toLowerCase();
    if (!u) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/i.test(u)) {
      setUsernameStatus(u.length < 3 ? 'idle' : 'invalid');
      return;
    }
    setUsernameStatus('checking');
    const tmr = setTimeout(() => {
      void authApi
        .checkUsernameAvailable(u)
        .then((r) => setUsernameStatus(r.available ? 'available' : 'taken'))
        .catch(() => setUsernameStatus('idle'));
    }, 400);
    return () => clearTimeout(tmr);
  }, [username, mode]);


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
      if (emailStatus === 'taken') { setError('This email is already registered. Sign in instead.'); return; }
      if (username.trim() && usernameStatus === 'taken') { setError('That username is taken — pick another'); return; }
      if (username.trim() && usernameStatus === 'invalid') { setError('Username must be 3–24 letters, numbers, or _'); return; }
      setLoading(true);
      try {
        await authApi.sendEmailOtp(email.trim().toLowerCase());
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
      } catch (err) {
        if (err instanceof ApiError) {
          const code = String(err.code || err.body?.code || '').toLowerCase();
          if (code.includes('email_taken') || code.includes('already')) {
            setError('This email is already registered. Try signing in.');
          } else if (err.status === 503 || err.status === 501) {
            // OTP provider down — register directly
            await completeSignup();
            return;
          } else {
            setError(String(err.body?.message || err.message || 'Could not send verification code'));
          }
        } else {
          // Network / unknown — try direct register
          await completeSignup();
          return;
        }
      } finally {
        setLoading(false);
      }
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
      // Never reveal whether email or password was wrong; never surface infra messages
      if (err instanceof ApiError) {
        const code = String(err.code || err.body?.code || '').toLowerCase();
        const status = err.status;
        if (
          status === 401 ||
          status === 403 ||
          code.includes('invalid') ||
          code.includes('credential') ||
          code.includes('unauthorized') ||
          code.includes('not_found')
        ) {
          setError('Account or password is incorrect');
        } else if (status >= 500 || code.includes('internal')) {
          setError('Something went wrong. Please try again in a moment.');
        } else {
          setError('Account or password is incorrect');
        }
      } else {
        setError('Unable to sign in right now. Check your connection and try again.');
      }
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
      void phoneE164; // stored for profile phone update after register when API supports it
      await register(email, password, username.trim() || undefined, referralCode.trim() || undefined);
      setSuccess(true);
      setTimeout(() => switchTab('home'), 800);
    } catch (err) {
      if (err instanceof ApiError) {
        const code = String(err.code || err.body?.code || '').toLowerCase();
        if (code.includes('username')) setError('That username is taken — pick another');
        else if (code.includes('email') || code.includes('already')) setError('This email is already registered. Try signing in.');
        else if (err.status >= 500) setError('Something went wrong. Please try again in a moment.');
        else setError('Could not create account. Please check your details and try again.');
      } else {
        setError('Unable to register right now. Check your connection and try again.');
      }
      setStep('credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.some((d) => !d)) { setError('Please enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const code = otp.join('');
      try {
        await authApi.verifyEmailOtp(email.trim().toLowerCase(), code);
      } catch (err) {
        if (err instanceof ApiError && (err.code === 'otp_invalid' || err.status === 401)) {
          setError('Invalid or expired code. Try again or resend.');
          setLoading(false);
          return;
        }
        // If verify endpoint missing (old deploy), continue to register
      }
      await completeSignup();
    } catch (err) {
      const msg = err instanceof ApiError ? (err.body.message || err.code) : 'Verification failed';
      setError(String(msg));
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await authApi.sendEmailOtp(email.trim().toLowerCase());
      setOtp(['', '', '', '', '', '']);
    } catch {
      setError('Could not resend code. Try again.');
    }
  };

  const titles = { login: t('auth.welcomeBack'), signup: t('auth.createAccount'), 'forgot-password': t('auth.resetPassword') };
  const subtitles = { login: t('auth.signInSubtitle'), signup: t('auth.signupSubtitle'), 'forgot-password': t('auth.resetSubtitle') };

  if (success) {
    return <AuthSuccessView mode={mode} />;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="px-6 flex-1 flex flex-col pb-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-5"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <ConviaLogo size={28} color="var(--foreground)" />
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
            {titles[mode]}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 8, lineHeight: 1.45, maxWidth: 280 }}>
            {subtitles[mode]}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'credentials' && (
            <CredentialsStep
              mode={mode}
              email={email} setEmail={setEmail}
              username={username} setUsername={setUsername}
              usernameStatus={usernameStatus}
              emailStatus={emailStatus}
              phoneNational={phoneNational}
              setPhoneNational={setPhoneNational}
              phoneCountry={phoneCountry}
              setPhoneCountry={setPhoneCountry}
              onPhoneE164={setPhoneE164}
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
              onOpenTerms={() => navigate('terms')}
              onOpenPrivacy={() => navigate('privacy')}
              onLogin={() => navigate('login')}
            />
          )}

          {step === 'otp' && (
            <OtpStep email={email} otp={otp} setOtp={setOtp} loading={loading} error={error} onSubmit={handleOtpSubmit} onResend={handleResendOtp} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
