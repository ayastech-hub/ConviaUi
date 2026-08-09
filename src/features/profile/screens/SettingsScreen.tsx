import { useState } from 'react';
import { Bell, Globe, Moon, Sun } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { ConviaLogo } from '../../../shared/components/ConviaLogo';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ListSection } from '../../../shared/components/ListSection';
import { ListRow } from '../../../shared/components/ListRow';
import { ToggleSwitch } from '../../../shared/components/ToggleSwitch';
import { CurrencyPickerView } from '../components/CurrencyPickerView';
import { SignOutButton } from '../components/SignOutButton';

interface SettingsScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
  darkMode?: boolean;
  toggleDark?: () => void;
}

export function SettingsScreen({ goBack }: SettingsScreenProps) {
  const { currency, setCurrency } = useCurrency();
  const [darkMode, setDarkMode] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);

  if (showCurrencyPicker) {
    return (
      <CurrencyPickerView
        currentCode={currency.code}
        onSelect={(c) => { setCurrency(c); setShowCurrencyPicker(false); }}
        onBack={() => setShowCurrencyPicker(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Settings" onBack={goBack} />

      <div className="flex-1 overflow-y-auto px-5">
        <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <ConviaLogo size={28} color="#FFFFFF" />
            </div>
            <div className="flex-1">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>Convia Finance</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Africa's Financial Universe</p>
            </div>
          </div>
        </div>

        <ListSection title="PREFERENCES">
          <ListRow
            icon={Globe}
            label="Currency"
            desc={`${currency.code} · ${currency.name}`}
            onClick={() => setShowCurrencyPicker(true)}
          />
          <ListRow
            icon={darkMode ? Moon : Sun}
            label="Dark Mode"
            desc={darkMode ? 'On' : 'Off'}
            trailing={<ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          />
          <ListRow
            icon={Bell}
            label="Push Notifications"
            desc="Transaction & security alerts"
            trailing={<ToggleSwitch checked={notifications} onChange={() => setNotifications(!notifications)} />}
          />
          <ListRow
            icon={Bell}
            label="Email Notifications"
            desc="Weekly summary & alerts"
            trailing={<ToggleSwitch checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />}
          />
          <ListRow
            icon={Bell}
            label="Price Alerts"
            desc="Crypto price movements"
            trailing={<ToggleSwitch checked={priceAlerts} onChange={() => setPriceAlerts(!priceAlerts)} />}
          />
        </ListSection>

        <div className="mb-4">
          <SignOutButton />
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textAlign: 'center', marginBottom: 20 }}>
          Convia Finance v2.4.1 · Built for Africa
        </p>
      </div>
    </div>
  );
}
