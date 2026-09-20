import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gift,
  ScanLine,
  ChevronDown,
  Copy,
  Check,
  Share2,
  Sparkles,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Clock3,
  ShieldCheck,
  CircleCheck,
  WalletCards,
  RotateCcw,
} from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { GiftCard, CARD_THEME_OPTIONS } from '../components/GiftCard';
import { CardThemePicker } from '../components/CardThemePicker';
import { ConfirmSheet } from '../../../shared/components/ConfirmSheet';
import { ExpiryPicker } from '../../../shared/components/ExpiryPicker';
import { downloadGiftCard } from '../utils/downloadGiftCard';
import { QRScanner } from '../../../shared/components/QRScanner';
import {
  cancelGift,
  claimGift,
  createGift,
  getGift,
  listGifts,
  listRecentClaims,
} from '../store';
import {
  claimUrl,
  remainingAmount,
  remainingSlots,
  type CardTheme,
  type Gift,
  type SplitMode,
} from '../types';
import { ensureTransactionPin } from '../../../shared/security/ensureTransactionPin';
import { ClaimCelebration } from '../components/ClaimCelebration';

type Mode = 'hub' | 'create' | 'join' | 'detail' | 'theme';

interface Props {
  goBack: () => void;
}

const EXPIRY = [
  { id: '1d', label: '24h', ms: 864e5 },
  { id: '7d', label: '7d', ms: 7 * 864e5 },
  { id: '30d', label: '30d', ms: 30 * 864e5 },
];

