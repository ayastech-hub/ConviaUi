import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Send,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Handshake,
  Gem,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { ReferralModal } from '../../../shared/components/ReferralModal';
import type { RewardTask, Badge } from '../components/rewardsData';
import { PointsCard, StreakCard } from '../components/PointsAndStreakCards';
import { OverviewTab, TasksTab, BadgesTab } from '../components/RewardsTabs';
import { useAuth } from '../../../shared/context/AuthContext';
import * as rewardsApi from '../../../shared/api/rewards';
import { ApiError } from '../../../shared/api/types';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { useToast } from '../../../shared/context/ToastContext';

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
  const [referralCode, setReferralCode] = useState('');
  const [referralShare, setReferralShare] = useState('');
  const [referredCount, setReferredCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([])

  const { success, error, warning, info } = useToast();
  const showToast = (msg: string, tone: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    if (tone === 'success') success(msg);
    else if (tone === 'error') error(msg);
    else if (tone === 'warning') warning(msg);
    else info(msg);
  };

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [profile, taskRes, badgeRes, codeRes, statsRes] = await Promise.all([
        rewardsApi.getRewardsProfile(userId).catch(() => null),
        rewardsApi.listRewardTasks(userId).catch(() => ({ tasks: [] as rewardsApi.LiveRewardTask[] })),
        rewardsApi.listBadges(userId).catch(() => ({ badges: [] as rewardsApi.LiveBadge[] })),
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
      if (badgeRes?.badges) {
        const iconFor = (key: string): LucideIcon => {
          if (key.includes('kyc')) return ShieldCheck;
          if (key.includes('referral')) return Handshake;
          if (key.includes('volume') || key.includes('trade') || key.includes('swap')) return TrendingUp;
          if (key.includes('deposit')) return Gem;
          return Trophy;
        };
        setBadges(
          badgeRes.badges.map((b) => ({
            name: b.name,
            desc: b.description,
            earned: !!b.earned,
            icon: iconFor(b.key),
          })),
        );
      }

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
      showToast('Sign in to claim', 'warning');
      return;
    }
    if (claimingId) return;
    const task = tasks.find((x) => x.id === id);
    if (task && !task.canClaim && !task.completed) {
      showToast('Finish the task before claiming', 'warning');
      return;
    }
    if (task?.expired) {
      showToast('Task expired — claim window closed', 'warning');
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
      showToast(`Claimed +${res.points || 0} pts${usdt}`, 'success');
      void refresh();
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? String(e.body?.message || e.message || 'Claim failed')
          : e instanceof Error
            ? e.message
            : 'Could not claim';
      showToast(msg, 'error');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-5">
        <BackButton onClick={goBack} />
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>
          Rewards
        </h2>
        {loading && (
          <span style={{ color: 'var(--muted-foreground)', fontSize: 11, marginLeft: 'auto' }}>Syncing…</span>
        )}
      </div>

      <PointsCard points={points} />
      <div className="px-5 mb-4">
        <StreakCard />
      </div>

      <div className="px-5 mb-4">
        <div
          className="grid grid-cols-3 gap-1 p-1 rounded-2xl"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {([
            { id: 'overview' as const, label: 'Overview' },
            { id: 'tasks' as const, label: 'Tasks' },
            { id: 'badges' as const, label: 'Badges' },
          ]).map((tab) => {
            const on = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="h-10 rounded-xl text-[13px] font-bold"
                style={{
                  background: on ? 'var(--liquid-chip-on-bg)' : 'transparent',
                  color: on ? 'var(--liquid-chip-on-text)' : 'var(--liquid-chip-off-text)',
                  border: on ? '1.5px solid var(--liquid-chip-on-border)' : '1px solid transparent',
                  boxShadow: on ? 'var(--liquid-chip-on-shadow)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
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
        {activeTab === 'badges' && <BadgesTab badges={badges} />}
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
    </div>
  );
}
