import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2,
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
  ChevronLeft,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import * as aiSupport from '../../../shared/api/aiSupport';
import type { AgentTurnResult } from '../../../shared/api/aiSupport';
import { BackButton } from '../../../shared/components/BackButton';
import { PageTop } from '../../../shared/components/PageTop';

type Role = 'user' | 'assistant' | 'system';

type Bubble = {
  id: string;
  role: Role;
  /** Short text shown in the bubble */
  body: string;
  /** Optional structured rows under the text */
  rows?: Array<{ title: string; meta?: string; tone?: 'ok' | 'pending' | 'bad' | 'neutral' }>;
  toolsHint?: string;
};

type CategoryId = 'deposit' | 'withdrawal' | 'swap' | 'balance' | 'transaction' | 'account' | 'other';

type SubProblem = {
  id: string;
  label: string;
  /** Short label stored as the user bubble */
  userLabel: string;
  /** Full prompt sent to API (never shown as the user bubble) */
  prompt: string;
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
    label: 'Deposit',
    hint: 'Bank, card, on-chain',
    icon: Landmark,
    subs: [
      {
        id: 'missing',
        label: 'Paid but missing',
        userLabel: 'Deposit missing',
        prompt:
          'I made a deposit but it is missing from my balance. List on-ramp deposit requests and ledger deposits with status, amount, and dates.',
        openPicker: 'deposit',
      },
      {
        id: 'pending',
        label: 'Still pending',
        userLabel: 'Deposit still pending',
        prompt: 'My deposit is still pending. List pending deposit requests and status for each.',
        openPicker: 'deposit',
      },
      {
        id: 'wrong_asset',
        label: 'Wrong asset',
        userLabel: 'Wrong asset deposited',
        prompt: 'I may have sent the wrong asset. List wallet addresses and recent deposit activity.',
        openPicker: 'deposit',
      },
      {
        id: 'wrong_network',
        label: 'Wrong network',
        userLabel: 'Wrong network deposit',
        prompt: 'I may have used the wrong network. List deposit addresses and recent deposit activity.',
        openPicker: 'deposit',
      },
      {
        id: 'rejected',
        label: 'Rejected / failed',
        userLabel: 'Deposit rejected',
        prompt: 'My deposit was rejected or failed. List failed deposit requests if any.',
        openPicker: 'deposit',
      },
    ],
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal',
    hint: 'Bank or on-chain out',
    icon: ArrowUpFromLine,
    subs: [
      {
        id: 'pending',
        label: 'Pending too long',
        userLabel: 'Withdrawal pending',
        prompt: 'My withdrawal is pending too long. List recent withdrawals with amounts and status.',
        openPicker: 'withdrawal',
      },
      {
        id: 'failed',
        label: 'Failed',
        userLabel: 'Withdrawal failed',
        prompt: 'My withdrawal failed. List recent failed or incomplete withdrawals.',
        openPicker: 'withdrawal',
      },
      {
        id: 'not_received',
        label: 'Not received',
        userLabel: 'Withdrawal not received',
        prompt:
          'I withdrew but funds were not received. List recent withdrawals so I can attach the correct one.',
        openPicker: 'withdrawal',
      },
    ],
  },
  {
    id: 'swap',
    label: 'Swap',
    hint: 'Convert assets',
    icon: ArrowLeftRight,
    subs: [
      {
        id: 'failed',
        label: 'Swap failed',
        userLabel: 'Swap failed',
        prompt: 'My swap failed. List recent swaps with amounts and status.',
        openPicker: 'swap',
      },
      {
        id: 'wrong_amount',
        label: 'Wrong amount',
        userLabel: 'Swap amount looks wrong',
        prompt: 'I swapped but the amount looks wrong. List recent swaps.',
        openPicker: 'swap',
      },
    ],
  },
  {
    id: 'balance',
    label: 'Balance',
    hint: 'What I hold',
    icon: Wallet,
    subs: [
      {
        id: 'show',
        label: 'Show balances',
        userLabel: 'Show my balances',
        prompt: 'Show all my wallet balances with assets and amounts.',
      },
      {
        id: 'trail',
        label: 'Where did money go?',
        userLabel: 'Where did my money go?',
        prompt: 'Show my financial timeline and balances.',
      },
    ],
  },
  {
    id: 'transaction',
    label: 'Transaction',
    hint: 'Find a movement',
    icon: Receipt,
    subs: [
      {
        id: 'find',
        label: 'Find transaction',
        userLabel: 'Find a transaction',
        prompt: 'List my recent transactions so I can attach one.',
        openPicker: 'all',
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    hint: 'KYC, login, security',
    icon: Shield,
    subs: [
      {
        id: 'kyc',
        label: 'KYC status',
        userLabel: 'Check KYC status',
        prompt: 'Check my KYC status and explain any block on full access.',
      },
      {
        id: 'login',
        label: 'Login / device',
        userLabel: 'Login or device issue',
        prompt: 'I have a login or device access issue. Check profile and KYC, then advise next steps.',
      },
      {
        id: 'security',
        label: 'Security',
        userLabel: 'Security concern',
        prompt: 'I have a security concern. Check profile status and advise.',
      },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    hint: 'Type freely',
    icon: MessageCircle,
    subs: [],
  },
];

function toneFromStatus(s?: string): 'ok' | 'pending' | 'bad' | 'neutral' {
  const v = (s || '').toLowerCase();
  if (/(complete|success|credited|posted|approved)/.test(v)) return 'ok';
  if (/(pending|processing|queued|review)/.test(v)) return 'pending';
  if (/(fail|reject|cancel|error|block)/.test(v)) return 'bad';
  return 'neutral';
}

function ToneIcon({ tone }: { tone: 'ok' | 'pending' | 'bad' | 'neutral' }) {
  if (tone === 'ok') return <CheckCircle2 size={14} style={{ color: 'var(--positive)' }} />;
  if (tone === 'pending') return <Clock size={14} style={{ color: 'var(--primary)' }} />;
  if (tone === 'bad') return <AlertCircle size={14} style={{ color: '#f87171' }} />;
  return <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--muted-foreground)' }} />;
}

/** Parse agent reply into headline + optional list rows for card UI */
function structureReply(res: AgentTurnResult): { body: string; rows?: Bubble['rows'] } {
  const rows: Bubble['rows'] = [];

  for (const t of res.toolsRun || []) {
    if (!t.ok || !t.data || typeof t.data !== 'object') continue;
    const data = t.data as Record<string, unknown>;
    const items = (Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.balances)
        ? data.balances
        : Array.isArray(data.events)
          ? data.events
          : []) as Array<Record<string, unknown>>;

    for (const it of items.slice(0, 8)) {
      const ref = String(it.publicRef || it.label || it.id || it.asset || '').slice(0, 48);
      const amount =
        it.amount != null
          ? `${it.amount}${it.asset ? ` ${it.asset}` : ''}`
          : it.available != null
            ? `${it.available}${it.asset ? ` ${it.asset}` : ''}`
            : '';
      const status = it.status != null ? String(it.status) : '';
      const title = [ref, amount].filter(Boolean).join(' · ') || t.name;
      const meta = [status, it.createdAt ? String(it.createdAt).slice(0, 10) : '']
        .filter(Boolean)
        .join(' · ');
      rows.push({ title, meta, tone: toneFromStatus(status) });
    }
  }

  // Clean prose: drop bullet dumps if we already have rows
  let body = (res.reply || '').trim();
  if (rows.length) {
    // Keep first 1–2 short paragraphs only
    const parts = body.split(/\n\n+/).filter((p) => !p.trim().startsWith('·') && !p.includes('shown up to'));
    body = parts.slice(0, 2).join('\n\n').trim() || 'Here’s what I found on your account.';
  }

  return { body, rows: rows.length ? rows : undefined };
}

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
        setBubbles([
          {
            id: 'welcome',
            role: 'assistant',
            body: s.llmEnabled
              ? 'How can we help? Pick a topic or describe what happened.'
              : 'How can we help? Pick a topic below.',
          },
        ]);
      } catch {
        setBubbles([
          {
            id: 'offline',
            role: 'system',
            body: 'Support is temporarily unavailable.',
          },
        ]);
        setStep('chat');
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, busy, step, pickerOpen]);

  useEffect(() => {
    if (pickerOpen && sessionId) void loadTx(pickerTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen, pickerTab, sessionId]);

  const applyTurn = (res: AgentTurnResult, replaceStream = false) => {
    const structured = structureReply(res);
    setBubbles((b) => {
      const base = replaceStream ? b.filter((x) => !x.id.startsWith('stream-')) : b;
      return [
        ...base,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          body: structured.body,
          rows: structured.rows,
        },
      ];
    });
    setSuggestAttach(!!res.suggestAttachTx);
    setSuggestEscalate(!!res.suggestEscalate);
    setSuggestReconcile(!!res.suggestReconcile);
    if (res.attachedTxLabel) setAttachedLabel(res.attachedTxLabel);

    const dep = res.toolsRun?.find((t) => t.name === 'get_deposit_requests' && t.ok);
    const items = (dep?.data as { items?: Array<{ id: string; status?: string }> } | undefined)?.items;
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
    } else setPendingConfirm(null);
  };

  /** userLabel = what we show; prompt = what API gets */
  const send = async (userLabel: string, prompt?: string, forceEscalate?: boolean) => {
    if (!sessionId || busy) return;
    const apiText = (prompt || userLabel).trim();
    if (!apiText) return;

    setInput('');
    setStep('chat');
    setBubbles((b) => [...b, { id: `u-${Date.now()}`, role: 'user', body: userLabel.trim() }]);
    setBusy(true);
    try {
      if (forceEscalate) {
        applyTurn(await aiSupport.sendAgentMessage(sessionId, apiText, true));
      } else {
        // Prefer solid POST over stream for cleaner final card UI
        applyTurn(await aiSupport.sendAgentMessage(sessionId, apiText));
      }
    } catch {
      setBubbles((b) => [
        ...b,
        { id: `e-${Date.now()}`, role: 'system', body: 'Could not reach support. Try again.' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const selectCategory = (c: Category) => {
    if (c.id === 'other' || !c.subs.length) {
      setCategory(c);
      setStep('chat');
      setTimeout(() => inputRef.current?.focus(), 60);
      return;
    }
    setCategory(c);
    setStep('subs');
  };

  const selectSub = (sub: SubProblem) => {
    if (sub.openPicker) setPickerTab(sub.openPicker);
    void send(sub.userLabel, sub.prompt).then(() => {
      if (sub.openPicker) setTimeout(() => setSuggestAttach(true), 300);
    });
  };

  const loadTx = async (tab: typeof pickerTab) => {
    if (!sessionId) return;
    setTxLoading(true);
    try {
      const res = await aiSupport.listAgentTransactions(sessionId, tab === 'all' ? undefined : tab);
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

  const attach = async (tx: { id: string; label: string; type: string }) => {
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
      setBubbles((b) => [...b, { id: `sys-${Date.now()}`, role: 'system', body: `Selected · ${label}` }]);
      await send('Check this transaction', `I attached ${label}. Inspect it and explain status in detail.`);
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Attach failed';
      setBubbles((b) => [...b, { id: `e-${Date.now()}`, role: 'system', body: msg }]);
    } finally {
      setBusy(false);
    }
  };

  const filteredTx = txOptions.filter(
    (tx) => pickerTab === 'all' || tx.type.toLowerCase().includes(pickerTab),
  );

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Compact header */}
      <div className="px-4 pt-1 pb-2 flex items-center gap-2.5">
        <BackButton
          onClick={() => {
            if (step === 'subs') setStep('home');
            else if (step === 'chat') {
              setStep('home');
              setCategory(null);
            } else onBack();
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 15 }}>Help</p>
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{
                background: 'color-mix(in srgb, var(--primary) 18%, transparent)',
                color: 'var(--primary)',
              }}
            >
              AI
            </span>
          </div>
          {attachedLabel ? (
            <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
              {attachedLabel}
            </p>
          ) : null}
        </div>
        <Sparkles size={16} style={{ color: 'var(--primary)', opacity: 0.85 }} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="space-y-2.5">
          {bubbles.map((m) => {
            const isUser = m.role === 'user';
            const isSystem = m.role === 'system';
            return (
              <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[92%] ${isUser ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'} overflow-hidden`}
                  style={{
                    background: isUser
                      ? 'var(--primary)'
                      : isSystem
                        ? 'transparent'
                        : 'var(--card)',
                    border: isUser || isSystem ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div
                    className="px-3 py-2"
                    style={{
                      color: isUser
                        ? 'var(--primary-foreground)'
                        : isSystem
                          ? 'var(--muted-foreground)'
                          : 'var(--foreground)',
                      fontSize: isSystem ? 12 : 13.5,
                      lineHeight: 1.45,
                      fontWeight: isUser ? 650 : 500,
                    }}
                  >
                    {m.body}
                  </div>
                  {m.rows && m.rows.length > 0 && (
                    <div
                      className="px-2 pb-2 space-y-1"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      {m.rows.map((row, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 px-2 py-1.5 rounded-xl mt-1"
                          style={{ background: 'var(--muted)' }}
                        >
                          <div className="mt-0.5">
                            <ToneIcon tone={row.tone || 'neutral'} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate"
                              style={{ color: 'var(--foreground)', fontSize: 12.5, fontWeight: 650 }}
                            >
                              {row.title}
                            </p>
                            {row.meta ? (
                              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                                {row.meta}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {busy && (
            <div className="flex items-center gap-2 pl-1">
              <Loader2 size={13} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11.5 }}>Looking up…</span>
            </div>
          )}
        </div>

        {/* Topic grid — compact */}
        <AnimatePresence mode="wait">
          {step === 'home' && sessionId && !busy && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 grid grid-cols-2 gap-2 pb-3"
            >
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCategory(c)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left ${
                      c.id === 'other' ? 'col-span-2' : ''
                    }`}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'color-mix(in srgb, var(--primary) 12%, var(--muted))',
                      }}
                    >
                      <Icon size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="min-w-0">
                      <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 13 }}>
                        {c.label}
                      </p>
                      <p className="truncate" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                        {c.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {step === 'subs' && category && !busy && (
            <motion.div
              key="subs"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 space-y-1.5 pb-3"
            >
              <button
                type="button"
                onClick={() => setStep('home')}
                className="flex items-center gap-1 mb-2 text-[12px] font-bold"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <ChevronLeft size={14} /> {category.label}
              </button>
              {category.subs.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => selectSub(sub)}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <span style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 13.5 }}>
                    {sub.label}
                  </span>
                  <ChevronRight size={15} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slim action row */}
      {step === 'chat' && !busy && (
        <div className="px-4 pb-1.5 flex gap-1.5 overflow-x-auto no-scrollbar">
          <Chip onClick={() => setStep('home')}>Topics</Chip>
          <Chip onClick={() => setPickerOpen(true)}>
            <Paperclip size={11} /> Select
          </Chip>
          {suggestEscalate && (
            <Chip onClick={() => void send('Talk to a human', 'Please escalate to a human agent', true)}>
              <UserRound size={11} /> Human
            </Chip>
          )}
          {suggestReconcile && pendingDepositId && (
            <Chip
              strong
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
                      body: r.summary || 'Deposit credited.',
                    },
                  ]);
                  setSuggestReconcile(false);
                } catch {
                  setBubbles((b) => [
                    ...b,
                    { id: `rec-e-${Date.now()}`, role: 'system', body: 'Credit blocked by checks.' },
                  ]);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Credit deposit
            </Chip>
          )}
        </div>
      )}

      {pendingConfirm && (
        <div
          className="mx-4 mb-2 rounded-2xl px-3 py-2.5 flex items-center gap-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="flex-1 text-[12px]" style={{ color: 'var(--foreground)' }}>
            {pendingConfirm.summary || 'Confirm action?'}
          </p>
          <button
            type="button"
            className="h-8 px-3 rounded-full text-[11px] font-bold"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
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
                    body: r.summary || (r.ok ? 'Confirmed.' : r.error || 'Done.'),
                  },
                ]);
                setPendingConfirm(null);
              } catch {
                setBubbles((b) => [
                  ...b,
                  { id: `c-e-${Date.now()}`, role: 'system', body: 'Confirm failed.' },
                ]);
              } finally {
                setBusy(false);
              }
            }}
          >
            Yes
          </button>
          <button
            type="button"
            className="h-8 px-2.5 rounded-full text-[11px] font-bold"
            style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            onClick={() => setPendingConfirm(null)}
          >
            No
          </button>
        </div>
      )}

      {/* Composer */}
      <div
        className="px-3 pt-1.5 pb-4 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)' }}
        >
          <Paperclip size={16} style={{ color: 'var(--foreground)' }} />
        </button>
        <div
          className="flex-1 h-10 rounded-full flex items-center px-3.5 gap-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                e.preventDefault();
                void send(input.trim());
              }
            }}
            placeholder={step === 'home' ? 'Or type here…' : 'Message…'}
            disabled={!sessionId || busy}
            className="flex-1 bg-transparent outline-none text-[13.5px]"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
        <button
          type="button"
          disabled={busy || !input.trim()}
          onClick={() => void send(input.trim())}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            opacity: busy || !input.trim() ? 0.45 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </div>

      {/* Transaction sheet */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setPickerOpen(false)}
        >
          <motion.div
            initial={{ y: 48 }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-t-[24px] max-h-[72vh] flex flex-col"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>
                  Select transaction
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Tap one to investigate</p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-4 flex gap-1.5 mb-2">
              {(['all', 'deposit', 'withdrawal', 'swap'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPickerTab(tab)}
                  className="h-7 px-2.5 rounded-full text-[11px] font-bold capitalize"
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
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {txLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              ) : filteredTx.length === 0 ? (
                <p className="text-center py-10 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
                  No items in this tab
                </p>
              ) : (
                filteredTx.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => void attach(tx)}
                    className="w-full text-left px-3 py-3 rounded-xl mb-1.5"
                    style={{ background: 'var(--muted)' }}
                  >
                    <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 13 }}>
                      {tx.label}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tx.type}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  onClick,
  strong,
}: {
  children: React.ReactNode;
  onClick: () => void;
  strong?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 px-2.5 rounded-full text-[11px] font-bold flex items-center gap-1 flex-shrink-0"
      style={{
        background: strong ? 'var(--positive)' : 'var(--muted)',
        color: strong ? '#fff' : 'var(--foreground)',
      }}
    >
      {children}
    </button>
  );
}
