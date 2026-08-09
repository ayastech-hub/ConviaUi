import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Shield, Gift, Settings, ChevronRight, Copy, QrCode,
  TrendingUp, Users, Star, FileCheck, Bell, Moon, Sun, Camera, CreditCard,
  HelpCircle, User, Wallet, LogOut, Award,
} from 'lucide-react';
import { portfolio, type Screen } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { ReferralModal } from '../../../shared/components/ReferralModal';

interface ProfileScreenProps {
  navigate: (s: Screen) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

export function ProfileScreen({ navigate, darkMode, toggleDark }: ProfileScreenProps) {
  const { format } = useCurrency();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showReferral, setShowReferral] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const accountItems = [
    { label: 'Edit Profile', icon: User, screen: 'edit-profile' as Screen, desc: 'Name, username, email, phone' },
    { label: 'Security Center', icon: Shield, screen: 'security' as Screen, desc: 'PIN, 2FA, devices' },
    { label: 'Payment Methods', icon: CreditCard, screen: 'payment-methods' as Screen, desc: 'Cards & bank accounts' },
    { label: 'KYC Verification', icon: FileCheck, screen: 'kyc' as Screen, desc: 'Identity verification' },
  ];

  const activityItems = [
    { label: 'Rewards & Points', icon: Gift, screen: 'rewards' as Screen, badge: '2,450 pts', badgeColor: 'var(--muted-foreground)', badgeBg: 'var(--muted)' },
    { label: 'Portfolio', icon: TrendingUp, screen: 'portfolio' as Screen, badge: null, badgeColor: '', badgeBg: '' },
    { label: 'Notifications', icon: Bell, screen: 'notifications' as Screen, badge: '2', badgeColor: 'var(--destructive)', badgeBg: 'var(--muted)' },
  ];

  const supportItems = [
    { label: 'Help Center', icon: HelpCircle, screen: 'help-center' as Screen, desc: 'FAQs & guides' },
    { label: 'About Convia', icon: Settings, screen: 'about' as Screen, desc: 'Terms, privacy, licenses' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-6">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>Profile</h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {darkMode ? <Sun size={17} style={{ color: 'var(--muted-foreground)' }} /> : <Moon size={17} style={{ color: 'var(--muted-foreground)' }} />}
        </motion.button>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-5">
        <div
          className="rounded-[24px] p-5 relative overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'transparent', transform: 'translate(30%,-30%)' }} />

          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div
              className="rounded-[22px] flex items-center justify-center text-white relative"
              style={{ width: 72, height: 72, background: avatar ? 'transparent' : 'var(--primary)', fontSize: 26, fontWeight: 800, boxShadow: 'none', overflow: 'hidden' }}
            >
              {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'AM'}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--secondary)', border: '2px solid var(--card)' }}
              >
                <Camera size={11} className="text-white" />
              </motion.button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setAvatar(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Ade Mensah</p>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 6 }}>@ade_mensah</p>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'var(--muted)', width: 'fit-content' }}>
                <FileCheck size={11} style={{ color: 'var(--foreground)' }} />
                <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}>KYC Verified</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Portfolio', value: format(portfolio.totalUSD), icon: Wallet, color: 'var(--foreground)' },
              { label: 'Followers', value: '1,247', icon: Users, color: 'var(--muted-foreground)' },
              { label: 'Trades', value: '342', icon: Award, color: 'var(--muted-foreground)' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-3 rounded-[14px] text-center" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <Icon size={16} style={{ color: stat.color, margin: '0 auto 4px' }} />
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{stat.value}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="px-5 mb-5">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>ACCOUNT</p>
        <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {accountItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(item.screen)}
                className="w-full flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < accountItems.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Icon size={17} style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="flex-1 text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{item.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{item.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Activity Section */}
      <div className="px-5 mb-5">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>ACTIVITY</p>
        <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {activityItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(item.screen)}
                className="w-full flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < activityItems.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Icon size={17} style={{ color: 'var(--foreground)' }} />
                </div>
                <span style={{ color: 'var(--foreground)', fontWeight: 500, fontSize: 14, flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-lg" style={{ background: item.badgeBg, color: item.badgeColor, fontSize: 11, fontWeight: 600 }}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Support Section */}
      <div className="px-5 mb-5">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>SUPPORT</p>
        <div className="rounded-[20px] overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {supportItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(item.screen)}
                className="w-full flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < supportItems.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Icon size={17} style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="flex-1 text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{item.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{item.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Settings link */}
      <div className="px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('settings')}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px]"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Settings size={17} style={{ color: 'var(--foreground)' }} />
          </div>
          <span style={{ color: 'var(--foreground)', fontWeight: 500, fontSize: 14, flex: 1, textAlign: 'left' }}>Settings</span>
          <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      {/* Referral */}
      <div className="px-5 mb-5">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReferral(true)}
          className="p-4 rounded-[20px] flex items-center gap-3"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Gift size={20} style={{ color: 'var(--foreground)' }} />
          </div>
          <div className="flex-1">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Refer Friends & Earn</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>$10 USDT per referral · Code: ADE2026</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="px-3 py-2 rounded-xl"
            style={{ background: 'var(--primary)', color: '#FFF', fontSize: 12, fontWeight: 700, boxShadow: 'none' }}
          >
            Share
          </motion.button>
        </motion.div>
      </div>

      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} code="ADE2026" reward="$10 USDT" />

      {/* Sign out */}
      <div className="px-5 mb-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2"
          style={{ background: 'var(--muted)', color: 'var(--destructive)', fontWeight: 600, fontSize: 14, border: '1px solid var(--muted)' }}
        >
          <LogOut size={16} />
          Sign Out
        </motion.button>
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
