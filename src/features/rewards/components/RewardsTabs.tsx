import { motion } from 'motion/react';
import { Trophy, Star, Gift, Zap, CheckCircle2 } from 'lucide-react';
import type { Badge, RewardTask } from './rewardsData';

interface OverviewTabProps {
  points: number;
  onRedeem: () => void;
  onInvite: () => void;
  referredCount?: number;
}

/** "Overview" tab: quick stats grid, redeem button, and invite-friends button. */
export function OverviewTab({ points, onRedeem, onInvite, referredCount = 0 }: OverviewTabProps) {
  const stats = [
    { label: 'Points balance', value: `${points.toLocaleString()} pts`, icon: Trophy, color: 'var(--muted-foreground)' },
    { label: 'This session', value: `${points.toLocaleString()} pts`, icon: Star, color: 'var(--muted-foreground)' },
    { label: 'Referrals', value: `${referredCount} friends`, icon: Gift, color: 'var(--foreground)' },
    { label: 'Est. value', value: `$${(points / 1000).toFixed(2)}`, icon: Zap, color: 'var(--foreground)' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => {
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
      <motion.button whileTap={{ scale: 0.97 }} onClick={onRedeem} className="w-full py-3.5 rounded-[16px] text-white mb-3 glass-refraction" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}>
        Redeem Points
      </motion.button>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onInvite} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
        Invite Friends (+500 pts each)
      </motion.button>
    </>
  );
}

interface TasksTabProps {
  tasks: RewardTask[];
  onClaim: (id: string) => void;
}

/** "Tasks" tab: claimable point-earning tasks. */
export function TasksTab({ tasks, onClaim }: TasksTabProps) {
  if (!tasks.length) {
    return (
      <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        No live tasks yet. Complete trades, swaps, or daily login when tasks are published.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => {
        const TaskIcon = task.icon;
        return (
          <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: task.done ? 0.7 : 1 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
              <TaskIcon size={18} style={{ color: 'var(--primary)' }} />
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
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => onClaim(task.id)} className="px-3 py-1.5 rounded-[10px]" style={{ background: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                Claim
              </motion.button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** "Badges" tab: earned/locked achievement badges. */
export function BadgesTab({ badges }: { badges: Badge[] }) {
  if (!badges.length) {
    return (
      <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Achievements will appear here when earned (no mock badges).
      </p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge) => {
        const BadgeIcon = badge.icon;
        return (
          <div key={badge.name} className="flex flex-col items-center p-3 rounded-[16px] text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)', opacity: badge.earned ? 1 : 0.4 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: 'var(--muted)' }}>
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
  );
}
