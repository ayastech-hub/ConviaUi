import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { DepositRecord } from './types';

const STATUS_MAP = {
  confirmed: { bg: 'var(--muted)', color: 'var(--positive)', icon: CheckCircle2, label: 'Confirmed' },
  pending: { bg: 'var(--muted)', color: 'var(--warning)', icon: Clock, label: 'Pending' },
  failed: { bg: 'var(--muted)', color: 'var(--destructive)', icon: AlertTriangle, label: 'Failed' },
} as const;

/** Small pill showing a deposit's status (confirmed/pending/failed). */
export function StatusBadge({ status }: { status: DepositRecord['status'] }) {
  const map = STATUS_MAP[status];
  const Icon = map.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, background: map.bg, color: map.color, fontSize: 10, fontWeight: 700 }}>
      <Icon size={11} />
      {map.label}
    </span>
  );
}
