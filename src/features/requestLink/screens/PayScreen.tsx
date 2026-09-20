import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  UserPlus,
  Wallet,
  Lock,
  AlertCircle,
  Check,
  ArrowRight,
  Clock3,
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useAuth } from '../../../shared/context/AuthContext';
import { getRequest, payRequest } from '../store';

interface Props {
  code: string;
  goBack: () => void;
  navigate: (s: Screen, param?: string) => void;
}

export function PayScreen({ code, goBack, navigate }: Props) {
  const { status, userId } = useAuth();
  const [req, setReq] = useState<Awaited<ReturnType<typeof getRequest>>>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const resolvedCode = (() => {
    const c = (code || '').trim();
    if (c) return c;
    try {
      return sessionStorage.getItem('convia.pendingPay') || '';
    } catch {
      return '';
    }
  })();

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError('');

    if (!resolvedCode) {
      setReq(null);
      setLoadError('Missing payment code.');
      setLoading(false);
      return;
    }

    void getRequest(resolvedCode)
      .then((result) => {
        if (cancelled) return;
        setReq(result);
      })
      .catch(() => {
        if (!cancelled) {
          setReq(null);
          setLoadError('Could not load this payment request.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedCode]);

  const authenticated = status === 'authenticated' && !!userId;

  if (loading) {
    return (
      <Shell goBack={goBack} title="Payment">
        <StateCard
          icon={<Clock3 size={21} />}
          title="Loading payment"
          body="Fetching the payment request securely."
          loading
        />
      </Shell>
    );
  }

  if (loadError) {
    return (
      <Shell goBack={goBack} title="Payment">
        <StateCard
          icon={<AlertCircle size={21} />}
          title="Unable to load payment"
          body={loadError}
          actionLabel="Go back"
          onAction={goBack}
        />
      </Shell>
    );
  }

  if (!req) {
    return (
      <Shell goBack={goBack} title="Payment">
        <StateCard
          icon={<AlertCircle size={21} />}
          title="Payment link not found"
          body="This payment request is invalid, unavailable, or was removed."
          actionLabel="Go back"
          onAction={goBack}
        />
      </Shell>
    );
  }

  if (req.status === 'expired') {
    return (
      <Shell goBack={goBack} title="Payment">
        <StateCard
          icon={<Clock3 size={21} />}
          title="Payment link expired"
          body="This request is no longer accepting payments."
          actionLabel="Go back"
          onAction={goBack}
        />
      </Shell>
    );
  }

  if (req.status === 'cancelled') {
    return (
      <Shell goBack={goBack} title="Payment">
        <StateCard
          icon={<AlertCircle size={21} />}
          title="Payment cancelled"
          body="The sender cancelled this payment request."
          actionLabel="Go back"
          onAction={goBack}
        />
      </Shell>
    );
  }

  if (req.status === 'paid' || done) {
    return (
      <Shell goBack={goBack} title="Payment complete">
        <SuccessState req={req} onDone={goBack} />
      </Shell>
    );
  }

  const onPay = async () => {
    if (!authenticated || !userId || busy) return;

    setBusy(true);
    setError('');

    try {
      const result = await payRequest(req.code || resolvedCode, userId);

      if (!result.ok) {
        setError(result.error || 'Payment could not be completed.');
        return;
      }

      setDone(true);
    } catch {
      setError('Payment could not be completed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const goAuth = (screen: 'signup' | 'login') => {
    try {
      sessionStorage.setItem('convia.pendingPay', resolvedCode);
    } catch {
      return;
    }

    navigate(screen);
  };

  return (
    <Shell goBack={goBack} title="Review payment">
      <div className="px-5 pb-14">
        <PaymentSummary req={req} />

        {!authenticated ? (
          <AuthPrompt
            onSignup={() => goAuth('signup')}
            onLogin={() => goAuth('login')}
          />
        ) : (
          <AuthorizationPanel
            req={req}
            error={error}
            busy={busy}
            onPay={onPay}
          />
        )}
      </div>
    </Shell>
  );
}

function PaymentSummary({
  req,
}: {
  req: NonNullable<Awaited<ReturnType<typeof getRequest>>>;
}) {
  return (
    <section
      className="rounded-[28px] overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="px-5 pt-5 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              <Wallet size={17} style={{ color: 'var(--primary)' }} />
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

          <span
            className="px-2.5 py-1.5 rounded-full"
            style={{
              background:
                'color-mix(in oklab, var(--primary) 9%, var(--muted))',
              color: 'var(--primary)',
              border: '1px solid var(--border)',
              fontSize: 10,
              fontWeight: 750,
            }}
          >
            Awaiting payment
          </span>
        </div>

        <div className="text-center pt-8 pb-5">
          <div className="flex justify-center items-center gap-2.5">
            <AssetIcon symbol={req.asset} size={30} />

            <span
              className="tabular-nums"
              style={{
                color: 'var(--foreground)',
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: -1.5,
              }}
            >
              {fmt(req.amount)}
            </span>
          </div>

          <p
            className="mt-1"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 14,
              fontWeight: 650,
            }}
          >
            {req.asset}
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          <InfoRow
            label="Recipient"
            value={req.creatorLabel || 'Convia user'}
          />

          {req.note && (
            <InfoRow
              label="Note"
              value={req.note}
            />
          )}

          <InfoRow
            label="Expires"
            value={formatExpiry(req.expiresAt)}
            last
          />
        </div>
      </div>
    </section>
  );
}

function AuthPrompt({
  onSignup,
  onLogin,
}: {
  onSignup: () => void;
  onLogin: () => void;
}) {
  return (
    <section
      className="rounded-[24px] p-5 mt-4"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            background:
              'color-mix(in oklab, var(--primary) 10%, var(--muted))',
            border: '1px solid var(--border)',
          }}
        >
          <Lock size={19} style={{ color: 'var(--primary)' }} />
        </div>

        <div>
          <p
            style={{
              color: 'var(--foreground)',
              fontWeight: 750,
              fontSize: 15,
            }}
          >
            Sign in to pay
          </p>

          <p
            className="mt-1.5"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            Your Convia account is required to authorize this payment from
            your available balance.
          </p>
        </div>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onSignup}
        className="w-full h-[50px] rounded-2xl mt-5 font-bold text-[14px] flex items-center justify-center gap-2"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        <UserPlus size={17} />
        Create account
      </motion.button>

      <button
        type="button"
        onClick={onLogin}
        className="w-full h-[48px] rounded-2xl mt-2.5 font-bold text-[13px]"
        style={{
          background: 'var(--muted)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        }}
      >
        Sign in
      </button>
    </section>
  );
}

function AuthorizationPanel({
  req,
  error,
  busy,
  onPay,
}: {
  req: NonNullable<Awaited<ReturnType<typeof getRequest>>>;
  error: string;
  busy: boolean;
  onPay: () => void;
}) {
  return (
    <section className="mt-4">
      <div
        className="rounded-[22px] px-4 py-3.5"
        style={{
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={18}
            style={{
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          />

          <div className="min-w-0">
            <p
              style={{
                color: 'var(--foreground)',
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              Paying from your Convia balance
            </p>

            <p
              className="mt-0.5"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11,
              }}
            >
              {req.asset} balance
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3 mt-3"
          style={{
            background:
              'color-mix(in oklab, var(--destructive, #ef4444) 8%, var(--card))',
            border:
              '1px solid color-mix(in oklab, var(--destructive, #ef4444) 24%, var(--border))',
          }}
        >
          <AlertCircle
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
        whileTap={{ scale: busy ? 1 : 0.98 }}
        disabled={busy}
        onClick={onPay}
        className="w-full h-[54px] rounded-2xl mt-4 font-bold text-[14px] flex items-center justify-center gap-2"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          opacity: busy ? 0.65 : 1,
        }}
      >
        {busy ? (
          <>
            <span
              className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            />
            Processing payment...
          </>
        ) : (
          <>
            Pay {fmt(req.amount)} {req.asset}
            <ArrowRight size={17} />
          </>
        )}
      </motion.button>

      <p
        className="text-center mt-3 px-4"
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 10.5,
          lineHeight: 1.45,
        }}
      >
        Review the recipient and amount before confirming.
      </p>
    </section>
  );
}

function SuccessState({
  req,
  onDone,
}: {
  req: NonNullable<Awaited<ReturnType<typeof getRequest>>>;
  onDone: () => void;
}) {
  return (
    <div className="px-5 pb-14 pt-8">
      <div className="text-center">
        <div
          className="mx-auto w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
          style={{
            background:
              'color-mix(in oklab, var(--primary) 12%, var(--muted))',
            border:
              '1px solid color-mix(in oklab, var(--primary) 25%, var(--border))',
          }}
        >
          <Check
            size={32}
            strokeWidth={2.4}
            style={{ color: 'var(--primary)' }}
          />
        </div>

        <p
          className="mt-5"
          style={{
            color: 'var(--foreground)',
            fontWeight: 800,
            fontSize: 23,
            letterSpacing: -0.4,
          }}
        >
          Payment complete
        </p>

        <p
          className="mt-2"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          Your payment was sent successfully.
        </p>
      </div>

      <div
        className="rounded-[24px] overflow-hidden mt-7"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="px-5 py-5 text-center">
          <div className="flex justify-center items-center gap-2.5">
            <AssetIcon symbol={req.asset} size={26} />

            <span
              className="tabular-nums"
              style={{
                color: 'var(--foreground)',
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: -1,
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
        </div>

        <div
          className="h-px"
          style={{ background: 'var(--border)' }}
        />

        <InfoRow
          label="Sent to"
          value={req.creatorLabel || 'Convia user'}
        />

        <InfoRow
          label="Status"
          value="Completed"
          last
        />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onDone}
        className="w-full h-[52px] rounded-2xl mt-5 font-bold text-[14px]"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        Done
      </motion.button>
    </div>
  );
}

function StateCard({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  loading,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="px-5 pt-12 pb-14">
      <div
        className="rounded-[28px] p-6 text-center"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          className="mx-auto w-12 h-12 rounded-[15px] flex items-center justify-center"
          style={{
            background: 'var(--muted)',
            color: loading
              ? 'var(--primary)'
              : 'var(--muted-foreground)',
          }}
        >
          <span className={loading ? 'animate-pulse' : ''}>
            {icon}
          </span>
        </div>

        <p
          className="mt-4"
          style={{
            color: 'var(--foreground)',
            fontWeight: 750,
            fontSize: 17,
          }}
        >
          {title}
        </p>

        <p
          className="mt-2"
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          {body}
        </p>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="w-full h-11 rounded-xl mt-5 font-bold text-[13px]"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3.5"
      style={{
        borderBottom: last ? undefined : '1px solid var(--border)',
      }}
    >
      <span
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 11,
        }}
      >
        {label}
      </span>

      <span
        className="text-right truncate"
        style={{
          color: 'var(--foreground)',
          fontSize: 12,
          fontWeight: 650,
          maxWidth: '65%',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Shell({
  goBack,
  title,
  children,
}: {
  goBack: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--background)' }}
    >
      <PageTop />

      <div className="flex items-center gap-3 px-5 pb-3">
        <BackButton onClick={goBack} />

        <h1
          className="flex-1 truncate"
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

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
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