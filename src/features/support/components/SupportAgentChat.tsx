import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Loader,
  Paperclip,
  Send,
  Sparkles,
  UserRound,
  Landmark,
  ArrowUpFromLine,
  Zap,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react';
import * as aiSupport from '../../../shared/api/aiSupport';
import type { AgentTurnResult } from '../../../shared/api/aiSupport';

import { BackButton } from '../../../shared/components/BackButton';
import { PageTop } from '../../../shared/components/PageTop';

type Bubble = { id: string; role: 'user' | 'assistant' | 'system'; body: string };

type ProblemId = 'deposit' | 'withdrawal' | 'bill' | 'kyc' | 'other';

const PROBLEMS: Array<{
  id: ProblemId;
  label: string;
  hint: string;
  /** Message sent to the agent so intent router + LLM hit the right tools */
  message: string;
  pickerTab?: 'deposit' | 'withdrawal' | 'all';
  icon: typeof Landmark;
}> = [
  {
    id: 'deposit',
    label: 'Deposit not credited',
    hint: 'Bank, card, or on-chain',
    message:
      'My deposit is not showing in my balance. Please list my on-ramp deposit requests and ledger deposits so I can pick the right one.',
    pickerTab: 'deposit',
    icon: Landmark,
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal / bank stuck',
    hint: 'Cash-out or on-chain send',
    message:
      'My withdrawal or bank payout is stuck or delayed. Please list my recent withdrawals with status so I can attach the right one.',
    pickerTab: 'withdrawal',
    icon: ArrowUpFromLine,
  },
  {
    id: 'bill',
    label: 'Bill / airtime / data',
    hint: 'Utility or top-up failed',
    message:
      'My bill payment, airtime, or data top-up did not complete. Please check my recent bill-related activity and status.',
    pickerTab: 'all',
    icon: Zap,
  },
  {
    id: 'kyc',
    label: 'KYC / account access',
    hint: 'Verification or freeze',
    message: 'Please check my KYC verification status and explain what is blocking full access.',
    icon: BadgeCheck,
  },
  {
    id: 'other',
    label: 'Something else',
    hint: 'Type your own issue',
    message: '',
    icon: MessageCircle,
  },
];

/**
 * Support Agent — guided problem chips + free text + attach transaction.
 */
