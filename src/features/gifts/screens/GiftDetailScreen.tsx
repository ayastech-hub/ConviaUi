import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Share2 } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { GiftCard } from '../components/GiftCard';
import { cancelGift, getGift } from '../store';
import { claimUrl, remainingAmount, remainingSlots, type Gift } from '../types';

interface Props {
  giftId: string;
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
}

export function GiftDetailScreen({ giftId, goBack }: Props) {
  const [gift, setGift] = useState<Gift | null>(() => getGift(giftId));
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [msg, setMsg] = useState('');

  const url = useMemo(() => (gift ? claimUrl(gift.code) : ''), [gift]);

  const copy = async (kind: 'code' | 'link') => {
    if (!gift) return;
    const text = kind === 'code' ? gift.code : url;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setMsg('Could not copy');
    }
  };

  const share = async () => {
    if (!gift) return;
    const text = `Claim ${gift.kind === 'giveaway' ? 'giveaway' : 'cheque'} on Convia\nCode: ${gift.code}\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Convia gift', text, url });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied('link');
        setTimeout(() => setCopied(null), 1600);
      }
    } catch {
      /* user cancelled */
    }
  };

  const onCancel = () => {
    if (!gift || gift.status !== 'open') return;
    const left = remainingAmount(gift);
    const ok = window.confirm(
      left > 0
        ? `Cancel and return ${left} ${gift.asset} remaining to your balance?`
        : 'Cancel this gift?',
    );
    if (!ok) return;
    const updated = cancelGift(gift.id);
    if (updated) {
      setGift(updated);
      setMsg(`Cancelled. ${left} ${gift.asset} remaining returned.`);
    }
  };

  if (!gift) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <PageTop />
        <div className="flex items-center gap-3 px-5 mb-5">
          <BackButton onClick={goBack} />
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Gift</h1>
        </div>
        <p className="px-5" style={{ color: 'var(--muted-foreground)' }}>
          Gift not found
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-5">
        <BackButton onClick={goBack} />
        <div className="flex-1 min-w-0">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
            {gift.kind === 'giveaway' ? 'Giveaway card' : 'Cheque card'}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {gift.status === 'open'
              ? gift.kind === 'giveaway'
                ? `${remainingSlots(gift)} slots left`
                : 'Open for claim'
              : gift.status}
          </p>
        </div>
      </div>

      <div className="px-5 pb-10 space-y-4">
        <GiftCard gift={gift} />

        <div className="grid grid-cols-2 gap-2">
          <ActionBtn
            label={copied === 'code' ? 'Copied' : 'Copy code'}
            icon={copied === 'code' ? Check : Copy}
            onClick={() => void copy('code')}
          />
          <ActionBtn
            label={copied === 'link' ? 'Copied' : 'Copy link'}
            icon={copied === 'link' ? Check : Copy}
            onClick={() => void copy('link')}
          />
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void share()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full"
          style={{
            background: 'var(--foreground)',
            color: 'var(--background)',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          <Share2 size={16} />
          Share card
        </motion.button>

        {gift.status === 'open' && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 rounded-full"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Cancel · return remaining
          </button>
        )}

        {msg && (
          <p className="text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Copy;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 py-3 rounded-full"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <Icon size={14} />
      {label}
    </motion.button>
  );
}
