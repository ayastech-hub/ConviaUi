import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Monitor, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import type { SessionRow } from '../../../shared/api/security';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ApiError } from '../../../shared/api/types';

interface ActiveSessionsViewProps {
  onBack: () => void;
}

/** Login history from GET /security/:userId/sessions (UserSession rows). */
export function ActiveSessionsView({ onBack }: ActiveSessionsViewProps) {
  const { userId } = useAuth();
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    securityApi
      .listSessions(userId)
      .then((list) => {
        if (!cancelled) setRows(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) setError({ code: err.code, message: err.message });
        else setError({ message: 'Could not load sessions' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Active sessions" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 12 }}>
          Devices and IPs from recent logins. Revoking other sessions requires backend support (use Sign out for this device).
        </p>
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} />}
        {loading && (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <p className="text-center py-8" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No sessions found
          </p>
        )}
        <div className="rounded-[16px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {rows.map((s, i) => (
            <motion.div
              key={s.id || i}
              className="flex items-start gap-3 px-4 py-3.5"
              style={{
                background: 'var(--card)',
                borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <Monitor size={18} style={{ color: 'var(--muted-foreground)', marginTop: 2 }} />
              <div className="min-w-0 flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }} className="truncate">
                  {s.userAgent || 'Unknown device'}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                  {s.ipAddress || '—'} ·{' '}
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}
                  {s.revokedAt ? ' · revoked' : ''}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
