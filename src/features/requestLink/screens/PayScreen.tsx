import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, UserPlus, Wallet, Lock } from 'lucide-react';
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
  const req = useMemo(() => getRequest(code), [code]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const authenticated = status === 'authenticated' && !!userId;

  if (!req) {
    return (
      <Shell goBack={goBack} title="Payment">
        <Empty title="Link not found" body="This payment request is invalid or was removed." />
      </Shell>
    );
  }

  if (req.status === 'expired') {
    return (
      <Shell goBack={goBack} title="Payment">
        <Empty title="Expired" body="This payment request has expired." />
      </Shell>
    );
  }

  if (req.status === 'cancelled') {
    return (
      <Shell goBack={goBack} title="Payment">
        <Empty title="Cancelled" body="The sender cancelled this request." />
      </Shell>
    );
  }

  if (req.status === 'paid' || done) {
    return (
      <Shell goBack={goBack} title="Payment">
        <div className="px-5 text-center pt-12">
          <div
            className="mx-auto w-[72px] h-[72px] rounded-full flex items-center justify-center mb-5"
            style={{ background: 'color-mix(in oklab, var(--primary) 18%, transparent)' }}
          >
            <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}>Paid</p>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
            {fmt(req.amount)} {req.asset} sent to {req.creatorLabel}
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={goBack}
            className="mt-10 w-full py-4 rounded-full font-bold text-[15px]"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Done
          </motion.button>
        </div>
      </Shell>
    );
  }

  const onPay = () => {
    if (!authenticated || !userId) return;
    setBusy(true);
    setError('');
    const res = payRequest(req.code, userId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
  };

  const goAuth = (screen: 'signup' | 'login') => {
    try {
      sessionStorage.setItem('convia.pendingPay', code);
    } catch {
      /* ignore */
    }
    navigate(screen);
  };

  return (
    <Shell goBack={goBack} title="Pay">
      <div className="px-5 pb-14">
        <div
          className="relative overflow-hidden rounded-[28px] px-5 py-8 text-center mb-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div
            className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
            style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)' }}
          />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
            YOU ARE PAYING
          </p>
          <div className="relative flex items-center justify-center gap-3 mt-5">
            <AssetIcon symbol={req.asset} size={32} />
            <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 40, letterSpacing: -1.4 }}>
              {fmt(req.amount)}
            </p>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 15, marginTop: 4, fontWeight: 650 }}>{req.asset}</p>
          {req.note && (
            <p className="mt-5 px-2" style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45 }}>
              &ldquo;{req.note}&rdquo;
            </p>
          )}
          <p className="mt-4" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            To {req.creatorLabel}
          </p>
        </div>

        {!authenticated ? (
          <div className="rounded-[24px] p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'color-mix(in oklab, var(--primary) 14%, var(--muted))' }}
              >
                <Lock size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 16 }}>Account required</p>
                <p className="mt-1.5" style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.5 }}>
                  Create a Convia account or sign in to complete this payment securely from your balance.
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => goAuth('signup')}
              className="w-full h-[52px] rounded-full mt-6 font-bold text-[15px] flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <UserPlus size={18} />
              Create account
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => goAuth('login')}
              className="w-full h-[52px] rounded-full mt-2.5 font-bold text-[15px]"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
            >
              Sign in
            </motion.button>
          </div>
        ) : (
          <>
            <div
              className="flex items-center gap-3 rounded-[18px] px-4 py-3.5 mb-4"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <Wallet size={18} style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.4 }}>
                Taken from your Convia {req.asset} balance.
              </p>
            </div>
            {error && (
              <p className="mb-3" style={{ color: 'var(--destructive, #ef4444)', fontSize: 13 }}>
                {error}
              </p>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              onClick={onPay}
              className="w-full py-4 rounded-full font-bold text-[15px]"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', opacity: busy ? 0.7 : 1 }}
            >
              {busy ? 'Paying…' : `Pay ${fmt(req.amount)} ${req.asset}`}
            </motion.button>
          </>
        )}
      </div>
    </Shell>
  );
}

function Shell({ goBack, title, children }: { goBack: () => void; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={goBack} />
        <h1 className="flex-1 text-center pr-10" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-5 pt-14 text-center">
      <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 18 }}>{title}</p>
      <p className="mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.45 }}>
        {body}
      </p>
    </div>
  );
}

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 8 }) : '0';
}
