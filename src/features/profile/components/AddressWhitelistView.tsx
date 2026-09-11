import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader, Plus, Trash2, Shield, Link2 } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';

interface Props {
  onBack: () => void;
}

const CHAINS: { id: 'evm' | 'solana' | 'bitcoin' | 'tron'; label: string }[] = [
  { id: 'evm', label: 'EVM' },
  { id: 'solana', label: 'Solana' },
  { id: 'tron', label: 'TRON' },
  { id: 'bitcoin', label: 'Bitcoin' },
];

/** Enterprise withdrawal address whitelist. */
export function AddressWhitelistView({ onBack }: Props) {
  const { userId } = useAuth();
  const [rows, setRows] = useState<securityApi.WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [chain, setChain] = useState<'evm' | 'solana' | 'bitcoin' | 'tron'>('evm');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const list = await securityApi.listWhitelist(userId);
      setRows(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.message });
      else setError({ message: 'Could not load whitelist' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  const add = async () => {
    if (!userId || !address.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await securityApi.addWhitelist(userId, chain, address.trim());
      setAddress('');
      await load();
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.message });
      else setError({ message: 'Could not add address' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: securityApi.WhitelistEntry) => {
    if (!userId) return;
    const key = `${entry.chainType}:${entry.address}`;
    setRemoving(key);
    try {
      await securityApi.removeWhitelist(userId, entry.chainType, entry.address);
      await load();
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.message });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title="Whitelist" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />}

        {/* Hero */}
        <div
          className="rounded-[24px] p-4 mb-5 flex gap-3 items-start"
          style={{
            background: 'color-mix(in oklab, var(--primary) 10%, var(--card))',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in oklab, var(--primary) 18%, transparent)' }}
          >
            <Shield size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 14 }}>Withdrawal protection</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 4, lineHeight: 1.45 }}>
              Only addresses on this list can receive withdrawals when whitelist is enforced.
            </p>
          </div>
        </div>

        {/* Add */}
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 650, marginBottom: 8, letterSpacing: 0.3 }}>
          ADD ADDRESS
        </p>
        <div
          className="rounded-[22px] p-4 mb-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CHAINS.map((c) => {
              const on = chain === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChain(c.id)}
                  className="h-9 px-3 rounded-full text-[12px] font-bold"
                  style={{
                    background: on ? 'var(--liquid-chip-on-bg)' : 'var(--muted)',
                    color: on ? 'var(--liquid-chip-on-text)' : 'var(--muted-foreground)',
                    border: on ? '1px solid var(--liquid-chip-on-border)' : '1px solid transparent',
                    boxShadow: on ? 'var(--liquid-chip-on-shadow)' : 'none',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div
            className="flex items-center gap-2 px-3 h-12 rounded-2xl mb-3"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Link2 size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste wallet address"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}
            />
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={saving || !address.trim()}
            onClick={() => void add()}
            className="w-full h-11 rounded-full flex items-center justify-center gap-2"
            style={{
              background: address.trim() ? 'var(--primary)' : 'var(--muted)',
              color: address.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {saving ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
            Add to whitelist
          </motion.button>
        </div>

        {/* List */}
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 650, marginBottom: 8, letterSpacing: 0.3 }}>
          SAVED ({rows.length})
        </p>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : rows.length === 0 ? (
          <div
            className="rounded-[22px] py-12 text-center"
            style={{ background: 'var(--card)', border: '1px dashed var(--border)' }}
          >
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No addresses yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((entry) => {
              const key = `${entry.chainType}:${entry.address}`;
              return (
                <div
                  key={key}
                  className="rounded-[20px] px-4 py-3.5 flex items-center gap-3"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--muted)' }}
                  >
                    <span style={{ color: 'var(--foreground)', fontSize: 10, fontWeight: 800 }}>
                      {String(entry.chainType || '').slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 650, textTransform: 'uppercase' }}>
                      {entry.chainType}
                    </p>
                    <p
                      className="truncate"
                      style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}
                    >
                      {entry.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={removing === key}
                    onClick={() => void remove(entry)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'color-mix(in oklab, var(--destructive) 12%, transparent)' }}
                    aria-label="Remove"
                  >
                    {removing === key ? (
                      <Loader size={14} className="animate-spin" style={{ color: 'var(--destructive)' }} />
                    ) : (
                      <Trash2 size={14} style={{ color: 'var(--destructive)' }} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