export function SupportAgentChat({ onBack }: { onBack: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showProblems, setShowProblems] = useState(true);
  const [activeProblem, setActiveProblem] = useState<ProblemId | null>(null);
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
              "Hi — I'm the Convia Support Agent." +
              live +
              ' Pick a problem below or type your own. For deposits and withdrawals, attach the exact item so I do not guess.',
          },
        ]);
      } catch {
        setBubbles([
          {
            id: 'offline',
            role: 'system',
            body: 'Support Agent is unavailable right now. Try again shortly or open a manual case from Support Centre.',
          },
        ]);
        setShowProblems(false);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, busy, showProblems]);

  useEffect(() => {
    if (!pickerOpen || !sessionId) return;
    void loadTxOptions(pickerTab);
  }, [pickerTab, pickerOpen, sessionId]);

  const applyTurn = (res: AgentTurnResult, replaceStream = false) => {
    setBubbles((b) => {
      const withoutStream = replaceStream ? b.filter((x) => !x.id.startsWith('stream-')) : b;
      return [
        ...withoutStream,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          body: res.reply || 'Done.',
        },
      ];
    });
    setSuggestAttach(!!res.suggestAttachTx);
    setSuggestEscalate(!!res.suggestEscalate);
    setSuggestReconcile(!!res.suggestReconcile);

    if (res.attachedTxLabel) setAttachedLabel(res.attachedTxLabel);

    const depTool = res.toolsRun?.find((t) => t.name === 'get_deposit_requests' && t.ok);
    const items = (depTool?.data as { items?: Array<{ id: string; status?: string }> } | undefined)?.items;
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
    setShowProblems(false);
    setBubbles((b) => [...b, { id: `u-${Date.now()}`, role: 'user', body: msg }]);
    setBusy(true);
    try {
      if (forceEscalate) {
        const res = await aiSupport.sendAgentMessage(sessionId, msg, true);
        applyTurn(res);
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
          body: 'Could not reach the agent. Try again or open a manual case.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const pickProblem = (p: (typeof PROBLEMS)[number]) => {
    setActiveProblem(p.id);
    if (p.id === 'other') {
      setShowProblems(false);
      setBubbles((b) => [
        ...b,
        {
          id: `sys-${Date.now()}`,
          role: 'system',
          body: 'Describe your issue in your own words below.',
        },
      ]);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    if (p.pickerTab) setPickerTab(p.pickerTab);
    void send(p.message);
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

  const openPicker = async () => {
    setPickerOpen(true);
    if (sessionId) await loadTxOptions(pickerTab);
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
      setBubbles((b) => [
        ...b,
        {
          id: `sys-${Date.now()}`,
          role: 'system',
          body: `Attached: ${label}`,
        },
      ]);
      setSuggestAttach(false);
      // Follow-up investigation on the attached item
      void send(
        `I attached ${label}. Please inspect this item and explain the current status in detail.`,
      );
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message: string }).message)
          : 'Could not attach that transaction.';
      setBubbles((b) => [
        ...b,
        {
          id: `sys-e-${Date.now()}`,
          role: 'system',
          body: `Could not attach: ${msg}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="px-5 mb-2 flex items-center gap-3">
        <BackButton onClick={onBack} />
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>Support Agent</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {attachedLabel ? `Attached · ${attachedLabel}` : 'Investigates your account safely'}
          </p>
        </div>
        <Sparkles size={18} style={{ color: 'var(--primary)' }} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
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
          <div className="flex items-center gap-2 px-1">
            <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Checking…</span>
          </div>
        )}

        {/* Guided problem picker */}
        {showProblems && sessionId && !busy && (
          <div className="pt-1">
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 12,
                fontWeight: 650,
                marginBottom: 10,
              }}
            >
              What do you need help with?
            </p>
            <div className="flex flex-col gap-2">
              {PROBLEMS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={busy}
                    onClick={() => pickProblem(p)}
                    className="w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--muted)' }}
                    >
                      <Icon size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="min-w-0">
                      <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                        {p.label}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{p.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!showProblems && sessionId && !busy && (
          <button
            type="button"
            onClick={() => setShowProblems(true)}
            className="text-[12px] font-bold px-2 py-1"
            style={{ color: 'var(--primary)' }}
          >
            ← Choose another problem
          </button>
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
              disabled={busy}
              onClick={() => setPendingConfirm(null)}
              className="h-9 px-4 rounded-full text-[12px] font-bold"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {(suggestAttach || suggestEscalate || suggestReconcile) && (
        <div className="px-5 pb-2 flex flex-wrap gap-2">
          {suggestAttach && (
            <button
              type="button"
              onClick={() => void openPicker()}
              className="h-9 px-3 rounded-full text-[12px] font-bold flex items-center gap-1.5"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              <Paperclip size={14} /> Attach transaction
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
              className="h-9 px-3 rounded-full text-[12px] font-bold"
              style={{ background: 'var(--positive)', color: '#fff' }}
            >
              Credit verified deposit
            </button>
          )}
          {suggestEscalate && (
            <button
              type="button"
              onClick={() => void send('Please escalate this to a human agent', true)}
              className="h-9 px-3 rounded-full text-[12px] font-bold flex items-center gap-1.5"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              <UserRound size={14} /> Talk to human
            </button>
          )}
        </div>
      )}

      <div className="px-5 pb-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void openPicker()}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          aria-label="Attach transaction"
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
          placeholder={
            activeProblem === 'other' || !showProblems
              ? 'Describe the issue…'
              : 'Or type your issue…'
          }
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
            opacity: busy || !input.trim() ? 0.6 : 1,
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setPickerOpen(false)}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-t-[24px] p-5 max-h-[70vh] overflow-y-auto"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>
              Attach transaction
            </p>
            <p
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 13,
                marginTop: 6,
                marginBottom: 12,
              }}
            >
              Pick the exact movement so the agent investigates the right one.
            </p>
            <div className="flex gap-2 mb-3 flex-wrap">
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
              <div className="flex justify-center py-8">
                <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            ) : txOptions.filter(
                (tx) => pickerTab === 'all' || tx.type.toLowerCase().includes(pickerTab),
              ).length === 0 ? (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                No recent transactions loaded.
              </p>
            ) : (
              txOptions
                .filter((tx) => pickerTab === 'all' || tx.type.toLowerCase().includes(pickerTab))
                .map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => void attach(tx)}
                    className="w-full text-left px-3 py-3 rounded-xl mb-2"
                    style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                  >
                    <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 13 }}>
                      {tx.label}
                    </p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                      {tx.type} · {tx.id.slice(0, 12)}…
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
