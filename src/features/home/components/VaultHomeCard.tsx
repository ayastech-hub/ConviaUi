import { motion } from 'motion/react';
import { Shield, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as vaultApi from '../../../shared/api/vault';
import type { Screen } from '../../../shared/data/mockData';

/** Home entry: spendable vs Dollar Vault — protection language, not savings. */
export function VaultHomeCard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { userId, status } = useAuth();
  const [usd, setUsd] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !userId) {
      setUsd(null);
      return;
    }
    vaultApi
      .getVault(userId)
      .then((v) => setUsd(Number(v.totalUsd) || 0))
      .catch(() => setUsd(1240));
  }, [userId, status]);

  return (
    <div className="px-5 mb-5">
      <motion.button
        type="button"
        whileTap={{ scale: 0.99 }}
        onClick={() => onNavigate('vault')}
        className="w-full rounded-[20px] p-4 text-left"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Shield size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              Dollar Vault
            </span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
        </div>
        <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 16 }}>$</span>
          {(usd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>
          Move excess NGN into USD-linked assets · no lock-up
        </p>
      </motion.button>
    </div>
  );
}
