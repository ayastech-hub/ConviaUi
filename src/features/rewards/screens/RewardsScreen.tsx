import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import { initialBadges, initialTasks, type RedeemState } from '../components/rewardsData';
import { PointsCard, StreakCard } from '../components/PointsAndStreakCards';
import { OverviewTab, TasksTab, BadgesTab } from '../components/RewardsTabs';
import { RedeemModal } from '../components/RedeemModal';
import { useAuth } from '../../../shared/context/AuthContext';
import * as rewardsApi from '../../../shared/api/rewards';

interface RewardsScreenProps {
  goBack: () => void;
}

export function RewardsScreen({ goBack }: RewardsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'badges'>('overview');
  const [showReferral, setShowReferral] = useState(false);
  const { userId } = useAuth();
  const [points, setPoints] = useState(2450);

  useEffect(() => {
    if (!userId) return;
    rewardsApi.getRewardsProfile(userId).then((p) => {
      const pts = Number((p as { points?: number; balance?: number }).points ?? (p as { balance?: number }).balance ?? 0);
      if (pts) setPoints(pts);
    }).catch(() => {});
  }, [userId]);
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState<string | null>(null);
  const [redeemState, setRedeemState] = useState<RedeemState>('idle');
  const [redeemAmount, setRedeemAmount] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (!userId) return;
    rewardsApi.listRewardTasks(userId).then((res) => {
      const live = (res.tasks || []).map((t) => ({
        id: t.id,
        label: t.title,
        points: t.points,
        done: !!t.claimed,
        // incomplete tasks still shown; claim only succeeds if backend says canClaim
        icon: initialTasks[0]?.icon,
      }));
      if (live.length) setTasks(live as typeof initialTasks);
    }).catch(() => {});
  }, [userId]);

  const claimTask = async (id: string) => {
    if (!userId) {
      showToast('Sign in to claim');
      return;
    }
    try {
      const res = await rewardsApi.claimRewardTask(userId, id);
      setPoints((p) => p + (res.points || 0));
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true, canClaim: false } : t)));
      const extra = res.usdtCredited && Number(res.usdtCredited) > 0 ? ` · +${res.usdtCredited} USDT` : '';
      showToast(`+${res.points} points claimed!${extra}`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Claim failed');
    }
  };

  const startRedeem = () => {
    setRedeemState('processing');
    setTimeout(() => {
      const amt = parseInt(redeemAmount) || 0;
      const pts = amt * 1000;
      if (pts > 0 && pts <= points) {
        setPoints((p) => p - pts);
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
        <PointsCard points={points} />
        <StreakCard />

        <div className="px-5 mb-4">
          <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: 'var(--muted)' }}>
            {(['overview', 'tasks', 'badges'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2 rounded-[10px] capitalize" style={{ background: activeTab === tab ? 'var(--card)' : 'transparent', color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5">
          {activeTab === 'overview' && (
            <OverviewTab points={points} onRedeem={() => setRedeemState('processing')} onInvite={() => setShowReferral(true)} />
          )}
          {activeTab === 'tasks' && <TasksTab tasks={tasks} onClaim={claimTask} />}
          {activeTab === 'badges' && <BadgesTab badges={initialBadges} />}
        </div>

        <div style={{ height: 32 }} />
      </div>

      <RedeemModal
        redeemState={redeemState}
        points={points}
        maxRedeem={maxRedeem}
        redeemAmount={redeemAmount}
        setRedeemAmount={setRedeemAmount}
        onCancel={() => setRedeemState('idle')}
        onRedeem={startRedeem}
        onDone={() => { setRedeemState('idle'); setRedeemAmount(''); }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ReferralModal open={showReferral} onClose={() => setShowReferral(false)} code="ADE2026" reward="500 pts" />
    </div>
  );
}
