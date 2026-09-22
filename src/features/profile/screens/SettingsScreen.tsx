import type { ReactNode } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  MessageSquare,
  Loader,
  Eye,
  EyeOff,
  User,
  Shield,
  CreditCard,
  Gift,
  HelpCircle,
  Info,
  FileText,
  Headphones,
  KeyRound,
  BookUser,
  SlidersHorizontal,
  ChevronLeft,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { ToggleSwitch } from '../../../shared/components/ToggleSwitch';
import { CurrencyPickerView } from '../components/CurrencyPickerView';
import { SignOutButton } from '../components/SignOutButton';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import { useAuth } from '../../../shared/context/AuthContext';
import * as notifApi from '../../../shared/api/notifications';
import * as rewardsApi from '../../../shared/api/rewards';
import { PageTop } from '../../../shared/components/PageTop';

interface SettingsScreenProps {
  goBack: () => void;
  navigate?: (s: Screen, param?: string) => void;
  darkMode?: boolean;
  themePref?: 'system' | 'light' | 'dark';
  setThemePref?: (p: 'system' | 'light' | 'dark') => void;
  toggleDark?: () => void;
}

type PrefChannel = 'in_app' | 'email' | 'sms' | 'push';
type Panel = null | 'notifications' | 'preferences';

function maskEmail(email?: string | null) {
  if (!email) return 'Account';
  const [u, d] = email.split('@');
  if (!d) return email;
  if (u.length <= 3) return `${u[0] || ''}***@${d}`;
  return `${u.slice(0, 3)}***${u.slice(-2)}@${d}`;
}

/** Clean Bitget-style row: bare icon, no chip, no trailing chevron. */
function SettingRow({
  icon: Icon,
  label,
  sub,
  onClick,
  trailing,
  last,
}: {
  icon: typeof User;
  label: string;
  sub?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  last?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={!onClick && !trailing}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
      style={{
        borderBottom: last ? undefined : '1px solid color-mix(in oklab, var(--border) 80%, transparent)',
        background: 'transparent',
      }}
    >
      <Icon size={20} strokeWidth={1.85} style={{ color: 'var(--foreground)', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p style={{ color: 'var(--foreground)', fontWeight: 500, fontSize: 15, lineHeight: 1.25 }}>{label}</p>
        {sub ? (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 3, lineHeight: 1.3 }}>{sub}</p>
        ) : null}
      </div>
      {trailing}
    </motion.button>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-3"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {children}
    </div>
  );
}

