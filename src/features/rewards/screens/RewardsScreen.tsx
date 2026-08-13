import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Calendar, Send, RefreshCw, CheckCircle2, TrendingUp, type LucideIcon } from 'lucide-react';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import type { RewardTask } from '../components/rewardsData';
import { PointsCard, StreakCard } from '../components/PointsAndStreakCards';
import { OverviewTab, TasksTab, BadgesTab } from '../components/RewardsTabs';
import { useAuth } from '../../../shared/context/AuthContext';
import * as rewardsApi from '../../../shared/api/rewards';
import { ApiError } from '../../../shared/api/types';

interface RewardsScreenProps {
  goBack: () => void;
}

const ICON_BY_TYPE: Record<string, LucideIcon> = {
  volume_usd: TrendingUp,
  trade_count: TrendingUp,
  trade: TrendingUp,
  referral: Send,
  social: RefreshCw,
  swap: RefreshCw,
  kyc: CheckCircle2,
  daily_login: Calendar,
};

export function RewardsScreen({ goBack }: RewardsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'badges'>('tasks');
  const [showReferral, setShowReferral] = useState(false);
  const { userId } = useAuth();
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralShare, setReferralShare] = useState('');
  const [referredCount, setReferredCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
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
      const live: RewardTask[] = (taskRes.tasks || []).map((t) => {
        const canClaim = !!t.canClaim;
        return {
          id: t.id,
          label: t.title,
          points: t.points,
          done: !!t.claimed,
          completed: !!t.completedAt,
          canClaim,
          expired: !!t.expired || t.status === 'expired',
          status: t.status,
          icon: ICON_BY_TYPE[t.type] || TrendingUp,
        };
      });
      setTasks(live);
      if (codeRes?.code) {
        setReferralCode(codeRes.code);
        setReferralShare(codeRes.shareUrl || `https://convia.app/ref/${codeRes.code}`);
      }
      if (statsRes) {
        const s = statsRes as {
          referralCount?: number;
          referredCount?: number;
          verifiedCount?: number;
          unverifiedCount?: number;
          count?: number;
        };
        setReferredCount(Number(s.referralCount ?? s.referredCount ?? s.count ?? 0));
        setVerifiedCount(Number(s.verifiedCount ?? 0));
        setUnverifiedCount(Number(s.unverifiedCount ?? 0));
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const claimTask = async (id: string) => {
    if (!userId) {
      showToast('Sign in to claim');
      return;
    }
    if (claimingId) return;
    const task = tasks.find((x) => x.id === id);
    if (task && !task.canClaim && !task.completed) {
      showToast('Finish the task before claiming');
      return;
    }
    if (task?.expired) {
      showToast('Task expired — claim window closed');
      return;
    }
    setClaimingId(id);
    try {
      const res = await rewardsApi.claimRewardTask(userId, id);
      setPoints((p) => p + (res.points || 0));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, done: true, canClaim: false, completed: true, status: 'claimed', expired: false }
            : t,
        ),
      );
      const usdt = res.usdtCredited && Number(res.usdtCredited) > 0 ? ` · +${res.usdtCredited} USDT` : '';
      showToast(`Claimed +${res.points || 0} pts${usdt}`);
      void refresh();
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.body?.message || e.message || 'Claim failed')
          : e instanceof Error
            ? e.message
            : 'Could not claim';
      showToast(msg);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
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
            verifiedCount={verifiedCount}
            unverifiedCount={unverifiedCount}
            onInvite={() => setShowReferral(true)}
            onGoToTasks={() => setActiveTab('tasks')}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksTab tasks={tasks} onClaim={(id) => void claimTask(id)} claimingId={claimingId} />
        )}
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
            className="absolute bottom-24 left-5 right-5 py-3 px-4 rounded-2xl text-center text-sm font-semibold z-50"
            style={{ background: 'var(--primary)', color: '#ffffff' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
