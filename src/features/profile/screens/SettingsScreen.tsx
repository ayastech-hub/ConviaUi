import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Mail,
  Smartphone,
  MessageSquare,
  Loader,
  Eye,
  EyeOff,
  User,
  FileCheck,
  Shield,
  CreditCard,
  Gift,
  HelpCircle,
  Info,
  FileText,
  Headphones,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ListSection } from '../../../shared/components/ListSection';
import { ListRow } from '../../../shared/components/ListRow';
import { ToggleSwitch } from '../../../shared/components/ToggleSwitch';
import { CurrencyPickerView } from '../components/CurrencyPickerView';
import { SignOutButton } from '../components/SignOutButton';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import { useAuth } from '../../../shared/context/AuthContext';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
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
  const { userId } = useAuth();
  const { t } = useLanguage();
  const { isApproved, isPending, isRejected } = useKycStatus();
  const [prefs, setPrefs] = useState<Record<PrefChannel, boolean>>({
    in_app: true,
    email: false,
    sms: false,
    push: true,
  });
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    void rewardsApi
      .getReferralCode(userId)
      .then((r) => setRefCode(String(r?.code || '')))
      .catch(() => undefined);
  }, [userId]);

  const loadPrefs = useCallback(async () => {
    if (!userId) return;
    setLoadingPrefs(true);
    setPrefError(null);
    try {
      const raw = await notifApi.getNotificationPreferences(userId);
      const list = Array.isArray(raw) ? raw : [];
      setPrefs((prev) => {
        const next = { ...prev };
        for (const p of list) {
          const ch = (p as { channel?: string }).channel as PrefChannel;
          if (ch in next) next[ch] = Boolean((p as { enabled?: boolean }).enabled);
        }
        return next;
      });
    } catch {
      setPrefError('Could not load notification preferences');
    } finally {
      setLoadingPrefs(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadPrefs();
  }, [loadPrefs]);

  const setChannel = async (channel: PrefChannel, enabled: boolean) => {
    setPrefs((p) => ({ ...p, [channel]: enabled }));
    if (!userId) return;
    setSaving(channel);
    setPrefError(null);
    try {
      await notifApi.setNotificationPreference(userId, channel, enabled);
      if (channel === 'push') {
        await notifApi.setNotificationPreference(userId, 'in_app', enabled);
        setPrefs((p) => ({ ...p, in_app: enabled }));
      }
    } catch {
      setPrefError('Could not save preference');
      void loadPrefs();
    } finally {
      setSaving(null);
    }
  };

  const go = (s: Screen) => {
    if (navigate) navigate(s);
  };

  const kycDesc = isApproved
    ? 'Verified'
    : isPending
      ? 'In review'
      : isRejected
        ? 'Action needed'
        : 'Required for withdrawals and bills';

  if (showCurrencyPicker) {
    return (
      <CurrencyPickerView
        onBack={() => setShowCurrencyPicker(false)}
        onSelect={(c) => {
          setCurrency(c);
          setShowCurrencyPicker(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <ScreenHeader title="Settings" onBack={goBack} />

      <div className="px-4 pb-28 space-y-1">
        {prefError && (
          <p className="mb-2 px-1" style={{ color: 'var(--destructive)', fontSize: 12 }}>
            {prefError}
          </p>
        )}

        <ListSection title="Account">
          <ListRow
            icon={User}
            label="Edit profile"
            desc="Name, username, photo"
            onClick={() => go('edit-profile')}
          />
          <ListRow
            icon={FileCheck}
            label="Identity verification"
            desc={kycDesc}
            onClick={() => go('kyc')}
          />
          <ListRow
            icon={Shield}
            label="Security"
            desc="PIN, password, devices, whitelist"
            onClick={() => go('security')}
          />
          <ListRow
            icon={CreditCard}
            label="Payment methods"
            desc="Bank accounts for cash-out"
            onClick={() => go('payment-methods')}
          />
          <ListRow
            icon={Gift}
            label="Referral"
            desc={refCode ? `Code ${refCode}` : 'Invite friends'}
            onClick={() => setShowReferral(true)}
          />
        </ListSection>

        <ListSection title="Appearance">
          <ListRow
            icon={darkMode ? Moon : Sun}
            label="Theme"
            desc={
              themePref === 'system' ? 'System' : themePref === 'light' ? 'Light' : 'Dark'
            }
            onClick={() => {
              const order: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
              const i = order.indexOf(themePref);
              const next = order[(i + 1) % order.length];
              setThemePref?.(next);
              if (next === 'light') setDarkMode(false);
              else if (next === 'dark') setDarkMode(true);
              else if (toggleDark) {
                /* system — leave to media */
              }
            }}
          />
          <div className="flex gap-2 px-1 pb-2">
            {(['system', 'light', 'dark'] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setThemePref?.(o)}
                className="flex-1 rounded-xl py-2 text-center capitalize"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  background: themePref === o ? 'var(--primary)' : 'var(--muted)',
                  color: themePref === o ? 'var(--primary-foreground, #0a0a0a)' : 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                {o}
              </button>
            ))}
          </div>
          <ListRow
            icon={Globe}
            label={t('settings.currency') || 'Display currency'}
            desc={`${currency.code}${currency.name ? ` · ${currency.name}` : ''}`}
            onClick={() => setShowCurrencyPicker(true)}
          />
          <ListRow
            icon={hideBalance ? EyeOff : Eye}
            label="Hide balances"
            desc="Blur amounts on Home"
            trailing={<ToggleSwitch checked={hideBalance} onChange={toggleHideBalance} />}
          />
        </ListSection>

        <ListSection title={t('settings.notifications') || 'Notifications'}>
          {loadingPrefs && (
            <div className="flex items-center gap-2 px-1 mb-2">
              <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Loading…</span>
            </div>
          )}
          <ListRow
            icon={Bell}
            label="In-app"
            desc={saving === 'in_app' ? 'Saving…' : 'Inbox inside the app'}
            trailing={
              <ToggleSwitch
                checked={prefs.in_app}
                onChange={() => void setChannel('in_app', !prefs.in_app)}
              />
            }
          />
          <ListRow
            icon={Smartphone}
            label="Push"
            desc={saving === 'push' ? 'Saving…' : 'Device push notifications'}
            trailing={
              <ToggleSwitch checked={prefs.push} onChange={() => void setChannel('push', !prefs.push)} />
            }
          />
          <ListRow
            icon={Mail}
            label="Email"
            desc={saving === 'email' ? 'Saving…' : 'Receipts and security'}
            trailing={
              <ToggleSwitch checked={prefs.email} onChange={() => void setChannel('email', !prefs.email)} />
            }
          />
          <ListRow
            icon={MessageSquare}
            label="SMS"
            desc={saving === 'sms' ? 'Saving…' : 'Optional text alerts'}
            trailing={
              <ToggleSwitch checked={prefs.sms} onChange={() => void setChannel('sms', !prefs.sms)} />
            }
          />
        </ListSection>

        <ListSection title="Support & legal">
          <ListRow
            icon={Headphones}
            label="Support center"
            desc="Chat and tickets"
            onClick={() => go('support-center')}
          />
          <ListRow icon={HelpCircle} label="Help center" onClick={() => go('help-center')} />
          <ListRow icon={Info} label="About Convia" onClick={() => go('about')} />
          <ListRow icon={FileText} label="Privacy policy" onClick={() => go('privacy')} />
          <ListRow icon={FileText} label="Terms of service" onClick={() => go('terms')} />
        </ListSection>

        <div className="mt-6">
          <SignOutButton />
        </div>
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
