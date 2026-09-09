import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Link2, Gift, Ticket } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { listGifts } from '../store';
import { remainingSlots, type Gift } from '../types';

interface Props {
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
}

export function GiftsHubScreen({ goBack, navigate }: Props) {
  const [tab, setTab] = useState<'mine' | 'claim'>('mine');
  const [tick, setTick] = useState(0);
  const gifts = useMemo(() => listGifts(), [tab, tick]);

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-5">
        <BackButton onClick={goBack} />
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Gifts</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 mb-5">
        <HubAction
          icon={Link2}
          title="Cheque link"
          desc="One person claims"
          onClick={() => navigate('gift-create-cheque')}
        />
        <HubAction
          icon={Gift}
          title="Giveaway"
          desc="Many equal claims"
          onClick={() => navigate('gift-create-giveaway')}
        />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('claim')}
        className="mx-5 mb-6 flex items-center gap-3 px-4 py-3.5 rounded-[18px]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--muted)' }}
        >
          <Ticket size={18} style={{ color: 'var(--foreground)' }} />
        </div>
        <div className="text-left">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Claim with code</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Enter a cheque or giveaway code</p>
        </div>
      </motion.button>

      <div className="flex gap-2 px-5 mb-3">
        {(['mine', 'claim'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); if (t === 'mine') setTick((x) => x + 1); }}
            className="px-3.5 py-1.5 rounded-full"
            style={{
              background: tab === t ? 'var(--foreground)' : 'var(--muted)',
              color: tab === t ? 'var(--background)' : 'var(--foreground)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {t === 'mine' ? 'Created' : 'How to claim'}
          </button>
        ))}
      </div>

      <div className="px-5 pb-12">
        {tab === 'claim' ? (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.5 }}>
            Open a shared link, scan the QR on the card, or type the 8-character code. You must be signed in to
            receive funds. Creators cannot claim their own gifts.
          </p>
        ) : gifts.length === 0 ? (
          <p className="py-10 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No cheques or giveaways yet
          </p>
        ) : (
          gifts.map((g) => <GiftRow key={g.id} gift={g} onOpen={() => navigate('gift-detail', g.id)} />)
        )}
      </div>
    </div>
  );
}

function HubAction({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: typeof Link2;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left px-4 py-4 rounded-[20px]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
        style={{ background: 'var(--muted)' }}
      >
        <Icon size={18} style={{ color: 'var(--foreground)' }} />
      </div>
      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{title}</p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>{desc}</p>
    </motion.button>
  );
}

function GiftRow({ gift, onOpen }: { gift: Gift; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center justify-between py-3.5 text-left"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
          {gift.kind === 'giveaway' ? 'Giveaway' : 'Cheque'} · {gift.totalAmount} {gift.asset}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
          {gift.code} · {gift.status}
          {gift.kind === 'giveaway' && gift.status === 'open'
            ? ` · ${remainingSlots(gift)} left`
            : ''}
        </p>
      </div>
      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>View</span>
    </button>
  );
}
