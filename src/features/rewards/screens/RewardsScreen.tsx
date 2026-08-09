import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Flame, Gift, Star, Zap, Trophy, ChevronRight, Calendar, TrendingUp, Send, Megaphone, CheckCircle2, Globe, Handshake, Gem, Loader, X } from 'lucide-react';
import { ReferralModal } from '../../../shared/components/ReferralModal';

interface RewardsScreenProps {
  goBack: () => void;
}

const initialBadges = [
  { name: 'First Trade', icon: Trophy, desc: 'Completed first trade', earned: true },
  { name: 'Speed Sender', icon: Zap, desc: 'Sent 10 payments', earned: true },
  { name: 'DeFi Explorer', icon: Globe, desc: 'Used off-ramp 5 times', earned: true },
  { name: 'Social Star', icon: Star, desc: 'Got 100 followers', earned: false },
  { name: 'OTC Master', icon: Handshake, desc: 'Complete 50 OTC trades', earned: false },
  { name: 'Diamond Hands', icon: Gem, desc: 'Hold BTC for 90 days', earned: false },
];

const initialTasks = [
  { id: 'daily-login', label: 'Daily login', points: 10, done: true, icon: Calendar },
  { id: 'complete-trade', label: 'Complete 1 trade', points: 25, done: true, icon: TrendingUp },
  { id: 'send-friend', label: 'Send to 1 friend', points: 20, done: false, icon: Send },
  { id: 'share-post', label: 'Share a post', points: 15, done: false, icon: Megaphone },
  { id: 'complete-kyc', label: 'Complete KYC', points: 100, done: true, icon: CheckCircle2 },
];

type RedeemState = 'idle' | 'processing' | 'success';

export function RewardsScreen({ goBack }: RewardsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'badges'>('overview');
  const [showReferral, setShowReferral] = useState(false);
  const [points, setPoints] = useState(2450);
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState<string | null>(null);
  const [redeemState, setRedeemState] = useState<RedeemState>('idle');
  const [redeemAmount, setRedeemAmount] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const claimTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id && !t.done) {
        setPoints(p => p + t.points);
        showToast(`+${t.points} points earned!`);
        return { ...t, done: true };
      }
      return t;
    }));
  };

  const startRedeem = () => {
    setRedeemState('processing');
    setTimeout(() => {
      const amt = parseInt(redeemAmount) || 0;
      const pts = amt * 1000;
      if (pts > 0 && pts <= points) {
        setPoints(p => p - pts);
        setRedeemState('success');
      } else {
        setRedeemState('idle');
        showToast('Insufficient points');
      }
    }, 2000);
  };

  const maxRedeem = Math.floor(points / 1000);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
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
              background: 'var(--foreground)',
              boxShadow: '0 16px 48px var(--muted)',
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #C4B5FD, transparent)', transform: 'translate(20%,-30%)' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={20} style={{ color: 'var(--muted-foreground)' }} />
                <span className="text-white opacity-80" style={{ fontSize: 14 }}>Convia Points</span>
              </div>
              <motion.p
                key={points}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-white mb-1"
                style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2 }}
              >
                {points.toLocaleString()}
              </motion.p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 16 }}>
                ≈ ${(points / 1000).toFixed(2)} USDT value · Level 3 Trader
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (points / 3600) * 100)}%`, background: 'var(--foreground)' }} />
                </div>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{points.toLocaleString()} / 3,600 to Level 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 p-4 rounded-[20px]" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--muted)' }}
            >
              <Flame size={28} style={{ color: 'var(--muted-foreground)' }} />
            </motion.div>
            <div className="flex-1">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 24, fontWeight: 900 }}>7 Days</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Day streak · Earn 10pts/day</p>
            </div>
            <div className="text-right">
              <p style={{ color: 'var(--muted-foreground)', fontWeight: 700, fontSize: 14 }}>+70 pts</p>
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
                  { label: 'Total Earned', value: '12,340 pts', icon: Trophy, color: 'var(--muted-foreground)' },
                  { label: 'This Month', value: `${points.toLocaleString()} pts`, icon: Star, color: 'var(--muted-foreground)' },
                  { label: 'Referrals', value: '3 friends', icon: Gift, color: 'var(--foreground)' },
                  { label: 'Redeemable', value: `$${(points / 1000).toFixed(2)}`, icon: Zap, color: 'var(--foreground)' },
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
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRedeemState('processing')} className="w-full py-3.5 rounded-[16px] text-white mb-3 glass-refraction" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}>
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
                  <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: task.done ? 0.7 : 1 }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: task.done ? 'var(--muted)' : 'var(--muted)' }}>
                      <TaskIcon size={18} style={{ color: task.done ? 'var(--primary)' : 'var(--primary)' }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</p>
                      <p style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>+{task.points} pts</p>
                    </div>
                    {task.done ? (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => claimTask(task.id)}
                        className="px-3 py-1.5 rounded-[10px]"
                        style={{ background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 700 }}
                      >
                        Claim
                      </motion.button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-3 gap-3">
              {initialBadges.map(badge => {
                const BadgeIcon = badge.icon;
                return (
                  <div key={badge.name} className="flex flex-col items-center p-3 rounded-[16px] text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: badge.earned ? 1 : 0.4 }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: badge.earned ? 'var(--muted)' : 'var(--muted)' }}>
                      <BadgeIcon size={20} style={{ color: badge.earned ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                    </div>
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{badge.name}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 10, lineHeight: 1.3 }}>{badge.desc}</p>
                    {badge.earned && (
                      <div className="mt-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)' }}>
                        <span style={{ color: 'var(--foreground)', fontSize: 9, fontWeight: 700 }}>EARNED</span>
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

      {/* Redeem Modal */}
      <AnimatePresence>
        {redeemState !== 'idle' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => redeemState === 'processing' ? null : setRedeemState('idle')}
              className="absolute inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6"
              style={{ background: 'var(--card)' }}
            >
              {redeemState === 'processing' && (
                <>
                  <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ background: 'var(--muted)' }} />
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
                      <Loader size={28} className="animate-spin" style={{ color: 'var(--foreground)' }} />
                    </div>
                    <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Redeem Points</h3>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>1,000 points = $1 USDT</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3" style={{ background: 'var(--muted)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={redeemAmount}
                      onChange={e => setRedeemAmount(e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 700 }}
                    />
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>USDT</span>
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>
                    Available: {points.toLocaleString()} pts · Max redeem: ${maxRedeem}
                  </p>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setRedeemState('idle')} className="flex-1 py-3.5 rounded-[14px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                      Cancel
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={startRedeem} className="flex-1 py-3.5 rounded-[14px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                      Redeem
                    </motion.button>
                  </div>
                </>
              )}
              {redeemState === 'success' && (
                <div className="flex flex-col items-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'var(--muted)' }}
                  >
                    <CheckCircle2 size={40} style={{ color: 'var(--foreground)' }} />
                  </motion.div>
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Redemption Successful!</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
                    ${redeemAmount || '0'} USDT has been added to your wallet
                  </p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setRedeemState('idle'); setRedeemAmount(''); }} className="w-full py-3.5 rounded-[14px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
                    Done
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-[14px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          >
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} code="ADE2026" reward="500 pts" />
    </div>
  );
}
