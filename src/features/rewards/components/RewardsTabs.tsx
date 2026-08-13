import { motion } from 'motion/react';
import { Trophy, Star, Gift, Zap, CheckCircle2 } from 'lucide-react';
import type { Badge, RewardTask } from './rewardsData';

interface OverviewTabProps {
  points: number;
  onGoToTasks: () => void;
  onInvite: () => void;
  referredCount?: number;
  verifiedCount?: number;
  unverifiedCount?: number;
}

export function OverviewTab({
  points,
  onGoToTasks,
  onInvite,
  referredCount = 0,
  verifiedCount = 0,
  unverifiedCount = 0,
}: OverviewTabProps) {
  const stats = [
    {
      label: 'Points balance',
      value: `${points.toLocaleString()} pts`,
      icon: Trophy,
    },
    {
      label: 'Total invites',
      value: `${referredCount}`,
      icon: Gift,
    },
    {
      label: 'Verified (KYC)',
      value: `${verifiedCount}`,
      icon: Star,
    },
    {
      label: 'Pending KYC',
      value: `${unverifiedCount}`,
      icon: Zap,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-4 rounded-[16px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: 'var(--muted)' }}
              >
                <Icon size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{stat.value}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onGoToTasks}
        className="w-full py-3.5 rounded-[16px] mb-3"
        style={{
          background: 'var(--primary)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        Claim task rewards
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onInvite}
        className="w-full py-3.5 rounded-[16px]"
        style={{
          background: 'var(--card)',
          color: 'var(--foreground)',
          fontWeight: 600,
          fontSize: 14,
          border: '1px solid var(--border)',
        }}
      >
        Invite friends (reward after their KYC)
      </motion.button>
    </>
  );
}

interface TasksTabProps {
  tasks: RewardTask[];
  onClaim: (id: string) => void;
  claimingId?: string | null;
}

export function TasksTab({ tasks, onClaim, claimingId }: TasksTabProps) {
  if (!tasks.length) {
    return (
      <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        No live tasks yet. Complete trades, swaps, or referrals when admin publishes tasks.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => {
        const TaskIcon = task.icon;
        const busy = claimingId === task.id;
        const claimable = !task.done && !task.expired && (task.canClaim || task.completed);

        return (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3.5 rounded-[16px]"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              opacity: task.done || task.expired ? 0.75 : 1,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--muted)' }}
            >
              <TaskIcon size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: task.done ? 'line-through' : 'none',
                }}
              >
                {task.label}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
                +{task.points} pts
                {claimable ? ' · ready to claim' : ''}
                {task.expired && !task.done ? ' · expired' : ''}
                {!task.completed && !task.done && !task.expired ? ' · in progress' : ''}
              </p>
            </div>
            {task.done ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary)' }}
              >
                <CheckCircle2 size={16} color="#fff" />
              </div>
            ) : task.expired ? (
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Expired</span>
            ) : claimable ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                disabled={!!claimingId}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClaim(task.id);
                }}
                className="px-3.5 py-2 rounded-[12px] shrink-0"
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  opacity: claimingId && !busy ? 0.55 : 1,
                }}
              >
                {busy ? 'Claiming…' : 'Claim'}
              </motion.button>
            ) : (
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>In progress</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BadgesTab({ badges }: { badges: Badge[] }) {
  if (!badges.length) {
    return (
      <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Achievements will appear here when earned.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge) => {
        const BadgeIcon = badge.icon;
        return (
          <div
            key={badge.name}
            className="p-3 rounded-[16px] flex flex-col items-center text-center"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              opacity: badge.earned ? 1 : 0.45,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
              style={{ background: 'var(--muted)' }}
            >
              <BadgeIcon
                size={20}
                style={{ color: badge.earned ? 'var(--primary)' : 'var(--muted-foreground)' }}
              />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 11, marginBottom: 2 }}>
              {badge.name}
            </p>
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
  );
}
