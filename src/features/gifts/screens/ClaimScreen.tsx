import { useState } from 'react';
import { motion } from 'motion/react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { useAuth } from '../../../shared/context/AuthContext';
import { claimGift, getGift } from '../store';
import { remainingSlots, type Gift } from '../types';
import { GiftCard } from '../components/GiftCard';

interface Props {
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
  /** Optional prefilled code from deep link / navParam */
  initialCode?: string;
}

export function ClaimScreen({ goBack, initialCode = '' }: Props) {
  const { userId } = useAuth();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [preview, setPreview] = useState<Gift | null>(
    initialCode ? getGift(initialCode) : null,
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<Gift | null>(null);

  const lookup = () => {
    setError('');
    setSuccess(null);
    const g = getGift(code.trim());
    if (!g) {
      setPreview(null);
      setError('Code not found');
      return;
    }
    setPreview(g);
  };

  const claim = () => {
    setError('');
    const res = claimGift(code.trim(), userId || 'claimer_local');
    if (!res.ok) {
      setError(res.error);
      const g = getGift(code.trim());
      if (g) setPreview(g);
      return;
    }
    setSuccess(res.gift);
    setPreview(res.gift);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-5">
        <BackButton onClick={goBack} />
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Claim gift</h1>
      </div>

      <div className="px-5 pb-10 space-y-4">
        <div
          className="rounded-[20px] px-4 py-3.5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            Enter code
          </p>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12));
              setError('');
              setSuccess(null);
            }}
            placeholder="ABCD1234"
            className="w-full bg-transparent outline-none tabular-nums tracking-[0.25em]"
            style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 800, letterSpacing: 4 }}
            autoCapitalize="characters"
          />
        </div>

        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={lookup}
            className="flex-1 py-3.5 rounded-full"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Preview
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={claim}
            className="flex-1 py-3.5 rounded-full"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground, #fff)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Claim
          </motion.button>
        </div>

        {error && (
          <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>{error}</p>
        )}

        {success && (
          <div
            className="rounded-[16px] px-4 py-3"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Claimed</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
              +{success.perClaimAmount} {success.asset} added (mock).{' '}
              {success.kind === 'giveaway' && success.status === 'open'
                ? `${remainingSlots(success)} slots still open.`
                : ''}
            </p>
          </div>
        )}

        {preview && <GiftCard gift={preview} />}
      </div>
    </div>
  );
}
