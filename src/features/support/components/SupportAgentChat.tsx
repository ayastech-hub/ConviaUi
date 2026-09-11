import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Loader, Paperclip, Send, Sparkles, UserRound } from 'lucide-react';
import * as aiSupport from '../../../shared/api/aiSupport';
import type { AgentTurnResult } from '../../../shared/api/aiSupport';

import { useAuth } from '../../../shared/context/AuthContext';
import { BackButton } from '../../../shared/components/BackButton';
import { PageTop } from '../../../shared/components/PageTop';

type Bubble = { id: string; role: 'user' | 'assistant' | 'system'; body: string };

/**
 * Phase-1 Support Agent UI — investigate with tools, attach exact tx, escalate to human case.
 */
export function SupportAgentChat({ onBack }: { onBack: () => void }) {
  const { user } = useAuth() as { user?: { id?: string } };
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestAttach, setSuggestAttach] = useState(false);
  const [suggestEscalate, setSuggestEscalate] = useState(false);
  const [suggestReconcile, setSuggestReconcile] = useState(false);
  const [pendingDepositId, setPendingDepositId] = useState<string | null>(null);
  const [pickerTab, setPickerTab] = useState<'all' | 'deposit' | 'withdrawal' | 'swap'>('all');
  const [attachedLabel, setAttachedLabel] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [txOptions, setTxOptions] = useState<Array<{ id: string; label: string; type: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const s = await aiSupport.createAgentSession();
        setSessionId(s.id);
        setBubbles([
          {
            id: 'welcome',
            role: 'assistant',
            body: "Hi — I'm the Convia Support Agent. I can check your balances, deposits, and history. Attach a transaction when you mean a specific one so I don't guess.",
          },
        ]);
      } catch {
        setBubbles([
          {
            id: 'offline',
            role: 'system',
            body: 'Support Agent is unavailable offline. You can still open a classic support case.',
          },
        ]);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, busy]);

  const applyTurn = (res: AgentTurnResult, replaceStream = false) => {
    setBubbles((b) => {
      const withoutStream = replaceStream ? b.filter((x) => !x.id.startsWith('stream-')) : b;
      return [...withoutStream, { id: `a-${Date.now()}`, role: 'assistant' as const, body: res.reply }];
    });
    setSuggestAttach(!!res.suggestAttachTx);
    setSuggestEscalate(!!res.suggestEscalate);
    setSuggestReconcile(!!res.suggestReconcile);
    if (res.attachedTxLabel) setAttachedLabel(res.attachedTxLabel);
    const dep = res.toolsRun?.find((t) => t.name === 'verify_deposit' || t.name === 'get_deposit_requests');
    // best-effort: user can still attach; deposit id may be in tools summary
  };

  const send = async (text: string, forceEscalate?: boolean) => {

    if (!sessionId || !text.trim() || busy) return;
    const msg = text.trim();
    setInput('');
    setBubbles((b) => [...b, { id: `u-${Date.now()}`, role: 'user', body: msg }]);
    setBusy(true);
    try {
      if (forceEscalate) {
        const res = await aiSupport.sendAgentMessage(sessionId, msg, true);
        applyTurn(res);
      } else {
        await aiSupport.streamAgentMessage(sessionId, msg, {
          onPartial: (text) => {
            setBubbles((b) => {
              const last = b[b.length - 1];
              if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
                return [...b.slice(0, -1), { ...last, body: text }];
              }
              return [...b, { id: `stream-${Date.now()}`, role: 'assistant', body: text }];
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

  const openPicker = async () => {
    setPickerOpen(true);
    if (!sessionId) return;
    try {
      const res = await aiSupport.listAgentTransactions(sessionId, pickerTab === 'all' ? undefined : pickerTab);
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
    }
  };

  const attach = async (tx: { id: string; type: string; label: string }) => {
    if (!sessionId) return;
    setPickerOpen(false);
    try {
      const r = await aiSupport.attachAgentTransaction(sessionId, {
        transactionId: tx.id,
      });
      setAttachedLabel(r.attachedTxLabel || tx.label);
      setBubbles((b) => [
        ...b,
        {
          id: `sys-${Date.now()}`,
          role: 'system',
          body: `Attached: ${r.attachedTxLabel || tx.label}`,
        },
      ]);
      setSuggestAttach(false);
    } catch {
      setBubbles((b) => [
        ...b,
        { id: `sys-e-${Date.now()}`, role: 'system', body: 'Could not attach that transaction.' },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-3">
        <BackButton onClick={onBack} />
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>Support Agent</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {attachedLabel ? `Linked · ${attachedLabel}` : 'Investigates your account safely'}
          </p>
          {attachedLabel && sessionId && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await aiSupport.detachAgentTransaction(sessionId);
                  setAttachedLabel(null);
                } catch { /* ignore */ }
              }}
              style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 650 }}
            >
              Remove
            </button>
          )}
        </div>
        <Sparkles size={18} style={{ color: 'var(--primary)' }} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-3 space-y-3">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className={`flex ${b.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap"
              style={{
                background:
                  b.role === 'user'
                    ? 'var(--primary)'
                    : b.role === 'system'
                      ? 'var(--muted)'
                      : 'var(--card)',
                color: b.role === 'user' ? 'var(--primary-foreground)' : 'var(--foreground)',
                border: b.role === 'user' ? 'none' : '1px solid var(--border)',
              }}
            >
              {b.body}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
            <Loader size={14} className="animate-spin" /> Investigating…
          </div>
        )}
      </div>

      {(suggestAttach || suggestEscalate) && (
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
                    { id: `rec-e-${Date.now()}`, role: 'system', body: 'Reconciliation blocked by safety checks.' },
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
              onClick={() => void send('Please escalate to a human agent.', true)}
              className="h-9 px-3 rounded-full text-[12px] font-bold flex items-center gap-1.5"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <UserRound size={14} /> Open human case
            </button>
          )}
        </div>
      )}

      <div className="px-4 pb-6 pt-2 flex gap-2 items-end">
        <button
          type="button"
          onClick={() => void openPicker()}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
          aria-label="Attach transaction"
        >
          <Paperclip size={18} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void send(input);
          }}
          placeholder="Describe the issue…"
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
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', opacity: busy ? 0.6 : 1 }}
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
            <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}>Attach transaction</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6, marginBottom: 12 }}>
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
                    color: pickerTab === tab ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            {txOptions.filter((tx) => pickerTab === 'all' || tx.type.toLowerCase().includes(pickerTab)).length === 0 ? (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No recent transactions loaded.</p>
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
                  <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 13 }}>{tx.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{tx.id.slice(0, 12)}…</p>
                </button>
              ))
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