export function GiveawayScreen({ goBack }: Props) {
  const [mode, setMode] = useState<Mode>('hub');
  const [detailId, setDetailId] = useState('');
  const [hubKey, setHubKey] = useState(0);
  const [cardTheme, setCardTheme] = useState<CardTheme>('gift');
  const [detail, setDetail] = useState<Gift | null>(null);

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    void getGift(detailId).then(setDetail);
  }, [detailId]);

  const back = () => {
    if (mode === 'hub') {
      goBack();
      return;
    }

    if (mode === 'theme') {
      setMode('create');
      return;
    }

    setMode('hub');
    setDetailId('');
    setHubKey((k) => k + 1);
  };

  const title =
    mode === 'create'
      ? 'Create giveaway'
      : mode === 'join'
        ? 'Join giveaway'
        : mode === 'detail'
          ? 'Giveaway'
          : mode === 'theme'
            ? 'Card style'
            : 'Giveaways';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      {mode !== 'theme' && (
        <>
          <PageTop />
          <div className="flex items-center gap-3 px-5 mb-3">
            <BackButton onClick={back} />
            <h1
              className="flex-1 text-center pr-10"
              style={{
                color: 'var(--foreground)',
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: -0.2,
              }}
            >
              {title}
            </h1>
          </div>
        </>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col">
        <AnimatePresence mode="wait">
          {mode === 'hub' && (
            <motion.div
              key={`hub-${hubKey}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Hub
                onCreate={() => setMode('create')}
                onJoin={() => setMode('join')}
                onOpen={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}

          {mode === 'theme' && (
            <motion.div
              key="theme"
              className="flex-1 flex flex-col min-h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardThemePicker
                selected={cardTheme}
                preview={{
                  kind: 'giveaway',
                  note: 'All the Best — Claim Your Gift!',
                  creatorMask: 'ya....hub',
                  code: 'ABCD1234',
                  asset: 'USDT',
                  totalAmount: 100,
                  slots: 5,
                  claimedCount: 0,
                  splitMode: 'equal',
                  status: 'open',
                  expiresAt: new Date(Date.now() + 864e5).toISOString(),
                }}
                onSelect={(theme) => {
                  setCardTheme(theme);
                  setMode('create');
                }}
                onBack={() => setMode('create')}
              />
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <CreateForm
                cardTheme={cardTheme}
                onOpenTheme={() => setMode('theme')}
                onDone={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <JoinForm />
            </motion.div>
          )}

          {mode === 'detail' && detail && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Detail gift={detail} onRefresh={(g) => setDetailId(g.id)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Hub({
  onCreate,
  onJoin,
  onOpen,
}: {
  onCreate: () => void;
  onJoin: () => void;
  onOpen: (id: string) => void;
}) {
  const [mine, setMine] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void listGifts('giveaway')
      .then((gifts) => {
        if (active) setMine(gifts.slice(0, 8));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="px-5 pb-14 space-y-6">
      <section
        className="relative overflow-hidden rounded-[26px] p-5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="absolute -right-16 -top-20 w-44 h-44 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              <Gift size={24} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
            </div>

            <span
              className="px-2.5 py-1 rounded-full"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              CRYPTO GIFT
            </span>
          </div>

          <div className="mt-5">
            <h2
              style={{
                color: 'var(--foreground)',
                fontSize: 21,
                lineHeight: 1.2,
                fontWeight: 800,
                letterSpacing: -0.4,
              }}
            >
              Send crypto.
              <br />
              Let friends claim.
            </h2>

            <p
              className="mt-2 max-w-[300px]"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Create a shared pool with a passcode. Recipients claim from the remaining balance until it expires.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mt-6">
            <PrimaryButton icon={ArrowUpRight} label="Create" onClick={onCreate} />
            <SecondaryButton icon={ArrowDownLeft} label="Join" onClick={onJoin} />
          </div>
        </div>
      </section>

      {loading && (
        <section>
          <SectionLabel>Your giveaways</SectionLabel>
          <div
            className="rounded-[22px] overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderTop: item > 1 ? '1px solid var(--border)' : undefined }}
              >
                <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-24 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
                  <div className="h-3 w-32 rounded-full animate-pulse" style={{ background: 'var(--muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && mine.length > 0 && (
        <section>
          <SectionLabel>Your giveaways</SectionLabel>
          <div
            className="rounded-[22px] overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {mine.map((gift, index) => (
              <button
                key={gift.id}
                type="button"
                onClick={() => onOpen(gift.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:opacity-70 transition-opacity"
                style={{
                  borderTop: index ? '1px solid var(--border)' : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <AssetIcon symbol={gift.asset} size={19} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="tabular-nums truncate"
                      style={{
                        color: 'var(--foreground)',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {formatAmt(gift.totalAmount)} {gift.asset}
                    </p>
                    <StatusBadge status={gift.status} />
                  </div>

                  <p
                    className="mt-1 truncate"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 11,
                    }}
                  >
                    {gift.code} · {gift.status === 'open' ? `${remainingSlots(gift)} slots left` : gift.status}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  style={{
                    color: 'var(--muted-foreground)',
                    transform: 'rotate(-90deg)',
                    flexShrink: 0,
                  }}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {!loading && mine.length === 0 && (
        <section
          className="rounded-[22px] p-5 text-center"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="mx-auto w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <Gift size={20} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="mt-3" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
            No giveaways yet
          </p>
          <p className="mt-1" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            Create your first crypto gift pool above.
          </p>
        </section>
      )}

      <section>
        <SectionLabel>How it works</SectionLabel>
        <div
          className="rounded-[22px] overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <InfoRow
            icon={WalletCards}
            title="Create a pool"
            body="Choose an asset, amount and number of participants."
          />
          <InfoRow
            icon={Share2}
            title="Share the code"
            body="Send the passcode or QR to your friends."
          />
          <InfoRow
            icon={CircleCheck}
            title="Friends claim"
            body="Each claim reduces the remaining pool."
          />
          <InfoRow
            icon={RotateCcw}
            title="Unused funds return"
            body="Cancel or let the pool expire to recover the remainder."
            last
          />
        </div>
      </section>

      <section>
        <SectionLabel>FAQ</SectionLabel>
        <div
          className="rounded-[22px] overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {[
            ['What is a giveaway?', 'You lock a crypto pool and share a passcode. Friends claim until slots run out or the pool expires.'],
            ['Equal vs random?', 'Equal splits the pool evenly. Random gives varied amounts from the remaining pool.'],
            ['How do friends join?', 'They open Join, enter the passcode, or scan the QR on your card.'],
            ['What happens to unclaimed funds?', 'Cancel anytime or wait for expiry. Only the remaining unclaimed amount is returned.'],
          ].map(([question, answer], index) => (
            <FaqRow key={question} q={question} a={answer} first={!index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  body,
  last,
}: {
  icon: typeof WalletCards;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{
        borderTop: last ? undefined : '1px solid var(--border)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--muted)' }}
      >
        <Icon size={17} style={{ color: 'var(--muted-foreground)' }} />
      </div>

      <div className="min-w-0">
        <p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>{title}</p>
        <p className="mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: 11.5, lineHeight: 1.4 }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function FaqRow({ q, a, first }: { q: string; a: string; first?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      className="w-full text-left px-4 py-3.5"
      style={{
        borderTop: first ? undefined : '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span style={{ color: 'var(--foreground)', fontSize: 13.5, fontWeight: 600 }}>
          {q}
        </span>

        <ChevronDown
          size={16}
          style={{
            color: 'var(--muted-foreground)',
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 0.16s ease',
            flexShrink: 0,
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 12.5,
              lineHeight: 1.5,
              marginTop: 8,
            }}
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  );
}

function CreateForm({
  onDone,
  cardTheme,
  onOpenTheme,
}: {
  onDone: (id: string) => void;
  cardTheme: CardTheme;
  onOpenTheme: () => void;
}) {
  const { assets } = useWalletAssets();
  const { userId } = useAuth();

  const tokens = useMemo(() => {
    const list = assets.length ? assets : [];
    const preferred = list.filter(
      (asset) =>
        asset.balance > 0 ||
        ['USDT', 'USDC', 'BTC', 'ETH'].includes(asset.symbol),
    );

    return preferred.length
      ? preferred
      : [{ symbol: 'USDT', balance: 0, name: 'Tether' } as any];
  }, [assets]);

  const [split, setSplit] = useState<SplitMode>('equal');
  const [slots, setSlots] = useState('');
  const [total, setTotal] = useState('');
  const [asset, setAsset] = useState(tokens[0]?.symbol || 'USDT');
  const [showToken, setShowToken] = useState(false);
  const [note, setNote] = useState('');
  const [expiry, setExpiry] = useState('1d');
  const [customDate, setCustomDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selected = tokens.find((token: any) => token.symbol === asset);
  const nSlots = Math.max(0, Math.floor(Number(slots) || 0));
  const nTotal = Number(total) || 0;
  const per = nSlots > 0 && nTotal > 0 ? nTotal / nSlots : 0;

  const submit = async () => {
    if (!(nTotal > 0)) {
      setError('Enter a total amount');
      return;
    }

    if (nSlots < 2) {
      setError('Add at least 2 participants');
      return;
    }

    if (selected && selected.balance > 0 && nTotal > selected.balance) {
      setError(`Available balance is ${formatAmt(selected.balance)} ${asset}`);
      return;
    }

    let expiresAt: string;

    if (customDate) {
      expiresAt = new Date(`${customDate}T23:59:59`).toISOString();

      if (new Date(expiresAt).getTime() <= Date.now()) {
        setError('Choose a future date');
        return;
      }
    } else {
      const option = EXPIRY.find((item) => item.id === expiry) || EXPIRY[0];
      expiresAt = new Date(Date.now() + option.ms).toISOString();
    }

    setSubmitting(true);
    setError('');

    try {
      const gift = await createGift({
        kind: 'giveaway',
        asset,
        totalAmount: nTotal,
        slots: nSlots,
        note,
        expiresAt,
        creatorId: userId || 'local',
        splitMode: split,
        cardTheme,
      });

      onDone(gift.id);
    } catch (errorValue: unknown) {
      const message =
        errorValue &&
        typeof errorValue === 'object' &&
        'body' in errorValue
          ? String(
              (errorValue as { body?: { message?: string; code?: string } }).body?.message ||
                (errorValue as { body?: { code?: string } }).body?.code ||
                'Could not create giveaway',
            )
          : 'Could not create giveaway';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pb-5 space-y-4 flex-1">
        <div
          className="p-1 rounded-2xl grid grid-cols-2 gap-1"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          {([
            ['equal', 'Equal split'],
            ['random', 'Random split'],
          ] as const).map(([id, label]) => {
            const active = split === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSplit(id)}
                className="h-10 rounded-[14px] text-[12.5px] font-bold"
                style={{
                  background: active ? 'var(--card)' : 'transparent',
                  color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                  border: active ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : undefined,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenTheme}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            className="w-10 h-10 rounded-xl flex-shrink-0"
            style={{
              background:
                CARD_THEME_OPTIONS.find((option) => option.id === cardTheme)?.swatch ||
                'var(--primary)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16)',
            }}
          />

          <div className="flex-1 min-w-0">
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 10.5,
                fontWeight: 600,
              }}
            >
              Card style
            </p>
            <p
              className="mt-0.5"
              style={{
                color: 'var(--foreground)',
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              {CARD_THEME_OPTIONS.find((option) => option.id === cardTheme)?.label || 'Classic'}
            </p>
          </div>

          <span
            style={{
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Preview
          </span>
        </button>

        <Field
          label="Participants"
          icon={<Users size={14} style={{ color: 'var(--muted-foreground)' }} />}
          right={
            <span style={{ color: 'var(--muted-foreground)', fontSize: 10.5 }}>
              Minimum 2
            </span>
          }
        >
          <input
            value={slots}
            onChange={(event) => {
              setSlots(event.target.value.replace(/\D/g, ''));
              setError('');
            }}
            inputMode="numeric"
            placeholder="e.g. 10"
            className="w-full bg-transparent outline-none"
            style={{
              color: 'var(--foreground)',
              fontSize: 16,
              fontWeight: 650,
            }}
          />
        </Field>

        <Field
          label="Total amount"
          icon={<WalletCards size={14} style={{ color: 'var(--muted-foreground)' }} />}
          right={
            selected ? (
              <span
                className="tabular-nums"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 10.5,
                }}
              >
                {formatAmt(Number(selected.balance || 0))} available
              </span>
            ) : null
          }
        >
          <div className="flex items-center gap-2">
            <input
              value={total}
              onChange={(event) => {
                setTotal(event.target.value.replace(/[^0-9.]/g, ''));
                setError('');
              }}
              inputMode="decimal"
              placeholder="0.00"
              className="flex-1 min-w-0 bg-transparent outline-none tabular-nums"
              style={{
                color: 'var(--foreground)',
                fontSize: 20,
                fontWeight: 750,
              }}
            />

            <TokenPicker
              asset={asset}
              tokens={tokens}
              open={showToken}
              setOpen={setShowToken}
              onPick={setAsset}
            />
          </div>
        </Field>

        {nSlots >= 2 && nTotal > 0 && (
          <div
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--card)' }}
            >
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            </div>

            <div className="min-w-0">
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                Distribution
              </p>
              <p
                className="truncate"
                style={{
                  color: 'var(--foreground)',
                  fontSize: 12.5,
                  fontWeight: 650,
                }}
              >
                {split === 'equal'
                  ? `${formatAmt(per)} ${asset} per participant`
                  : `Random shares from ${formatAmt(nTotal)} ${asset}`}
              </p>
            </div>
          </div>
        )}

        <Field label="Message">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 80))}
            placeholder="Optional note"
            className="w-full bg-transparent outline-none"
            style={{
              color: 'var(--foreground)',
              fontSize: 14.5,
            }}
          />
        </Field>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Clock3 size={14} style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
              Expiration
            </p>
          </div>

          <ExpiryPicker
            presets={EXPIRY}
            presetId={expiry}
            customDate={customDate}
            onPreset={setExpiry}
            onCustomDate={(date) => {
              setCustomDate(date);
              if (date) setExpiry('custom');
            }}
          />
        </div>

        {error && (
          <div
            className="px-3.5 py-3 rounded-2xl"
            style={{
              background: 'color-mix(in oklab, var(--destructive, #ef4444) 8%, transparent)',
              border: '1px solid color-mix(in oklab, var(--destructive, #ef4444) 20%, var(--border))',
            }}
          >
            <p
              style={{
                color: 'var(--destructive, #ef4444)',
                fontSize: 12.5,
                fontWeight: 550,
              }}
            >
              {error}
            </p>
          </div>
        )}
      </div>

      <div
        className="mt-auto px-5 pt-3 pb-6"
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            You will lock
          </span>
          <span
            className="tabular-nums"
            style={{
              color: 'var(--foreground)',
              fontSize: 13,
              fontWeight: 750,
            }}
          >
            {nTotal > 0 ? `${formatAmt(nTotal)} ${asset}` : `— ${asset}`}
          </span>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => void submit()}
          disabled={submitting}
          className="w-full h-13 rounded-2xl font-bold text-[14px]"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            opacity: submitting ? 0.65 : 1,
          }}
        >
          {submitting ? 'Creating…' : 'Create giveaway'}
        </motion.button>

        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          <ShieldCheck size={12} style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 10.5 }}>
            Unclaimed balance returns after expiry
          </p>
        </div>
      </div>
    </div>
  );
}

function JoinForm() {
  const { userId } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ amount: number; asset: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof listRecentClaims>>>([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    void listRecentClaims(6).then(setRecent);
  }, [success]);

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(extractCode(text));
      setError('');
      setSuccess(null);
    } catch {
      setError('Paste is not available');
    }
  };

  const confirm = async () => {
    setError('');
    setSuccess(null);

    if (!code.trim()) {
      setError('Enter a passcode');
      return;
    }

    setClaiming(true);

    try {
      const result = await claimGift(
        code,
        userId || 'claimer_local',
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess({
        amount: result.amount,
        asset: result.gift.asset,
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="px-5 pb-14 space-y-5">
      <section
        className="rounded-[22px] p-4"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <Gift size={19} style={{ color: 'var(--primary)' }} />
          </div>

          <div>
            <p style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 750 }}>
              Claim a giveaway
            </p>
            <p
              className="mt-0.5"
              style={{ color: 'var(--muted-foreground)', fontSize: 11.5 }}
            >
              Enter the code shared with you.
            </p>
          </div>
        </div>

        <Field label="Passcode">
          <div className="flex items-center gap-2">
            <input
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 12),
                );
                setError('');
                setSuccess(null);
              }}
              placeholder="ABCD1234"
              className="flex-1 min-w-0 bg-transparent outline-none tabular-nums"
              style={{
                color: 'var(--foreground)',
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            />

            <button
              type="button"
              onClick={() => void paste()}
              className="px-2.5 py-1.5 rounded-lg"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 11.5,
              }}
            >
              Paste
            </button>
          </div>
        </Field>
      </section>

            <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={() => void confirm()}
        disabled={claiming}
        className="w-full h-13 rounded-2xl font-bold text-[14px]"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          opacity: claiming ? 0.65 : 1,
        }}
      >
        {claiming ? 'Claiming…' : 'Claim giveaway'}
      </motion.button>

      {error && (
        <div
          className="px-3.5 py-3 rounded-2xl"
          style={{
            background: 'color-mix(in oklab, var(--destructive, #ef4444) 8%, transparent)',
            border: '1px solid color-mix(in oklab, var(--destructive, #ef4444) 20%, var(--border))',
          }}
        >
          <p style={{ color: 'var(--destructive, #ef4444)', fontSize: 12.5 }}>
            {error}
          </p>
        </div>
      )}

      {success && (
        <ClaimCelebration
          amount={success.amount}
          asset={success.asset}
          onDone={() => {
            setSuccess(null);
            setCode('');
            
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
          or scan QR
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={() => setScanning(true)}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl"
        style={{
          background: 'var(--card)',
          color: 'var(--foreground)',
          fontWeight: 650,
          fontSize: 13,
          border: '1px solid var(--border)',
        }}
      >
        <ScanLine size={18} />
        Scan passcode
      </motion.button>

      {scanning && (
        <QRScanner
          onScan={(text) => {
            setCode(extractCode(text));
            setScanning(false);
            setError('');
            setSuccess(null);
          }}
          onClose={() => setScanning(false)}
          onManualEntry={() => setScanning(false)}
        />
      )}

      {recent.length > 0 && (
        <section className="pt-2">
          <SectionLabel>Recently claimed</SectionLabel>

          <div
            className="rounded-[22px] overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {recent.map((claim, index) => (
              <div
                key={`${claim.at}-${index}`}
                className="px-4 py-3.5"
                style={{
                  borderTop: index ? '1px solid var(--border)' : undefined,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="tabular-nums"
                    style={{
                      color: 'var(--foreground)',
                      fontWeight: 750,
                      fontSize: 14,
                    }}
                  >
                    {formatAmt(claim.amount)} {claim.gift.asset}
                  </p>

                  <span
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 10.5,
                    }}
                  >
                    {claim.claimerMask}
                  </span>
                </div>

                {claim.note && (
                  <p
                    className="mt-1"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 11.5,
                    }}
                  >
                    {claim.note}
                  </p>
                )}

                <p
                  className="mt-2"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 10.5,
                  }}
                >
                  {new Date(claim.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({
  gift: initial,
  onRefresh,
}: {
  gift: Gift;
  onRefresh: (gift: Gift) => void;
}) {
  const [gift, setGift] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState('');

  const url = claimUrl(gift.code);
  const left = remainingAmount(gift);
  const progress = gift.slots > 0 ? Math.min(100, (gift.claimedCount / gift.slots) * 100) : 0;

  const showToast = (message: string, duration = 1800) => {
    setToast(message);
    window.setTimeout(() => setToast(''), duration);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${gift.code}\n${url}`);
      setCopied(true);
      showToast('Passcode and link copied');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Could not copy');
    }
  };

  const share = async () => {
    const text = `Convia giveaway passcode: ${gift.code}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Convia Giveaway',
          text,
          url,
        });
      } else {
        await copy();
      }
    } catch {}
  };

  const onDownload = async () => {
    setDownloading(true);

    try {
      await downloadGiftCard(gift);
      showToast('Card saved');
    } catch {
      showToast('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const doCancel = async () => {
    const updated = await cancelGift(gift.id);

    if (updated) {
      setGift(updated);
      onRefresh(updated);
      showToast('Giveaway cancelled · remaining returned', 2200);
    }
  };

  return (
    <div className="px-5 pb-16 space-y-4">
      <GiftCard gift={gift} mode="private" />

      <div
        className="grid grid-cols-3 gap-2 p-1 rounded-[22px]"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <ActionBtn
          icon={copied ? Check : Copy}
          label={copied ? 'Copied' : 'Copy'}
          onClick={() => void copy()}
        />
        <ActionBtn
          icon={Share2}
          label="Share"
          onClick={() => void share()}
          primary
        />
        <ActionBtn
          icon={Download}
          label={downloading ? 'Saving' : 'Save'}
          onClick={() => void onDownload()}
        />
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-1.5"
        >
          <Check size={13} style={{ color: 'var(--primary)' }} />
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11.5,
              fontWeight: 600,
            }}
          >
            {toast}
          </p>
        </motion.div>
      )}

      <section
        className="rounded-[22px] p-4"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 10.5,
                fontWeight: 650,
              }}
            >
              Giveaway status
            </p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={gift.status} />
              <span
                style={{
                  color: 'var(--foreground)',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {gift.status === 'open'
                  ? `${remainingSlots(gift)} slots available`
                  : gift.status}
              </span>
            </div>
          </div>

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <Gift size={19} style={{ color: 'var(--muted-foreground)' }} />
          </div>
        </div>

        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--muted)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ background: 'var(--primary)' }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 10.5,
            }}
          >
            {gift.claimedCount} claimed
          </span>
          <span
            className="tabular-nums"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 10.5,
            }}
          >
            {formatAmt(left)} {gift.asset} remaining
          </span>
        </div>
      </section>

      <div
        className="grid grid-cols-3 gap-px overflow-hidden rounded-[20px]"
        style={{
          background: 'var(--border)',
          border: '1px solid var(--border)',
        }}
      >
        <Stat label="Total" value={`${formatAmt(gift.totalAmount)} ${gift.asset}`} />
        <Stat label="Claimed" value={`${gift.claimedCount}/${gift.slots}`} />
        <Stat label="Split" value={gift.splitMode === 'random' ? 'Random' : 'Equal'} />
      </div>

      {(gift.claims?.length ?? 0) > 0 && (
        <section>
          <SectionLabel>Claims</SectionLabel>

          <div
            className="rounded-[22px] overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {gift.claims.map((claim, index) => (
              <div
                key={`${claim.at}-${index}`}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderTop: index ? '1px solid var(--border)' : undefined,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)' }}
                >
                  <Users size={15} style={{ color: 'var(--muted-foreground)' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{
                      color: 'var(--foreground)',
                      fontWeight: 650,
                      fontSize: 13,
                    }}
                  >
                    {claim.claimerMask}
                  </p>
                  <p
                    className="mt-0.5"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 10.5,
                    }}
                  >
                    {new Date(claim.at).toLocaleString()}
                  </p>
                </div>

                <p
                  className="tabular-nums"
                  style={{
                    color: 'var(--foreground)',
                    fontWeight: 750,
                    fontSize: 13,
                  }}
                >
                  {formatAmt(claim.amount)} {gift.asset}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {gift.status === 'open' && (
        <button
          type="button"
          onClick={() => setConfirmCancel(true)}
          className="w-full h-12 rounded-2xl"
          style={{
            border:
              '1px solid color-mix(in oklab, var(--destructive, #ef4444) 28%, var(--border))',
            color: 'var(--destructive, #ef4444)',
            fontWeight: 650,
            fontSize: 12.5,
            background: 'transparent',
          }}
        >
          Cancel giveaway
        </button>
      )}

      <ConfirmSheet
        open={confirmCancel}
        title="Cancel giveaway?"
        body={
          <>
            Unclaimed balance of{' '}
            <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>
              {formatAmt(left)} {gift.asset}
            </span>{' '}
            will return to you. Claimed amounts stay with claimers.
          </>
        }
        confirmLabel="Cancel & return"
        cancelLabel="Keep open"
        destructive
        onConfirm={doCancel}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 h-[58px] rounded-[17px]"
      style={{
        background: primary ? 'var(--primary)' : 'var(--card)',
        color: primary ? 'var(--primary-foreground)' : 'var(--foreground)',
        border: primary ? undefined : '1px solid var(--border)',
        fontWeight: 650,
        fontSize: 10.5,
      }}
    >
      <Icon size={17} strokeWidth={2} />
      {label}
    </motion.button>
  );
}

function PrimaryButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ArrowUpRight;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.975 }}
      onClick={onClick}
      className="h-12 rounded-2xl flex items-center justify-center gap-2"
      style={{
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        fontWeight: 750,
        fontSize: 13,
      }}
    >
      <Icon size={16} strokeWidth={2.4} />
      {label}
    </motion.button>
  );
}

function SecondaryButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ArrowDownLeft;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.975 }}
      onClick={onClick}
      className="h-12 rounded-2xl flex items-center justify-center gap-2"
      style={{
        background: 'var(--muted)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
        fontWeight: 750,
        fontSize: 13,
      }}
    >
      <Icon size={16} strokeWidth={2.4} />
      {label}
    </motion.button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="text-center px-2 py-3.5"
      style={{ background: 'var(--card)' }}
    >
      <p
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        className="tabular-nums mt-1 truncate"
        style={{
          color: 'var(--foreground)',
          fontSize: 12.5,
          fontWeight: 750,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-2.5 px-0.5"
      style={{
        color: 'var(--muted-foreground)',
        fontSize: 10.5,
        fontWeight: 750,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </p>
  );
}

function StatusBadge({ status }: { status: Gift['status'] }) {
  const active = status === 'open';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{
        background: active
          ? 'color-mix(in oklab, var(--primary) 10%, transparent)'
          : 'var(--muted)',
        color: active ? 'var(--primary)' : 'var(--muted-foreground)',
        fontSize: 9.5,
        fontWeight: 750,
        textTransform: 'capitalize',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: active ? 'var(--primary)' : 'var(--muted-foreground)',
        }}
      />
      {status}
    </span>
  );
}

function Field({
  label,
  right,
  icon,
  children,
}: {
  label: string;
  right?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11.5,
              fontWeight: 650,
            }}
          >
            {label}
          </p>
        </div>
        {right}
      </div>

      <div
        className="rounded-2xl px-3.5 py-3.5"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TokenPicker({
  asset,
  tokens,
  open,
  setOpen,
  onPick,
}: {
  asset: string;
  tokens: any[];
  open: boolean;
  setOpen: (value: boolean) => void;
  onPick: (symbol: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
        style={{
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          fontSize: 12,
          fontWeight: 750,
        }}
      >
        <AssetIcon symbol={asset} size={16} />
        {asset}
        <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-30 rounded-2xl overflow-hidden max-h-52 overflow-y-auto"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            minWidth: 150,
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
          }}
        >
          {tokens.slice(0, 12).map((token: any) => {
            const active = token.symbol === asset;

            return (
              <button
                key={token.symbol}
                type="button"
                onClick={() => {
                  onPick(token.symbol);
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5"
                style={{
                  color: 'var(--foreground)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: active ? 'var(--muted)' : undefined,
                }}
              >
                <AssetIcon symbol={token.symbol} size={17} />
                <span className="flex-1 text-left">{token.symbol}</span>
                {active && <Check size={14} style={{ color: 'var(--primary)' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function extractCode(raw: string): string {
  const value = raw.trim();

  try {
    const url = new URL(value);
    const query =
      url.searchParams.get('claim') ||
      url.pathname.split('/').filter(Boolean).pop() ||
      '';

    return query
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12);
  } catch {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12);
  }
}

function formatAmt(value: number) {
  if (!Number.isFinite(value)) return '0';

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  });
}