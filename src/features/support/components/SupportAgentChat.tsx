import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Loader,
  Paperclip,
  Send,
  Sparkles,
  UserRound,
  Landmark,
  ArrowUpFromLine,
  ArrowLeftRight,
  Wallet,
  Receipt,
  Shield,
  MessageCircle,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import * as aiSupport from '../../../shared/api/aiSupport';
import type { AgentTurnResult } from '../../../shared/api/aiSupport';
import { BackButton } from '../../../shared/components/BackButton';
import { PageTop } from '../../../shared/components/PageTop';

type Bubble = { id: string; role: 'user' | 'assistant' | 'system'; body: string };

type CategoryId =
  | 'deposit'
  | 'withdrawal'
  | 'swap'
  | 'balance'
  | 'transaction'
  | 'account'
  | 'other';

type SubProblem = {
  id: string;
  label: string;
  message: string;
  openPicker?: 'deposit' | 'withdrawal' | 'swap' | 'all';
};

type Category = {
  id: CategoryId;
  label: string;
  hint: string;
  icon: typeof Landmark;
  subs: SubProblem[];
};

const CATEGORIES: Category[] = [
  {
    id: 'deposit',
    label: 'Deposit problem',
    hint: 'Bank, card, or on-chain',
    icon: Landmark,
    subs: [
      {
        id: 'missing',
        label: 'I paid but it’s missing',
        message:
          'I made a deposit but it is missing from my balance. Please list my on-ramp deposit requests and ledger deposits with status, amount, and dates.',
        openPicker: 'deposit',
      },
      {
        id: 'pending',
        label: 'Deposit is still pending',
        message:
          'My deposit is still pending. Please list pending deposit requests and explain status for each.',
        openPicker: 'deposit',
      },
      {
        id: 'wrong_asset',
        label: 'I sent the wrong asset',
        message:
          'I may have sent the wrong asset to a deposit address. Please list my wallet addresses and recent deposit activity so we can investigate.',
        openPicker: 'deposit',
      },
      {
        id: 'wrong_network',
        label: 'Wrong network',
        message:
          'I may have deposited on the wrong network. Please list my deposit addresses and recent on-chain related activity.',
        openPicker: 'deposit',
      },
      {
        id: 'rejected',
        label: 'Deposit was rejected',
        message:
          'My deposit was rejected or failed. Please list failed or rejected deposit requests and reasons if available.',
        openPicker: 'deposit',
      },
      {
        id: 'other',
        label: 'Something else about deposit',
        message: 'I have a deposit issue. Please list recent deposit requests so I can attach one.',
        openPicker: 'deposit',
      },
    ],
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal problem',
    hint: 'Bank payout or on-chain',
    icon: ArrowUpFromLine,
    subs: [
      {
        id: 'pending',
        label: 'Withdrawal pending too long',
        message:
          'My withdrawal is pending too long. Please list recent withdrawals with amounts, assets, and status.',
        openPicker: 'withdrawal',
      },
      {
        id: 'failed',
        label: 'Withdrawal failed',
        message:
          'My withdrawal failed. Please list recent failed or incomplete withdrawals with status.',
        openPicker: 'withdrawal',
      },
      {
        id: 'not_received',
        label: 'Not received at bank / wallet',
        message:
          'I withdrew but funds were not received at my bank or external wallet. Please list recent withdrawals so I can attach the correct one.',
        openPicker: 'withdrawal',
      },
      {
        id: 'other',
        label: 'Something else about withdrawal',
        message: 'I have a withdrawal issue. Please list recent withdrawals.',
        openPicker: 'withdrawal',
      },
    ],
  },
  {
    id: 'swap',
    label: 'Swap problem',
    hint: 'Convert between assets',
    icon: ArrowLeftRight,
    subs: [
      {
        id: 'failed',
        label: 'Swap failed',
        message: 'My swap failed or did not complete. Please list recent swaps with amounts and status.',
        openPicker: 'swap',
      },
      {
        id: 'wrong_amount',
        label: 'Wrong amount received',
        message:
          'I swapped but received a different amount than expected. Please list recent swaps with from/to amounts.',
        openPicker: 'swap',
      },
      {
        id: 'other',
        label: 'Something else about swap',
        message: 'I have a swap issue. Please list recent swaps.',
        openPicker: 'swap',
      },
    ],
  },
  {
    id: 'balance',
    label: 'Balance problem',
    hint: 'What I hold right now',
    icon: Wallet,
    subs: [
      {
        id: 'show',
        label: 'Show my balances',
        message: 'Please show all my wallet balances with assets and amounts.',
      },
      {
        id: 'trail',
        label: 'Where did my money go?',
        message:
          'Please show my financial timeline and balances so I can see where funds moved.',
      },
    ],
  },
  {
    id: 'transaction',
    label: 'Transaction issue',
    hint: 'Find or dispute a movement',
    icon: Receipt,
    subs: [
      {
        id: 'find',
        label: 'Find a transaction',
        message: 'Please list my recent transactions so I can find and attach one.',
        openPicker: 'all',
      },
      {
        id: 'dispute',
        label: 'Problem with a transaction',
        message:
          'I have a problem with a specific transaction. Please list recent movements so I can attach it.',
        openPicker: 'all',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & security',
    hint: 'KYC, login, PIN',
    icon: Shield,
    subs: [
      {
        id: 'kyc',
        label: 'KYC / verification',
        message: 'Please check my KYC status and explain what is blocking full access if anything.',
      },
      {
        id: 'login',
        label: 'Login or device issue',
        message:
          'I have a login or device access issue. Please check my profile and KYC status, then advise next steps.',
      },
      {
        id: 'security',
        label: 'Security concern',
        message:
          'I have a security concern with my account. Please check my profile status and open a human case if needed.',
      },
    ],
  },
  {
    id: 'other',
    label: 'Something else',
    hint: 'Describe in your own words',
    icon: MessageCircle,
    subs: [],
  },
];

/**
 * Structured Support Command + AI chat.
 * Category → sub-problem → tools; free text always available; attach is first-class.
 */
export function SupportAgentChat({ onBack }: { onBack: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<'home' | 'subs' | 'chat'>('home');
  const [category, setCategory] = useState<Category | null>(null);
  const [suggestAttach, setSuggestAttach] = useState(false);
  const [suggestEscalate, setSuggestEscalate] = useState(false);
  const [suggestReconcile, setSuggestReconcile] = useState(false);
  const [pendingDepositId, setPendingDepositId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    toolName: string;
    args?: Record<string, unknown>;
    summary?: string;
  } | null>(null);
  const [pickerTab, setPickerTab] = useState<'all' | 'deposit' | 'withdrawal' | 'swap'>('all');
  const [attachedLabel, setAttachedLabel] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [txOptions, setTxOptions] = useState<Array<{ id: string; label: string; type: string }>>([]);
  const [txLoading, setTxLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const s = await aiSupport.createAgentSession();
        setSessionId(s.id);
        const live = s.llmEnabled ? ' AI is live.' : '';
        setBubbles([
          {
            id: 'welcome',
            role: 'assistant',
            body:
              "Hi — I'm Convia Support." +
              live +
              ' Choose a topic below or type what happened. For money issues, pick the exact transaction when asked.',
          },
        ]);
      } catch {
        setBubbles([
          {
            id: 'offline',
            role: 'system',
            body: 'Support is unavailable right now. Try again shortly or open a manual case.',
          },
        ]);
        setStep('chat');
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, busy, step]);

  useEffect(() => {
    if (!pickerOpen || !sessionId) return;
    void loadTxOptions(pickerTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerTab, pickerOpen, sessionId]);

  const applyTurn = (res: AgentTurnResult, replaceStream = false) => {
    setBubbles((b) => {
      const withoutStream = replaceStream ? b.filter((x) => !x.id.startsWith('stream-')) : b;
      return [
        ...withoutStream,
        { id: `a-${Date.now()}`, role: 'assistant', body: res.reply || 'Done.' },
      ];
    });
    setSuggestAttach(!!res.suggestAttachTx);
    setSuggestEscalate(!!res.suggestEscalate);
    setSuggestReconcile(!!res.suggestReconcile);
    if (res.attachedTxLabel) setAttachedLabel(res.attachedTxLabel);

    const depTool = res.toolsRun?.find((t) => t.name === 'get_deposit_requests' && t.ok);
    const items = (depTool?.data as { items?: Array<{ id: string; status?: string }> } | undefined)
      ?.items;
    const pending = items?.find((x) => String(x.status).toLowerCase() === 'pending');
    if (pending) setPendingDepositId(pending.id);

    const needs = res.toolsRun?.find(
      (t) => t.error === 'needs_confirmation' || (!t.ok && t.summary?.includes('confirmation')),
    );
    if (needs) {
      const data = (needs.data || {}) as { pendingTool?: string; args?: Record<string, unknown> };
      setPendingConfirm({
        toolName: data.pendingTool || needs.name,
        args: data.args,
        summary: needs.summary,
      });
    } else {
      setPendingConfirm(null);
    }
  };

  const send = async (text: string, forceEscalate?: boolean) => {
    if (!sessionId || !text.trim() || busy) return;
    const msg = text.trim();
    setInput('');
    setStep('chat');
    setBubbles((b) => [...b, { id: `u-${Date.now()}`, role: 'user', body: msg }]);
    setBusy(true);
    try {
      if (forceEscalate) {
        applyTurn(await aiSupport.sendAgentMessage(sessionId, msg, true));
      } else {
        await aiSupport.streamAgentMessage(sessionId, msg, {
          onPartial: (partial) => {
            setBubbles((b) => {
              const last = b[b.length - 1];
              if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
                return [...b.slice(0, -1), { ...last, body: partial }];
              }
              return [...b, { id: `stream-${Date.now()}`, role: 'assistant', body: partial }];
            });
          },
          onDone: (res) => applyTurn(res, true),
          onError: () => {
            setBubbles((b) => [
              ...b,
              { id: `e-${Date.now()}`, role: 'system', body: 'Agent error. Try again.' },
            ]);
          },
        });
      }
    } catch {
      setBubbles((b) => [
        ...b,
        {
          id: `e-${Date.now()}`,
          role: 'system',
          body: 'Could not reach support. Try again or open a manual case.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const selectCategory = (c: Category) => {
    if (c.id === 'other' || c.subs.length === 0) {
      setCategory(c);
      setStep('chat');
      setBubbles((b) => [
        ...b,
        {
          id: `sys-${Date.now()}`,
          role: 'system',
          body: 'Describe what happened in your own words.',
        },
      ]);
      setTimeout(() => inputRef.current?.focus(), 80);
      return;
    }
    setCategory(c);
    setStep('subs');
  };

  const selectSub = (sub: SubProblem) => {
    if (sub.openPicker) setPickerTab(sub.openPicker);
    void send(sub.message).then(() => {
      if (sub.openPicker) {
        // nudge attach after tools return
        setTimeout(() => setSuggestAttach(true), 400);
      }
    });
  };

  const loadTxOptions = async (tab: typeof pickerTab) => {
    if (!sessionId) return;
    setTxLoading(true);
    try {
      const res = await aiSupport.listAgentTransactions(
        sessionId,
        tab === 'all' ? undefined : tab,
      );
      const items = [...(res.items || []), ...(res.depositRequests || [])];
      setTxOptions(
        items.map((t) => ({
          id: t.id,
          type: t.type,
          label: t.label || `${t.publicRef} · ${t.amount} ${t.asset}`,
        })),
      );
    } catch {
      setTxOptions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const openPicker = async (tab?: typeof pickerTab) => {
    if (tab) setPickerTab(tab);
    setPickerOpen(true);
  };

  const attach = async (tx: { id: string; type: string; label: string }) => {
    if (!sessionId) return;
    setBusy(true);
    try {
      const r = await aiSupport.attachAgentTransaction(sessionId, {
        transactionId: tx.id,
        type: tx.type,
        label: tx.label,
      });
      const label = r.attachedTxLabel || tx.label;
      setAttachedLabel(label);
      setPickerOpen(false);
      setSuggestAttach(false);
      setBubbles((b) => [
        ...b,
        { id: `sys-${Date.now()}`, role: 'system', body: `Attached: ${label}` },
      ]);
      await send(
        `I attached ${label}. Please inspect this item and explain the current status in detail.`,
      );
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Could not attach.';
      setBubbles((b) => [
        ...b,
        { id: `sys-e-${Date.now()}`, role: 'system', body: `Could not attach: ${msg}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const goHome = () => {
    setStep('home');
    setCategory(null);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Header */}
      <div className="px-5 mb-2 flex items-center gap-3">
        <BackButton
          onClick={() => {
            if (step === 'subs') setStep('home');
            else if (step === 'chat' && category) setStep(category.subs.length ? 'subs' : 'home');
            else onBack();
          }}
        />
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>
            {step === 'home' ? 'Help command' : step === 'subs' ? category?.label : 'Support Agent'}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="truncate">
            {attachedLabel
              ? `Attached · ${attachedLabel}`
              : step === 'home'
                ? 'Pick a topic or type below'
                : 'Investigates your account safely'}
          </p>
        </div>
        <Sparkles size={18} style={{ color: 'var(--primary)' }} />
      </div>

      {/* Command search strip on home */}
      {step === 'home' && (
        <div className="px-5 mb-3">
          <div
            className="flex items-center gap-2 h-12 px-3.5 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) void send(input);
              }}
              placeholder="Type a problem or choose below…"
              className="flex-1 bg-transparent outline-none text-[14px]"
              style={{ color: 'var(--foreground)' }}
            />
            {input.trim() && (
              <button
                type="button"
                onClick={() => void send(input)}
                className="h-8 px-3 rounded-full text-[12px] font-bold"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Ask
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-3">
        {/* Chat bubbles */}
        <div className="space-y-3 mb-4">
          {bubbles.map((m) => {
            const isUser = m.role === 'user';
            const isSystem = m.role === 'system';
            return (
              <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[88%] px-3.5 py-2.5 rounded-[18px] whitespace-pre-wrap"
                  style={{
                    background: isUser
                      ? 'var(--primary)'
                      : isSystem
                        ? 'var(--muted)'
                        : 'var(--card)',
                    color: isUser ? 'var(--primary-foreground)' : 'var(--foreground)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          {busy && (
            <div className="flex items-center gap-2">
              <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Checking your account…</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* HOME — categories */}
          {step === 'home' && sessionId && !busy && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-2 pb-4"
            >
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  marginBottom: 8,
                }}
              >
                WHAT CAN WE HELP WITH?
              </p>
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCategory(c)}
                    className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-left active:scale-[0.99] transition-transform"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          'color-mix(in srgb, var(--primary) 14%, var(--muted))',
                      }}
                    >
                      <Icon size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 14.5 }}>
                        {c.label}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{c.hint}</p>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* SUBS — what happened */}
          {step === 'subs' && category && !busy && (
            <motion.div
              key="subs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-2 pb-4"
            >
              <p
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                WHAT HAPPENED?
              </p>
              {category.subs.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => selectSub(sub)}
                  className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl text-left"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                      {sub.label}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              ))}
              <button
                type="button"
                onClick={goHome}
                className="w-full h-11 rounded-2xl text-[13px] font-bold mt-2"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                ← All topics
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat action chips */}
        {step === 'chat' && !busy && (
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={goHome}
              className="h-8 px-3 rounded-full text-[11px] font-bold"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              Topics
            </button>
            {(suggestAttach || true) && (
              <button
                type="button"
                onClick={() => void openPicker()}
                className="h-8 px-3 rounded-full text-[11px] font-bold flex items-center gap-1"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                <Paperclip size={12} /> Select transaction
              </button>
            )}
            {suggestEscalate && (
              <button
                type="button"
                onClick={() => void send('Please escalate this to a human agent', true)}
                className="h-8 px-3 rounded-full text-[11px] font-bold flex items-center gap-1"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                <UserRound size={12} /> Human agent
              </button>
            )}
            {suggestReconcile && pendingDepositId && (
              <button
                type="button"
                onClick={async () => {
                  if (!sessionId || !pendingDepositId) return;
                  setBusy(true);
                  try {
                    const r = await aiSupport.reconcileDeposit(sessionId, pendingDepositId);
                    setBubbles((b) => [
                      ...b,
                      {
                        id: `rec-${Date.now()}`,
                        role: 'assistant',
                        body: r.summary || 'Reconciliation completed.',
                      },
                    ]);
                    setSuggestReconcile(false);
                  } catch {
                    setBubbles((b) => [
                      ...b,
                      {
                        id: `rec-e-${Date.now()}`,
                        role: 'system',
                        body: 'Reconciliation blocked by safety checks.',
                      },
                    ]);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="h-8 px-3 rounded-full text-[11px] font-bold"
                style={{ background: 'var(--positive)', color: '#fff' }}
              >
                Credit verified deposit
              </button>
            )}
          </div>
        )}
      </div>

      {pendingConfirm && (
        <div
          className="mx-5 mb-2 rounded-2xl p-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 650 }}>
            {pendingConfirm.summary || 'Confirm this action'}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                if (!sessionId) return;
                setBusy(true);
                try {
                  const r = await aiSupport.confirmAgentTool(sessionId, {
                    toolName: pendingConfirm.toolName,
                    args: pendingConfirm.args,
                  });
                  setBubbles((b) => [
                    ...b,
                    {
                      id: `c-${Date.now()}`,
                      role: 'assistant',
                      body: r.summary || (r.ok ? 'Action confirmed.' : r.error || 'Done.'),
                    },
                  ]);
                  setPendingConfirm(null);
                } catch {
                  setBubbles((b) => [
                    ...b,
                    { id: `c-e-${Date.now()}`, role: 'system', body: 'Confirmation failed.' },
                  ]);
                } finally {
                  setBusy(false);
                }
              }}
              className="h-9 px-4 rounded-full text-[12px] font-bold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setPendingConfirm(null)}
              className="h-9 px-4 rounded-full text-[12px] font-bold"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Composer — always on chat / always allow type from home via search */}
      {step !== 'home' && (
        <div className="px-5 pb-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void openPicker()}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            aria-label="Select transaction"
          >
            <Paperclip size={18} style={{ color: 'var(--foreground)' }} />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Or type what happened…"
            disabled={!sessionId || busy}
            className="flex-1 h-11 rounded-full px-4 text-[14px] outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <button
            type="button"
            disabled={busy || !input.trim()}
            onClick={() => void send(input)}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              opacity: busy || !input.trim() ? 0.55 : 1,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      )}

      {/* Transaction picker sheet — first-class cards */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setPickerOpen(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-t-[28px] p-5 max-h-[75vh] overflow-y-auto"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17 }}>
                Select transaction
              </p>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 14 }}>
              Choose the exact movement — no need to paste a hash.
            </p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {(['all', 'deposit', 'withdrawal', 'swap'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPickerTab(tab)}
                  className="h-8 px-3 rounded-full text-[11px] font-bold capitalize"
                  style={{
                    background: pickerTab === tab ? 'var(--primary)' : 'var(--muted)',
                    color:
                      pickerTab === tab
                        ? 'var(--primary-foreground)'
                        : 'var(--muted-foreground)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            {txLoading ? (
              <div className="flex justify-center py-10">
                <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            ) : txOptions.filter(
                (tx) => pickerTab === 'all' || tx.type.toLowerCase().includes(pickerTab),
              ).length === 0 ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                  No matching transactions
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 6 }}>
                  Try another tab, or type a public reference (e.g. DEP-…) in chat.
                </p>
              </div>
            ) : (
              txOptions
                .filter((tx) => pickerTab === 'all' || tx.type.toLowerCase().includes(pickerTab))
                .map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => void attach(tx)}
                    className="w-full text-left px-4 py-3.5 rounded-2xl mb-2"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13.5 }}>
                      {tx.label}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 3 }}>
                      {tx.type}
                    </p>
                  </button>
                ))
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
