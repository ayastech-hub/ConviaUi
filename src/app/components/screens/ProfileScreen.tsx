import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Gift, Settings, ChevronRight, Zap, Copy, QrCode,
  TrendingUp, Users, Star, FileCheck, Bell, Moon, Sun, Camera, CreditCard,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cryptoAssets, portfolio, type Screen } from '../../data/mockData';
import { useCurrency } from '../../context/CurrencyContext';
import { ReferralModal } from '../ReferralModal';

interface ProfileScreenProps {
  navigate: (s: Screen) => void;
  darkMode: boolean;
  toggleDark: () => void;
}

const COLORS = ['#6366F1', '#627EEA', '#818CF8', '#F3BA2F', '#10B981', '#2775CA'];

export function ProfileScreen({ navigate, darkMode, toggleDark }: ProfileScreenProps) {
  const { format } = useCurrency();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showReferral, setShowReferral] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuItems = [
    { label: 'Security Center', icon: Shield, screen: 'security', badge: null },
    { label: 'Payment Methods', icon: CreditCard, screen: 'payment-methods', badge: null },
    { label: 'Rewards & Points', icon: Gift, screen: 'rewards', badge: '2,450 pts', badgeColor: '#F59E0B', badgeBg: 'rgba(245,158,11,0.15)' },
    { label: 'Notifications', icon: Bell, screen: 'notifications', badge: '2', badgeColor: '#EF4444', badgeBg: 'rgba(239,68,68,0.15)' },
    { label: 'Settings', icon: Settings, screen: 'settings', badge: null },
  ] as const;

  const pieData = cryptoAssets.map((a, i) => ({
    name: a.symbol, value: a.valueUSD, color: COLORS[i] ?? '#64748B',
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-6">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Profile</h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
          style={{ border: '1px solid var(--border)' }}
        >
          {darkMode
            ? <Sun size={17} style={{ color: '#F59E0B' }} />
            : <Moon size={17} style={{ color: '#3B82F6' }} />}
        </motion.button>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-5">
        <div
          className="rounded-[24px] p-5 relative overflow-hidden glass-card glass-refraction"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366F1, transparent)', transform: 'translate(30%,-30%)' }} />

          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div
              className="rounded-[22px] flex items-center justify-center text-white relative"
              style={{ width: 72, height: 72, background: avatar ? 'transparent' : 'linear-gradient(135deg, #6366F1, #4F46E5)', fontSize: 26, fontWeight: 800, boxShadow: '0 8px 24px rgba(99,102,241,0.3)', overflow: 'hidden' }}
            >
              {avatar ? (
                <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                'AM'
              )}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--primary)', border: '2px solid var(--card)' }}
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
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 6 }}>@ade_mensah · Lagos, NG</p>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(99,102,241,0.15)', width: 'fit-content' }}>
                <FileCheck size={11} style={{ color: 'var(--primary)' }} />
                <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 600 }}>KYC Verified</span>
              </div>
            </div>
          </div>

          {/* Wallet address */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] mb-4" style={{ background: 'var(--muted)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              0x4f3a...7B2E · 0.842 ETH
            </span>
            <motion.button whileTap={{ scale: 0.9 }}>
              <Copy size={13} style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('receive')}>
              <QrCode size={13} style={{ color: 'var(--primary)' }} />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Portfolio', value: format(portfolio.totalUSD), icon: TrendingUp, color: '#6366F1' },
              { label: 'Followers', value: '1,247', icon: Users, color: 'var(--primary)' },
              { label: 'Trades', value: '342', icon: Star, color: '#F59E0B' },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-3 rounded-[14px] text-center glass-card" style={{ border: '1px solid var(--border)' }}>
                  <Icon size={16} style={{ color: stat.color, margin: '0 auto 4px' }} />
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{stat.value}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Portfolio Allocation */}
      <div className="px-5 mb-5">
        <div className="rounded-[20px] p-4 glass-card" style={{ border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Allocation</p>
          <div className="flex items-center gap-4">
            <div style={{ width: 100, height: 100 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => format(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              {cryptoAssets.map((a, i) => (
                <div key={a.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] ?? '#64748B' }} />
                    <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>{a.symbol}</span>
                  </div>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                    {((a.valueUSD / portfolio.totalUSD) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-5 mb-5">
        <div className="rounded-[20px] overflow-hidden glass-card" style={{ border: '1px solid var(--border)' }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(item.screen)}
                className="w-full flex items-center gap-3 px-4 py-4"
                style={{ borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <Icon size={17} style={{ color: 'var(--primary)' }} />
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

      {/* Referral */}
      <div className="px-5 mb-5">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowReferral(true)}
          className="p-4 rounded-[20px] flex items-center gap-3 glass-card glass-refraction"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Gift size={20} style={{ color: '#818CF8' }} />
          </div>
          <div className="flex-1">
            <p style={{ color: '#FFF', fontWeight: 700, fontSize: 14 }}>Refer Friends & Earn</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>$10 USDT per referral · Code: ADE2026</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="px-3 py-2 rounded-xl"
            style={{ background: '#6366F1', color: '#FFF', fontSize: 12, fontWeight: 700, boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
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
          className="w-full py-3.5 rounded-[16px]"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 600, fontSize: 14, border: '1px solid rgba(239,68,68,0.2)' }}
        >
          Sign Out
        </motion.button>
      </div>

      <div style={{ height: 100 }} />
    </div>
  );
}
