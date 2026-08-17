import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import type { WhitelistEntry } from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface AddressWhitelistViewProps {
  onBack: () => void;
  enabled?: boolean;
  onToggle?: () => void;
}

const CHAINS: Array<{ id: 'evm' | 'solana' | 'bitcoin' | 'tron'; label: string }> = [
  { id: 'evm', label: 'EVM (ETH / Base / BSC…)' },
  { id: 'solana', label: 'Solana' },
  { id: 'bitcoin', label: 'Bitcoin' },
  { id: 'tron', label: 'Tron' },
];

/** Live withdrawal whitelist — GET/POST/DELETE /security/:userId/withdrawal-whitelist */
export function AddressWhitelistView({ onBack }: AddressWhitelistViewProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState('');
  const [chainType, setChainType] = useState<'evm' | 'solana' | 'bitcoin' | 'tron'>('evm');
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await securityApi.listWhitelist(userId);
      setEntries(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.message });
      else setError({ message: 'Failed to load whitelist' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    if (!userId || !address.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await securityApi.addWhitelist(userId, chainType, address.trim());
      setAddress('');
      await load();
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.body.message || err.message });
      else setError({ message: 'Could not add address' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: WhitelistEntry) => {
    if (!userId) return;
    setSaving(true);
    try {
      await securityApi.removeWhitelist(userId, entry.chainType, entry.address);
      await load();
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title={t('security.whitelist')} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 12, lineHeight: 1.45 }}>
          Withdrawals only go to addresses you whitelist. Backend rejects non-whitelisted destinations with{' '}
          <code style={{ fontSize: 11 }}>address_not_whitelisted</code>.
        </p>

        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />}

        <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Add address</p>
          <select
            value={chainType}
            onChange={(e) => setChainType(e.target.value as typeof chainType)}
            className="w-full rounded-[12px] px-3 py-2.5 mb-2"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            {CHAINS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Destination address"
            className="w-full rounded-[12px] px-3 py-2.5 mb-3"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 13 }}
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={saving || !userId}
            onClick={() => void add()}
            className="w-full py-3 rounded-[14px] text-white flex items-center justify-center gap-2"
            style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 14 }}
          >
            {saving ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
            Add to whitelist
          </motion.button>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
          Saved addresses {loading ? '…' : `(${entries.length})`}
        </p>
        <div className="rounded-[16px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {!loading && entries.length === 0 && (
            <p className="px-4 py-6 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              No addresses yet
            </p>
          )}
          {entries.map((e, i) => (
            <div
              key={`${e.chainType}-${e.address}-${i}`}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--card)' }}
            >
              <div className="min-w-0">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>
                  {e.chainType}
                </p>
                <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace' }}>
                  {e.address}
                </p>
              </div>
              <button type="button" onClick={() => void remove(e)} aria-label="Remove">
                <Trash2 size={16} style={{ color: 'var(--destructive)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
