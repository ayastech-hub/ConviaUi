import { useState, useEffect, useCallback } from 'react';
import { Bell, Globe, Moon, Sun, Mail, Smartphone, MessageSquare } from 'lucide-react';
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
import type { LocaleCode } from '../../../shared/i18n/strings';
import * as notifApi from '../../../shared/api/notifications';
import * as profileApi from '../../../shared/api/profile';
import { FeatureAlert } from '../../../shared/components/FeatureAlert';

interface SettingsScreenProps {
  goBack: () => void;
  navigate?: (s: Screen) => void;
  darkMode?: boolean;
  toggleDark?: () => void;
}

type PrefChannel = 'in_app' | 'email' | 'sms' | 'push';

export function SettingsScreen({ goBack, darkMode: darkProp, toggleDark }: SettingsScreenProps) {
  const { currency, setCurrency } = useCurrency();
  const [darkMode, setDarkMode] = useState(darkProp ?? true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const { userId } = useAuth();
  const { locale, setLocale, t, labels, suggestedForCountry } = useLanguage();
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
      <div style={{ height: 50 }} />
      <ScreenHeader title={t('settings.title')} onBack={goBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {prefError && <FeatureAlert reason="generic" message={prefError} />}

        <ListSection title={t('settings.appearance')}>
          <ListRow
            icon={darkMode ? Moon : Sun}
            label={t('settings.darkMode')}
            trailing={
              <ToggleSwitch
                checked={darkMode}
                onChange={() => {
                  setDarkMode((d) => !d);
                  toggleDark?.();
                }}
              />
            }
          />
          <ListRow
            icon={Globe}
            label={t('settings.currency')}
            desc={currency.code}
            onClick={() => setShowCurrencyPicker(true)}
          />
        </ListSection>

        
        <ListSection title={t('lang.title')}>
          <p className="text-xs px-1 mb-2" style={{ color: 'var(--muted-foreground)' }}>
            {t('lang.hint')}
          </p>
          <div className="flex flex-wrap gap-2 px-1 mb-3">
            {(Object.keys(labels) as LocaleCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: locale === code ? 'var(--primary)' : 'var(--muted)',
                  color: locale === code ? '#fff' : 'var(--foreground)',
                }}
              >
                {labels[code]}
              </button>
            ))}
          </div>
        </ListSection>

        <ListSection title={t('settings.notifications')}>
          {loadingPrefs && (
            <p className="text-xs px-1 mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Loading preferences…
            </p>
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
