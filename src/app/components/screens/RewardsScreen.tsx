import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Flame, Gift, Star, Zap, Trophy, ChevronRight, Calendar, TrendingUp, Send, Megaphone, CheckCircle2, Globe, Handshake, Gem } from 'lucide-react';
import { ReferralModal } from '../ReferralModal';

interface RewardsScreenProps {
  goBack: () => void;
}

const badges = [
  { name: 'First Trade', icon: Trophy, desc: 'Completed first trade', earned: true },
  { name: 'Speed Sender', icon: Zap, desc: 'Sent 10 payments', earned: true },
  { name: 'DeFi Explorer', icon: Globe, desc: 'Used off-ramp 5 times', earned: true },
  { name: 'Social Star', icon: Star, desc: 'Got 100 followers', earned: false },
  { name: 'OTC Master', icon: Handshake, desc: 'Complete 50 OTC trades', earned: false },
  { name: 'Diamond Hands', icon: Gem, desc: 'Hold BTC for 90 days', earned: false },
];

const tasks = [
  { label: 'Daily login', points: 10, done: true, icon: Calendar },
  { label: 'Complete 1 trade', points: 25, done: true, icon: TrendingUp },
  { label: 'Send to 1 friend', points: 20, done: false, icon: Send },
  { label: 'Share a post', points: 15, done: false, icon: Megaphone },
  { label: 'Complete KYC', points: 100, done: true, icon: CheckCircle2 },
];

export function RewardsScreen({ goBack }: RewardsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'badges'>('overview');
  const [showReferral, setShowReferral] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Rewards</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Points card */}
        <div className="px-5 mb-4">
          <div
            className="rounded-[24px] p-5 relative overflow-hidden glass-refraction"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.95), rgba(67,56,202,0.95))',
              boxShadow: '0 16px 48px rgba(99,102,241,0.3)',
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)', transform: 'translate(20%,-30%)' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={20} style={{ color: '#C4B5FD' }} />
                <span className="text-white opacity-80" style={{ fontSize: 14 }}>Convia Points</span>
              </div>
              <p className="text-white mb-1" style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2 }}>2,450</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 16 }}>
                ≈ $2.45 USDT value · Level 3 Trader
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-full rounded-full" style={{ width: '68%', background: 'linear-gradient(90deg, #C4B5FD, #818CF8)' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>2,450 / 3,600 to Level 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 p-4 rounded-[20px]" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.2)' }}
            >
              <Flame size={28} style={{ color: '#F59E0B' }} />
            </motion.div>
            <div className="flex-1">
              <p style={{ color: '#F59E0B', fontSize: 24, fontWeight: 900 }}>7 Days</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Day streak · Earn 10pts/day</p>
            </div>
            <div className="text-right">
              <p style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14 }}>+70 pts</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>this week</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mb-4">
          <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: 'var(--muted)' }}>
            {(['overview', 'tasks', 'badges'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2 rounded-[10px] capitalize" style={{ background: activeTab === tab ? 'var(--card)' : 'transparent', color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Total Earned', value: '12,340 pts', icon: Trophy, color: '#F59E0B' },
                  { label: 'This Month', value: '2,450 pts', icon: Star, color: '#3B82F6' },
                  { label: 'Referrals', value: '3 friends', icon: Gift, color: '#6366F1' },
                  { label: 'Redeemable', value: '$2.45', icon: Zap, color: '#6366F1' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="p-4 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${stat.color}18` }}>
                        <Icon size={16} style={{ color: stat.color }} />
                      </div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{stat.value}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-[16px] text-white mb-3 glass-refraction" style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                Redeem Points
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReferral(true)} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                Invite Friends (+500 pts each)
              </motion.button>
            </>
          )}

          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-2">
              {tasks.map(task => {
                const TaskIcon = task.icon;
                return (
                <div key={task.label} className="flex items-center gap-3 p-3.5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: task.done ? 0.7 : 1 }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: task.done ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)' }}>
                    <TaskIcon size={18} style={{ color: task.done ? 'var(--primary)' : '#6366F1' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</p>
                    <p style={{ color: '#818CF8', fontSize: 12, fontWeight: 600 }}>+{task.points} pts</p>
                  </div>
                  {task.done ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  ) : (
                    <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                  )}
                </div>
                );
              })}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-3 gap-3">
              {badges.map(badge => {
                const BadgeIcon = badge.icon;
                return (
                <div key={badge.name} className="flex flex-col items-center p-3 rounded-[16px] text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: badge.earned ? 1 : 0.4 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: badge.earned ? 'rgba(99,102,241,0.12)' : 'var(--muted)' }}>
                    <BadgeIcon size={20} style={{ color: badge.earned ? '#6366F1' : 'var(--muted-foreground)' }} />
                  </div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{badge.name}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 10, lineHeight: 1.3 }}>{badge.desc}</p>
                  {badge.earned && (
                    <div className="mt-2 px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)' }}>
                      <span style={{ color: 'var(--primary)', fontSize: 9, fontWeight: 700 }}>EARNED</span>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 32 }} />
      </div>

      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} code="ADE2026" reward="500 pts" />
    </div>
  );
}
