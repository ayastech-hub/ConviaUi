import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Bell, Globe, Moon, Sun, Shield, HelpCircle,
  LogOut, Info, User, CreditCard, Mail, ChevronDown, Check, X
} from 'lucide-react';
import type { Screen } from '../../data/mockData';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';
import { ConviaLogo } from '../ConviaLogo';

interface SettingsScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
  darkMode?: boolean;
  toggleDark?: () => void;
}

export function SettingsScreen({ goBack, navigate }: SettingsScreenProps) {
  const { currency, setCurrency } = useCurrency();
  const [darkMode, setDarkMode] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);

  if (showCurrencyPicker) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCurrencyPicker(false)} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Select Currency</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>All prices and balances across the app will use this currency.</p>
          <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
            {CURRENCIES.map((c, i) => (
              <motion.button
                key={c.code}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCurrency(c); setShowCurrencyPicker(false); }}
                className="flex items-center gap-3 px-4 py-3.5 w-full"
                style={{ borderBottom: i < CURRENCIES.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>{c.flag}</span>
                </div>
                <div className="flex-1 text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{c.code} · {c.name}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>1 USD = {c.symbol}{c.rate.toLocaleString()}</p>
                </div>
                {currency.code === c.code && <Check size={18} style={{ color: 'var(--primary)' }} />}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'ACCOUNT',
      items: [
        { icon: User, label: 'Personal Info', desc: 'Name, email, phone', action: () => navigate('profile') },
        { icon: CreditCard, label: 'Payment Methods', desc: 'Cards & bank accounts', action: () => navigate('payment-methods') },
        { icon: Mail, label: 'KYC Verification', desc: 'Identity verification', action: () => navigate('kyc') },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { icon: Globe, label: 'Currency', desc: `${currency.code} · ${currency.name}`, action: () => setShowCurrencyPicker(true) },
        { icon: darkMode ? Moon : Sun, label: 'Dark Mode', desc: darkMode ? 'On' : 'Off', toggle: { value: darkMode, onChange: () => setDarkMode(!darkMode) } },
        { icon: Bell, label: 'Push Notifications', desc: 'Transaction & security alerts', toggle: { value: notifications, onChange: () => setNotifications(!notifications) } },
        { icon: Mail, label: 'Email Notifications', desc: 'Weekly summary & alerts', toggle: { value: emailNotifs, onChange: () => setEmailNotifs(!emailNotifs) } },
        { icon: Bell, label: 'Price Alerts', desc: 'Crypto price movements', toggle: { value: priceAlerts, onChange: () => setPriceAlerts(!priceAlerts) } },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { icon: HelpCircle, label: 'Help Center', desc: 'FAQs & guides', action: () => navigate('help-center') },
        { icon: Info, label: 'About Convia', desc: 'Terms, privacy, licenses', action: () => navigate('about') },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="rounded-[20px] p-5 mb-4 glass-card glass-refraction" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.95))', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
              <ConviaLogo size={28} color="#FFFFFF" />
            </div>
            <div className="flex-1">
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>Convia Finance</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Africa's Financial Universe</p>
            </div>
          </div>
        </div>

        {sections.map((section, si) => (
          <div key={si} className="mb-4">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10, fontWeight: 600 }}>{section.title}</p>
            <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    onClick={item.action}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderBottom: i < section.items.length - 1 ? '1px solid var(--border)' : 'none', cursor: item.action || item.toggle ? 'pointer' : 'default' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                      <Icon size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{item.label}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{item.desc}</p>
                    </div>
                    {item.toggle ? (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); item.toggle!.onChange(); }}
                        className="w-12 h-7 rounded-full flex items-center px-1 transition-colors"
                        style={{ background: item.toggle.value ? 'var(--primary)' : 'var(--switch-background)', justifyContent: item.toggle.value ? 'flex-end' : 'flex-start' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-white" />
                      </motion.button>
                    ) : (
                      <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-[16px] mb-4 flex items-center justify-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 700, fontSize: 15, border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <LogOut size={16} />
          Sign Out
        </motion.button>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textAlign: 'center', marginBottom: 20 }}>
          Convia Finance v2.4.1 · Built for Africa
        </p>
      </div>
    </div>
  );
}
