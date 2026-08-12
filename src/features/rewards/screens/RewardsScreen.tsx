import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Calendar, Send, RefreshCw, CheckCircle2, TrendingUp, type LucideIcon } from 'lucide-react';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import type { RewardTask } from '../components/rewardsData';
import { PointsCard, StreakCard } from '../components/PointsAndStreakCards';
import { OverviewTab, TasksTab, BadgesTab } from '../components/RewardsTabs';
import { useAuth } from '../../../shared/context/AuthContext';
import * as rewardsApi from '../../../shared/api/rewards';

interface RewardsScreenProps {
  goBack: () => void;
}

const ICON_BY_TYPE: Record<string, LucideIcon> = {
  daily_login: Calendar,
  'daily-login': Calendar,
  trade: TrendingUp,
  send: Send,
  swap: RefreshCw,
  kyc: CheckCircle2,
};

export function RewardsScreen({ goBack }: RewardsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'badges'>('overview');
  const [showReferral, setShowReferral] = useState(false);
  const { userId } = useAuth();
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralShare, setReferralShare] = useState('');
  const [referredCount, setReferredCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [profile, taskRes, codeRes, statsRes] = await Promise.all([
        rewardsApi.getRewardsProfile(userId).catch(() => null),
        rewardsApi.listRewardTasks(userId).catch(() => ({ tasks: [] as rewardsApi.LiveRewardTask[] })),
        rewardsApi.getReferralCode(userId).catch(() => null),
        rewardsApi.getReferralStats(userId).catch(() => null),
      ]);
      if (profile) {
        const pts = Number(
          (profile as { points?: number }).points ??
            (profile as { balance?: number }).balance ??
            (profile as { xp?: number }).xp ??
            0,
        );
        setPoints(pts);
      }
      const live: RewardTask[] = (taskRes.tasks || []).map((t) => ({
        id: t.id,
        label: t.title,
        points: t.points,
        done: !!t.claimed || !!t.completedAt,
        icon: ICON_BY_TYPE[t.type] || ICON_BY_TYPE[t.id] || TrendingUp,
      }));
      setTasks(live);
      if (codeRes?.code) {
        setReferralCode(codeRes.code);
        setReferralShare(codeRes.shareUrl || `https://convia.app/ref/${codeRes.code}`);
      }
      if (statsRes) {
        setReferredCount(
          Number(
            (statsRes as { referredCount?: number }).referredCount ??
              (statsRes as { count?: number }).count ??
              0,
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    void rewardsApi
      .recordDailyLogin(userId)
      .then((r) => {
        if (r && !(r as { alreadyClaimed?: boolean }).alreadyClaimed) {
          const pts = Number((r as { points?: number }).points ?? 0);
          if (pts) showToast(`Daily login +${pts} pts`);
          void refresh();
        }
      })
      .catch(() => {});
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const claimTask = async (id: string) => {
    if (!userId) {
      showToast('Sign in to claim');
      return;
    }
    try {
      const res = await rewardsApi.claimRewardTask(userId, id);
      setPoints((p) => p + (res.points || 0));
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true } : t)));
      showToast(`Claimed +${res.points || 0} pts`);
      void refresh();
    } catch {
      showToast('Could not claim (not eligible yet)');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={goBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Rewards</h2>
        {loading && (
          <span style={{ color: 'var(--muted-foreground)', fontSize: 11, marginLeft: 'auto' }}>Syncing…</span>
        )}
      </div>

      <PointsCard points={points} />
      <div className="px-5 mb-3">
        <StreakCard />
      </div>

      <div className="px-5 mb-3 flex gap-2">
        {(['overview', 'tasks', 'badges'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize"
            style={{
              background: activeTab === tab ? 'var(--primary)' : 'var(--muted)',
              color: activeTab === tab ? '#fff' : 'var(--muted-foreground)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {activeTab === 'overview' && (
          <OverviewTab
            points={points}
            referredCount={referredCount}
            onInvite={() => setShowReferral(true)}
            onRedeem={() => showToast('Redeem coming soon')}
          />
        )}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} onClaim={claimTask} />}
        {activeTab === 'badges' && <BadgesTab badges={[]} />}
        {!userId && (
          <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
            Sign in to load rewards and referral code.
          </p>
        )}
      </div>

      <ReferralModal
        open={showReferral}
        onClose={() => setShowReferral(false)}
        code={referralCode || '—'}
        shareUrl={referralShare}
        reward="Invite friends"
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 left-5 right-5 py-3 px-4 rounded-2xl text-center text-sm font-semibold text-white z-50"
            style={{ background: 'var(--foreground)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
