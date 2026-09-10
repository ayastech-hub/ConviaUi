import { useState, useEffect, useCallback } from 'react';
import { Bell, Globe, Moon, Sun, Mail, Smartphone, MessageSquare, Loader, Eye, EyeOff } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ListSection } from '../../../shared/components/ListSection';
import { ListRow } from '../../../shared/components/ListRow';
import { ToggleSwitch } from '../../../shared/components/ToggleSwitch';
import { CurrencyPickerView } from '../components/CurrencyPickerView';
import { SignOutButton } from '../components/SignOutButton';
import { useAuth } from '../../../shared/context/AuthContext';
import { useLanguage } from '../../../shared/context/LanguageContext';
import * as notifApi from '../../../shared/api/notifications';
import * as profileApi from '../../../shared/api/profile';
import { FeatureAlert } from '../../../shared/components/FeatureAlert';

interface SettingsScreenProps {
  goBack: () => void;
  navigate?: (s: Screen) => void;
  darkMode?: boolean;
  themePref?: 'system' | 'light' | 'dark';
  setThemePref?: (p: 'system' | 'light' | 'dark') => void;
  toggleDark?: () => void;
}

type PrefChannel = 'in_app' | 'email' | 'sms' | 'push';

export function SettingsScreen({ goBack, darkMode: darkProp, themePref = 'system', setThemePref, toggleDark }: SettingsScreenProps) {
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
  const { userId } = useAuth();
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<Record<PrefChannel, boolean>>({
    in_app: true,
    email: false,
    sms: false,
    push: true,
  });
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

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
          const ch = p.channel as PrefChannel;
          if (ch in next) next[ch] = Boolean(p.enabled);
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
      setPrefError(`Could not save ${channel} preference`);
      void loadPrefs();
    } finally {
      setSaving(null);
    }
  };

  if (showCurrencyPicker) {
    return (
      <CurrencyPickerView
        currentCode={currency.code}
        onSelect={(c) => {
          setCurrency(c);
          setShowCurrencyPicker(false);
          if (userId) void profileApi.updateMyProfile({ preferredCurrency: c.code });
        }}
        onBack={() => setShowCurrencyPicker(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title={t('settings.title')} subtitle="Display, language, and alerts" onBack={goBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {prefError && <FeatureAlert reason="generic" message={prefError} />}

        <ListSection title={t('settings.appearance')}>
                    <div className="mb-1 px-1">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Theme</p>
            <div
              className="grid grid-cols-3 gap-1 p-1 rounded-2xl"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              {([
                { id: 'system' as const, label: 'System' },
                { id: 'light' as const, label: 'Light' },
                { id: 'dark' as const, label: 'Dark' },
              ]).map((o) => {
                const on = themePref === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setThemePref?.(o.id)}
                    className="h-10 rounded-xl text-[13px] font-bold"
                    style={{
                      background: on ? 'var(--liquid-chip-on-bg)' : 'transparent',
                      color: on ? 'var(--liquid-chip-on-text)' : 'var(--liquid-chip-off-text)',
                      border: on ? '1px solid var(--liquid-chip-on-border)' : '1px solid transparent',
                      boxShadow: on ? 'var(--liquid-chip-on-shadow)' : 'none',
                    }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
}
          />
          <ListRow
            icon={Globe}
            label={t('settings.currency')}
            desc={`${currency.code}${currency.name ? ` · ${currency.name}` : ''}`}
            onClick={() => setShowCurrencyPicker(true)}
          />
          <ListRow
            icon={hideBalance ? EyeOff : Eye}
            label="Hide balances"
            desc="Blur amounts on Home and Wallet"
            trailing={<ToggleSwitch checked={hideBalance} onChange={toggleHideBalance} />}
          />
        </ListSection>

        <ListSection title={t('settings.notifications')}>
          {loadingPrefs && (
            <div className="flex items-center gap-2 px-1 mb-2">
              <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Loading preferences…</span>
            </div>
          )}
          <ListRow
            icon={Bell}
            label={t('settings.notifInApp')}
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
            label={t('settings.notifPush')}
            desc={saving === 'push' ? 'Saving…' : 'Device push notifications'}
            trailing={
              <ToggleSwitch checked={prefs.push} onChange={() => void setChannel('push', !prefs.push)} />
            }
          />
          <ListRow
            icon={Mail}
            label={t('settings.notifEmail')}
            desc={saving === 'email' ? 'Saving…' : 'Receipts and security'}
            trailing={
              <ToggleSwitch checked={prefs.email} onChange={() => void setChannel('email', !prefs.email)} />
            }
          />
          <ListRow
            icon={MessageSquare}
            label={t('settings.notifSms')}
            desc={saving === 'sms' ? 'Saving…' : 'Optional text alerts'}
            trailing={
              <ToggleSwitch checked={prefs.sms} onChange={() => void setChannel('sms', !prefs.sms)} />
            }
          />
        </ListSection>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