export function SettingsScreen({
  goBack,
  navigate,
  darkMode: darkProp,
  themePref = 'system',
  setThemePref,
  toggleDark,
}: SettingsScreenProps) {
  const { currency, setCurrency } = useCurrency();
  const [darkMode, setDarkMode] = useState(darkProp ?? true);
  const [hideBalance, setHideBalance] = useState(() => {
    try {
      return localStorage.getItem('convia.hideBalance') === '1';
    } catch {
      return false;
    }
  });
  const toggleHideBalance = () => {
    setHideBalance((v) => {
      const next = !v;
      try {
        localStorage.setItem('convia.hideBalance', next ? '1' : '0');
        window.dispatchEvent(new Event('convia-hide-balance'));
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [panel, setPanel] = useState<Panel>(null);

  const { userId, email, username } = useAuth();

  const [prefs, setPrefs] = useState<Record<PrefChannel, boolean>>({
    in_app: true,
    email: true,
    sms: false,
    push: true,
  });
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [saving, setSaving] = useState<PrefChannel | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);

  useEffect(() => {
    if (darkProp !== undefined) setDarkMode(darkProp);
  }, [darkProp]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await rewardsApi.getReferralCode(userId);
        if (!cancelled && res?.code) setRefCode(res.code);
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loadPrefs = useCallback(async () => {
    if (!userId) return;
    setLoadingPrefs(true);
    setPrefError(null);
    try {
      const res = await notifApi.getPreferences(userId);
      const channels = (res as { channels?: Record<string, boolean> })?.channels || res;
      if (channels && typeof channels === 'object') {
        setPrefs((prev) => ({
          ...prev,
          in_app: channels.in_app ?? prev.in_app,
          email: channels.email ?? prev.email,
          sms: channels.sms ?? prev.sms,
          push: channels.push ?? prev.push,
        }));
      }
    } catch {
      setPrefError('Could not load notification preferences');
    } finally {
      setLoadingPrefs(false);
    }
  }, [userId]);

  useEffect(() => {
    if (panel === 'notifications') void loadPrefs();
  }, [panel, loadPrefs]);

  const setChannel = async (ch: PrefChannel, value: boolean) => {
    if (!userId) return;
    setSaving(ch);
    setPrefs((p) => ({ ...p, [ch]: value }));
    try {
      await notifApi.updatePreferences(userId, { [ch]: value });
    } catch {
      setPrefs((p) => ({ ...p, [ch]: !value }));
      setPrefError('Could not save preference');
    } finally {
      setSaving(null);
    }
  };

  const go = (s: Screen) => navigate?.(s);

  const accountLabel = username ? `@${username}` : maskEmail(email);

  if (showCurrencyPicker) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <PageTop />
        <CurrencyPickerView
          selected={currency.code}
          onSelect={(c) => {
            setCurrency(c);
            setShowCurrencyPicker(false);
          }}
          onBack={() => setShowCurrencyPicker(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Centered title + bare back */}
      <div className="relative flex items-center justify-center px-4 pt-1 pb-4 min-h-[44px]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => (panel ? setPanel(null) : goBack())}
          aria-label="Back"
          className="absolute left-3 flex items-center justify-center p-1"
          style={{ background: 'transparent', border: 'none' }}
        >
          <ChevronLeft size={24} strokeWidth={2.35} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h1 style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 17 }}>
          {panel === 'notifications' ? 'Notifications' : panel === 'preferences' ? 'Preferences' : 'Settings'}
        </h1>
      </div>

      <div className="px-4 pb-28 flex-1">
        <AnimatePresence mode="wait">
          {panel === null && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Account */}
              <Card>
                <SettingRow
                  icon={KeyRound}
                  label={accountLabel}
                  sub="Manage security settings, name, and avatar"
                  onClick={() => go('edit-profile')}
                  last
                />
              </Card>

              {/* Security */}
              <Card>
                <SettingRow icon={Shield} label="Security" onClick={() => go('security')} last />
              </Card>

              {/* Main group — Convia features */}
              <Card>
                <SettingRow
                  icon={CreditCard}
                  label="Payment methods"
                  sub="Banks and payout accounts"
                  onClick={() => go('payment-methods')}
                />
                <SettingRow
                  icon={FileText}
                  label="Identity verification"
                  sub="KYC status and documents"
                  onClick={() => go('kyc')}
                />
                <SettingRow
                  icon={BookUser}
                  label="Address book"
                  sub="Saved recipients"
                  onClick={() => go('payment-methods')}
                />
                <SettingRow
                  icon={Bell}
                  label="Notifications"
                  onClick={() => setPanel('notifications')}
                />
                <SettingRow
                  icon={SlidersHorizontal}
                  label="Preferences"
                  sub="Theme, currency, balance"
                  onClick={() => setPanel('preferences')}
                />
                <SettingRow
                  icon={Gift}
                  label="Referral"
                  sub={refCode ? `Code ${refCode}` : 'Invite friends'}
                  onClick={() => setShowReferral(true)}
                  last
                />
              </Card>

              {/* About / legal */}
              <Card>
                <SettingRow icon={Info} label="About Convia" onClick={() => go('about')} />
                <SettingRow icon={FileText} label="Privacy policy" onClick={() => go('privacy')} />
                <SettingRow icon={FileText} label="Terms of service" onClick={() => go('terms')} last />
              </Card>

              {/* Help row */}
              <div className="flex gap-3 mt-4 mb-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => go('support-center')}
                  className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <Headphones size={22} strokeWidth={1.85} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}>
                    Get help
                  </span>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => go('help-center')}
                  className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <HelpCircle size={22} strokeWidth={1.85} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}>
                    Help center
                  </span>
                </motion.button>
              </div>

              <div className="mt-4">
                <SignOutButton />
              </div>
            </motion.div>
          )}

          {panel === 'notifications' && (
            <motion.div
              key="notif"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              {loadingPrefs && (
                <div className="flex items-center gap-2 px-1 mb-3">
                  <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Loading…</span>
                </div>
              )}
              {prefError && (
                <p className="px-1 mb-2" style={{ color: 'var(--destructive)', fontSize: 12 }}>
                  {prefError}
                </p>
              )}
              <Card>
                <SettingRow
                  icon={Bell}
                  label="In-app"
                  sub={saving === 'in_app' ? 'Saving…' : 'Inbox inside the app'}
                  trailing={
                    <ToggleSwitch
                      checked={prefs.in_app}
                      onChange={() => void setChannel('in_app', !prefs.in_app)}
                    />
                  }
                />
                <SettingRow
                  icon={Smartphone}
                  label="Push"
                  sub={saving === 'push' ? 'Saving…' : 'Device alerts'}
                  trailing={
                    <ToggleSwitch checked={prefs.push} onChange={() => void setChannel('push', !prefs.push)} />
                  }
                />
                <SettingRow
                  icon={Mail}
                  label="Email"
                  sub={saving === 'email' ? 'Saving…' : 'Receipts and security'}
                  trailing={
                    <ToggleSwitch
                      checked={prefs.email}
                      onChange={() => void setChannel('email', !prefs.email)}
                    />
                  }
                />
                <SettingRow
                  icon={MessageSquare}
                  label="SMS"
                  sub={saving === 'sms' ? 'Saving…' : 'Optional text alerts'}
                  trailing={
                    <ToggleSwitch checked={prefs.sms} onChange={() => void setChannel('sms', !prefs.sms)} />
                  }
                  last
                />
              </Card>
            </motion.div>
          )}

          {panel === 'preferences' && (
            <motion.div
              key="prefs"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Card>
                <SettingRow
                  icon={themePref === 'light' ? Sun : themePref === 'dark' ? Moon : Monitor}
                  label="Theme"
                  sub={
                    themePref === 'system'
                      ? 'System'
                      : themePref === 'light'
                        ? 'Light'
                        : 'Dark'
                  }
                  trailing={
                    <div className="flex gap-1">
                      {(['system', 'light', 'dark'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setThemePref?.(p);
                            if (p !== 'system' && toggleDark) {
                              const wantDark = p === 'dark';
                              if (wantDark !== darkMode) toggleDark();
                            }
                            setDarkMode(p === 'dark' || (p === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize"
                          style={{
                            background:
                              themePref === p
                                ? 'color-mix(in oklab, var(--primary) 22%, transparent)'
                                : 'var(--muted)',
                            color: themePref === p ? 'var(--primary)' : 'var(--muted-foreground)',
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  }
                />
                <SettingRow
                  icon={Globe}
                  label="Display currency"
                  sub={currency.code}
                  onClick={() => setShowCurrencyPicker(true)}
                />
                <SettingRow
                  icon={hideBalance ? EyeOff : Eye}
                  label="Hide balances"
                  sub="On home and account"
                  trailing={<ToggleSwitch checked={hideBalance} onChange={toggleHideBalance} />}
                  last
                />
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ReferralModal
        open={showReferral}
        onClose={() => setShowReferral(false)}
        code={refCode || '—'}
        reward="Bonus on signup"
      />
    </div>
  );
}
