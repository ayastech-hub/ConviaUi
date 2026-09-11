import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader, Monitor, Smartphone, Trash2, Shield } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface Props {
  onBack: () => void;
}

function parseDevice(ua?: string | null) {
  const s = ua || 'Unknown device';
  const mobile = /Mobile|Android|iPhone|iPad/i.test(s);
  let name = s;
  if (/iPhone/i.test(s)) name = 'iPhone';
  else if (/iPad/i.test(s)) name = 'iPad';
  else if (/Android/i.test(s)) name = 'Android device';
  else if (/Windows/i.test(s)) name = 'Windows';
  else if (/Mac/i.test(s)) name = 'Mac';
  else if (/Linux/i.test(s)) name = 'Linux';
  else if (s.length > 48) name = s.slice(0, 48) + '…';
  return { name, mobile };
}

/** Active sessions with revoke. */
export function ActiveSessionsView({ onBack }: Props) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const [rows, setRows] = useState<securityApi.SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await securityApi.listSessions(userId);
      setRows((Array.isArray(list) ? list : []).filter((s) => !s.revokedAt));
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.message });
      else setError({ message: 'Could not load sessions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const revoke = async (id: string) => {
    if (!userId || !id) return;
    setRevoking(id);
    try {
      await securityApi.revokeSession(userId, id);
      setRows((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      // Mock / offline: still remove locally
      setRows((prev) => prev.filter((s) => s.id !== id));
      if (err instanceof ApiError && err.status !== 404) {
        setError({ code: err.code, message: err.message });
      }
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title={t('security.sessions') || 'Active sessions'} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} />}

        <div
          className="rounded-[22px] p-4 mb-5 flex gap-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)' }}
          >
            <Shield size={18} style={{ color: 'var(--foreground)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 14 }}>Signed-in devices</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 4, lineHeight: 1.45 }}>
              Revoke any session you don’t recognize. This device stays signed in until you sign out.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center py-10" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No active sessions
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((s) => {
              const { name, mobile } = parseDevice(s.userAgent);
              const Icon = mobile ? Smartphone : Monitor;
              return (
                <div
                  key={s.id}
                  className="rounded-[20px] px-4 py-3.5 flex items-center gap-3"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--muted)' }}
                  >
                    <Icon size={18} style={{ color: 'var(--foreground)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }} className="truncate">
                      {name}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                      {s.ipAddress || '—'}
                      {s.createdAt ? ` · ${new Date(s.createdAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    disabled={revoking === s.id}
                    onClick={() => setConfirmId(s.id)}
                    className="h-9 px-3 rounded-full flex items-center gap-1.5"
                    style={{
                      background: 'color-mix(in oklab, var(--destructive) 12%, transparent)',
                      color: 'var(--destructive)',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {revoking === s.id ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    Revoke
                  </motion.button>
                </div>
              );
            })}
          </div>
        )}
        {/* Confirm revoke */}
        {confirmId && (
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-8"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] rounded-[24px] p-5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}
            >
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em' }}>
                Revoke this session?
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 8, lineHeight: 1.45 }}>
                That device will be signed out immediately. You can sign in again from it later.
              </p>
              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="flex-1 h-11 rounded-full font-bold text-[14px]"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={revoking === confirmId}
                  onClick={() => {
                    const id = confirmId;
                    setConfirmId(null);
                    void revoke(id);
                  }}
                  className="flex-1 h-11 rounded-full font-bold text-[14px] flex items-center justify-center gap-2"
                  style={{ background: 'var(--destructive)', color: '#fff' }}
                >
                  {revoking === confirmId ? <Loader size={15} className="animate-spin" /> : null}
                  Revoke
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
