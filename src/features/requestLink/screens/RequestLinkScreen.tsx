import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link2,
  Copy,
  Check,
  Share2,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock3,
  ShieldCheck,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { QRCodeDisplay } from '../../../shared/components/QRCodeDisplay';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useAuth } from '../../../shared/context/AuthContext';
import { cancelRequest, createRequest, getRequest, listRequests } from '../store';
import { payUrl, type PaymentRequest } from '../types';
import { ConfirmSheet } from '../../../shared/components/ConfirmSheet';
import { ExpiryPicker } from '../../../shared/components/ExpiryPicker';

type Mode = 'hub' | 'create' | 'detail';

interface Props {
  goBack: () => void;
}

const EXPIRY = [
  { id: '1d', label: '24h', ms: 864e5 },
  { id: '7d', label: '7d', ms: 7 * 864e5 },
  { id: '30d', label: '30d', ms: 30 * 864e5 },
];

export function RequestLinkScreen({ goBack }: Props) {
  const [mode, setMode] = useState<Mode>('hub');
  const [detailId, setDetailId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [detail, setDetail] = useState<PaymentRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    if (mode !== 'detail' || !detailId) {
      setDetail(null);
      setDetailError('');
      return;
    }

    let cancelled = false;

    setDetailLoading(true);
    setDetailError('');

    void getRequest(detailId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setDetailError('This payment request could not be found.');
          setDetail(null);
          return;
        }
        setDetail(result);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setDetailError('Could not load this payment request.');
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [detailId, mode]);

  const openDetail = (id: string) => {
    setDetailId(id);
    setMode('detail');
  };

  const back = () => {
    if (mode === 'hub') {
      goBack();
      return;
    }

    setMode('hub');
    setDetailId('');
    setDetail(null);
    setRefreshKey((value) => value + 1);
  };

  const title =
    mode === 'create'
      ? 'Create request'
      : mode === 'detail'
        ? 'Payment link'
        : 'Request payment';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="flex items-center gap-3 px-5 pb-3">
        <BackButton onClick={back} />

        <div className="flex-1 min-w-0">
          <h1
            className="truncate"
            style={{
              color: 'var(--foreground)',
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: -0.2,
            }}
          >
            {title}
          </h1>
          {mode === 'hub' && (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 1 }}>
              Get paid from your Convia balance
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {mode === 'hub' && (
            <motion.div
              key={`hub-${refreshKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="px-5 pb-14"
            >
              <Hero onCreate={() => setMode('create')} />
              <Mine onOpen={openDetail} refreshKey={refreshKey} />
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <CreateForm
                onDone={(id) => {
                  setDetailId(id);
                  setMode('detail');
                }}
              />
            </motion.div>
          )}

          {mode === 'detail' && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {detailLoading && <DetailLoading />}

              {!detailLoading && detailError && (
                <DetailError message={detailError} onBack={back} />
              )}

              {!detailLoading && detail && (
                <Detail
                  req={detail}
                  onUpdate={(updated) => {
                    setDetail(updated);
                    setRefreshKey((value) => value + 1);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Hero({ onCreate }: { onCreate: () => void }) {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] p-5 mb-7"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at top right, color-mix(in oklab, var(--primary) 15%, transparent), transparent 68%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className="w-11 h-11 rounded-[15px] flex items-center justify-center"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              <Link2
                size={21}
                strokeWidth={1.8}
                style={{ color: 'var(--primary)' }}
              />
            </div>

            <p
              className="mt-5"
              style={{
                color: 'var(--foreground)',
                fontSize: 21,
                fontWeight: 800,
                letterSpacing: -0.45,
              }}
            >
              Request a payment
            </p>

            <p
              className="mt-2"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 13,
                lineHeight: 1.55,
                maxWidth: 300,
              }}
            >
              Create a payment link and send it to anyone using Convia.
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 mt-6 px-3.5 py-3 rounded-2xl"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          <ShieldCheck
            size={17}
            style={{ color: 'var(--primary)', flexShrink: 0 }}
          />

          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11.5,
              lineHeight: 1.4,
            }}
          >
            The payer completes the request directly from their Convia balance.
          </p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onCreate}
          className="w-full h-[52px] rounded-2xl mt-5 font-bold text-[14px] flex items-center justify-center gap-2"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          <Plus size={18} />
          Create payment link
        </motion.button>
      </div>
    </section>
  );
}

function Mine({
  onOpen,
  refreshKey,
}: {
  onOpen: (id: string) => void;
  refreshKey: number;
}) {
  const { userId } = useAuth();
  const [list, setList] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    void listRequests(userId || undefined)
      .then((result) => {
        if (!cancelled) setList(result.slice(0, 12));
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey]);

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 750,
            letterSpacing: 0.7,
            textTransform: 'uppercase',
          }}
        >
          Recent requests
        </p>

        {list.length > 0 && (
          <span
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 11,
            }}
          >
            {list.length}
          </span>
        )}
      </div>

      {loading ? (
        <RequestListSkeleton />
      ) : list.length === 0 ? (
        <EmptyRequests />
      ) : (
        <div
          className="rounded-[22px] overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {list.map((request, index) => (
            <button
              key={request.id}
              type="button"
              onClick={() => onOpen(request.id)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
              style={{
                borderTop: index ? '1px solid var(--border)' : undefined,
              }}
            >
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <AssetIcon symbol={request.asset} size={21} />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="truncate tabular-nums"
                  style={{
                    color: 'var(--foreground)',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {fmt(request.amount)} {request.asset}
                </p>

                <div className="flex items-center gap-1.5 mt-1">
                  <StatusDot status={request.status} />
                  <p
                    className="truncate"
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 11.5,
                    }}
                  >
                    {statusLabel(request.status)}
                  </p>
                </div>
              </div>

              <ChevronRight
                size={16}
                style={{ color: 'var(--muted-foreground)' }}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyRequests() {
  return (
    <div
      className="rounded-[22px] px-5 py-8 text-center"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="mx-auto w-11 h-11 rounded-[14px] flex items-center justify-center"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <Link2
          size={19}
          style={{ color: 'var(--muted-foreground)' }}
        />
      </div>

      <p
        className="mt-3"
        style={{
          color: 'var(--foreground)',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        No payment requests yet
      </p>

      <p
        className="mt-1"
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 12,
        }}
      >
        Your created payment links will appear here.
      </p>
    </div>
  );
}

function RequestListSkeleton() {
  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3.5 px-4 py-3.5"
          style={{
            borderTop: item ? '1px solid var(--border)' : undefined,
          }}
        >
          <div
            className="w-11 h-11 rounded-[14px] animate-pulse"
            style={{ background: 'var(--muted)' }}
          />
          <div className="flex-1">
            <div
              className="w-28 h-3.5 rounded animate-pulse"
              style={{ background: 'var(--muted)' }}
            />
            <div
              className="w-20 h-2.5 rounded mt-2 animate-pulse"
              style={{ background: 'var(--muted)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateForm({ onDone }: { onDone: (id: string) => void }) {
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
      : [{ symbol: 'USDT', balance: 0 } as any];
  }, [assets]);

  const [asset, setAsset] = useState(tokens[0]?.symbol || 'USDT');
  const [showToken, setShowToken] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [expiry, setExpiry] = useState('7d');
  const [customDate, setCustomDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const n = Number(amount) || 0;

  useEffect(() => {
    if (!asset && tokens[0]?.symbol) {
      setAsset(tokens[0].symbol);
    }
  }, [asset, tokens]);

  const selectedToken = tokens.find((token: any) => token.symbol === asset);

  const submit = async () => {
    if (!(n > 0)) {
      setError('Enter an amount greater than zero.');
      return;
    }

    let expiresAt: string;

    if (customDate) {
      expiresAt = new Date(`${customDate}T23:59:59`).toISOString();
    } else {
      const option = EXPIRY.find((item) => item.id === expiry) || EXPIRY[1];
      expiresAt = new Date(Date.now() + option.ms).toISOString();
    }

    setError('');
    setSubmitting(true);

    try {
      const request = await createRequest({
        asset,
        amount: n,
        note,
        expiresAt,
        creatorId: userId || 'local',
      });

      onDone(request.id);
    } catch (e: unknown) {
      const message =
        e &&
        typeof e === 'object' &&
        'body' in e
          ? String(
              (e as { body?: { message?: string; code?: string } }).body
                ?.message ||
                (e as { body?: { message?: string; code?: string } }).body
                  ?.code ||
                'Could not create request',
            )
          : 'Could not create request';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pb-14">
      <div
        className="rounded-[28px] p-5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              style={{
                color: 'var(--foreground)',
                fontSize: 15,
                fontWeight: 750,
              }}
            >
              Payment amount
            </p>
            <p
              className="mt-1"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11.5,
              }}
            >
              Enter what you want to receive
            </p>
          </div>

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--muted)' }}
          >
            <Link2 size={17} style={{ color: 'var(--primary)' }} />
          </div>
        </div>

        <div className="mt-7">
          <input
            value={amount}
            onChange={(event) => {
              const value = event.target.value
                .replace(/[^0-9.]/g, '')
                .replace(/(\..*)\./g, '$1');

              setAmount(value);
              setError('');
            }}
            inputMode="decimal"
            placeholder="0.00"
            autoFocus
            className="w-full bg-transparent outline-none text-left tabular-nums"
            style={{
              color: 'var(--foreground)',
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: -1.5,
            }}
          />

          <button
            type="button"
            onClick={() => setShowToken((value) => !value)}
            className="inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-xl"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            <AssetIcon symbol={asset} size={18} />
            <span
              style={{
                color: 'var(--foreground)',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {asset}
            </span>
            <ChevronDown
              size={14}
              style={{ color: 'var(--muted-foreground)' }}
            />
          </button>

          {selectedToken && (
            <p
              className="mt-2"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11,
              }}
            >
              Available: {fmt(selectedToken.balance)} {asset}
            </p>
          )}

          <AnimatePresence>
            {showToken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-3 rounded-2xl overflow-hidden max-h-48 overflow-y-auto"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {tokens.slice(0, 12).map((token: any) => (
                    <button
                      key={token.symbol}
                      type="button"
                      onClick={() => {
                        setAsset(token.symbol);
                        setShowToken(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      style={{
                        borderTop:
                          token.symbol === tokens[0]?.symbol
                            ? undefined
                            : '1px solid var(--border)',
                        background:
                          token.symbol === asset
                            ? 'var(--card)'
                            : undefined,
                      }}
                    >
                      <AssetIcon symbol={token.symbol} size={19} />

                      <span
                        className="flex-1"
                        style={{
                          color: 'var(--foreground)',
                          fontWeight: 650,
                          fontSize: 13,
                        }}
                      >
                        {token.symbol}
                      </span>

                      {token.symbol === asset && (
                        <Check
                          size={15}
                          style={{ color: 'var(--primary)' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <Field label="Note">
          <input
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 80))}
            placeholder="What is this payment for?"
            className="w-full bg-transparent outline-none"
            style={{
              color: 'var(--foreground)',
              fontSize: 14,
            }}
          />
        </Field>

        <ExpiryPicker
          label="Link expires"
          presets={EXPIRY}
          presetId={expiry}
          customDate={customDate}
          onPreset={setExpiry}
          onCustomDate={(date) => {
            setCustomDate(date);
            if (date) setExpiry('custom');
          }}
        />

        {error && (
          <div
            className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
            style={{
              background:
                'color-mix(in oklab, var(--destructive, #ef4444) 8%, var(--card))',
              border:
                '1px solid color-mix(in oklab, var(--destructive, #ef4444) 25%, var(--border))',
            }}
          >
            <XCircle
              size={16}
              style={{
                color: 'var(--destructive, #ef4444)',
                marginTop: 1,
                flexShrink: 0,
              }}
            />
            <p
              style={{
                color: 'var(--destructive, #ef4444)',
                fontSize: 12,
                lineHeight: 1.4,
              }}
            >
              {error}
            </p>
          </div>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: submitting ? 1 : 0.98 }}
          onClick={() => void submit()}
          disabled={submitting}
          className="w-full h-[52px] rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Creating link...
            </>
          ) : (
            <>
              <Link2 size={17} />
              Create payment link
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

function Detail({
  req: initial,
  onUpdate,
}: {
  req: PaymentRequest;
  onUpdate: (request: PaymentRequest) => void;
}) {
  const [req, setReq] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setReq(initial);
  }, [initial]);

  const url = payUrl(req.code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      return;
    }
  };

  const share = async () => {
    const text = `Pay ${fmt(req.amount)} ${req.asset} on Convia`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Convia payment request',
          text,
          url,
        });
      } else {
        await copy();
      }
    } catch {
      return;
    }
  };

  const doCancel = async () => {
    setCancelling(true);

    try {
      const updated = await cancelRequest(req.id);

      if (updated) {
        setReq(updated);
        onUpdate(updated);
      }
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  const open = req.status === 'open';

  return (
    <div className="px-5 pb-14">
      <section
        className="rounded-[28px] overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <Link2
                  size={15}
                  style={{ color: 'var(--primary)' }}
                />
              </div>

              <div>
                <p
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 12,
                    fontWeight: 750,
                  }}
                >
                  Payment request
                </p>
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 10,
                    marginTop: 1,
                  }}
                >
                  #{req.code}
                </p>
              </div>
            </div>

            <StatusBadge status={req.status} />
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-2.5">
              <AssetIcon symbol={req.asset} size={27} />

              <span
                className="tabular-nums"
                style={{
                  color: 'var(--foreground)',
                  fontSize: 35,
                  fontWeight: 800,
                  letterSpacing: -1.2,
                }}
              >
                {fmt(req.amount)}
              </span>
            </div>

            <p
              className="mt-1"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              {req.asset}
            </p>

            {req.note && (
              <div
                className="mt-5 rounded-2xl px-3.5 py-3"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Note
                </p>
                <p
                  className="mt-1"
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 13,
                    lineHeight: 1.45,
                  }}
                >
                  {req.note}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="mx-5 my-5 h-px"
          style={{ background: 'var(--border)' }}
        />

        <div className="px-5 pb-5">
          <div
            className="rounded-[22px] p-4"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex justify-center">
              <div
                className="rounded-[18px] p-3"
                style={{ background: '#fff' }}
              >
                <QRCodeDisplay
                  value={url}
                  size={148}
                  fgColor="#0A0A0A"
                  bgColor="#FFFFFF"
                />
              </div>
            </div>

            <div className="text-center mt-4">
              <p
                style={{
                  color: 'var(--foreground)',
                  fontSize: 13,
                  fontWeight: 750,
                }}
              >
                Scan to pay
              </p>

              <p
                className="mt-1"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  lineHeight: 1.4,
                }}
              >
                The payer can scan this code or open the payment link.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <DetailMeta
              icon={<Clock3 size={15} />}
              label="Expires"
              value={formatExpiry(req.expiresAt)}
            />
            <DetailMeta
              icon={<ShieldCheck size={15} />}
              label="Status"
              value={statusLabel(req.status)}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void copy()}
          className="h-[50px] rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: 'var(--card)',
            color: 'var(--foreground)',
            fontWeight: 700,
            fontSize: 13,
            border: '1px solid var(--border)',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy link'}
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => void share()}
          className="h-[50px] rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <Share2 size={16} />
          Share
        </motion.button>
      </div>

      {open && (
        <button
          type="button"
          onClick={() => setConfirmCancel(true)}
          disabled={cancelling}
          className="w-full h-[50px] rounded-2xl mt-3"
          style={{
            color: 'var(--destructive, #ef4444)',
            fontWeight: 650,
            fontSize: 13,
            border:
              '1px solid color-mix(in oklab, var(--destructive, #ef4444) 25%, var(--border))',
            opacity: cancelling ? 0.6 : 1,
          }}
        >
          {cancelling ? 'Cancelling...' : 'Cancel payment request'}
        </button>
      )}

      <p
        className="text-center mt-4 px-5"
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 10.5,
          lineHeight: 1.45,
        }}
      >
        Only share this link with the person you want to pay this request.
      </p>

      <ConfirmSheet
        open={confirmCancel}
        title="Cancel payment request?"
        body="This link will stop accepting payments. Anyone who has the link will no longer be able to complete this request."
        confirmLabel="Cancel request"
        cancelLabel="Keep open"
        destructive
        onConfirm={doCancel}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}

function DetailLoading() {
  return (
    <div className="px-5 pb-14">
      <div
        className="rounded-[28px] p-5"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Loader2
              size={24}
              className="animate-spin mx-auto"
              style={{ color: 'var(--primary)' }}
            />
            <p
              className="mt-3"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 12,
              }}
            >
              Loading payment request...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailError({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="px-5 pb-14">
      <div
        className="rounded-[28px] p-6 text-center"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="mx-auto w-11 h-11 rounded-[14px] flex items-center justify-center"
          style={{
            background:
              'color-mix(in oklab, var(--destructive, #ef4444) 8%, var(--muted))',
          }}
        >
          <XCircle
            size={20}
            style={{ color: 'var(--destructive, #ef4444)' }}
          />
        </div>

        <p
          className="mt-4"
          style={{
            color: 'var(--foreground)',
            fontSize: 15,
            fontWeight: 750,
          }}
        >
          Request unavailable
        </p>

        <p
          className="mt-1.5"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          {message}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="w-full h-11 rounded-xl mt-5 font-bold text-[13px]"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          Back to requests
        </button>
      </div>
    </div>
  );
}

function DetailMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-2xl px-3 py-3"
      style={{
        background: 'var(--muted)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center gap-1.5"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {icon}
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </span>
      </div>

      <p
        className="mt-1.5 truncate"
        style={{
          color: 'var(--foreground)',
          fontSize: 11.5,
          fontWeight: 650,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'open';

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
      style={{
        background: active
          ? 'color-mix(in oklab, var(--primary) 10%, var(--muted))'
          : 'var(--muted)',
        color: active
          ? 'var(--primary)'
          : 'var(--muted-foreground)',
        fontSize: 10,
        fontWeight: 750,
        border: '1px solid var(--border)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: active
            ? 'var(--primary)'
            : 'var(--muted-foreground)',
        }}
      />
      {statusLabel(status)}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{
        background:
          status === 'open'
            ? 'var(--primary)'
            : 'var(--muted-foreground)',
      }}
    />
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 11,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </p>

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

function statusLabel(status: string) {
  if (status === 'open') return 'Awaiting payment';
  if (status === 'paid') return 'Paid';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'expired') return 'Expired';
  return status;
}

function formatExpiry(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return 'Unknown';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmt(n: number) {
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 8 })
    : '0';
}