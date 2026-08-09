import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft, Loader, Send, Copy, Check, XCircle, RotateCcw, Paperclip, Image as ImageIcon,
} from 'lucide-react';
import * as supportApi from '../../../shared/api/support';
import type { SupportCase, SupportMessage, SupportAttachment } from '../../../shared/api/support';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert } from '../../../shared/components/FeatureAlert';

interface SupportDeskScreenProps {
  goBack: () => void;
}

/**
 * Agent / admin support desk — list cases, reply, close/reopen, copy user id.
 * Requires admin or moderator role on the backend.
 */
export function SupportDeskScreen({ goBack }: SupportDeskScreenProps) {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<SupportCase | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supportApi.adminListCases(filter || undefined);
      setCases(res.cases || []);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
        setError('Agent access required (admin or moderator role).');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to load desk');
      }
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const openCase = async (c: SupportCase) => {
    setActive(c);
    try {
      const full = await supportApi.adminGetCase(c.id);
      setActive(full);
      setMessages(full.messages || []);
    } catch {
      setMessages(c.messages || []);
    }
  };

  const copyUserId = async () => {
    if (!active?.userId) return;
    try {
      await navigator.clipboard.writeText(active.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const reply = async () => {
    if (!active || (!input.trim() && !attachments.length)) return;
    setSending(true);
    try {
      const msg = await supportApi.adminReply(active.id, input.trim() || '(attachment)', attachments);
      setMessages((prev) => [...prev, msg]);
      setInput('');
      setAttachments([]);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reply failed');
    } finally {
      setSending(false);
    }
  };

  const closeCase = async () => {
    if (!active) return;
    setSending(true);
    try {
      await supportApi.adminCloseCase(active.id);
      const full = await supportApi.adminGetCase(active.id);
      setActive(full);
      setMessages(full.messages || []);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Close failed');
    } finally {
      setSending(false);
    }
  };

  const reopen = async () => {
    if (!active) return;
    try {
      await supportApi.adminReopenCase(active.id);
      const full = await supportApi.adminGetCase(active.id);
      setActive(full);
      setMessages(full.messages || []);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reopen failed');
    }
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const next: SupportAttachment[] = [];
      for (const f of Array.from(files).slice(0, 3)) {
        next.push(await supportApi.fileToAttachment(f));
      }
      setAttachments((p) => [...p, ...next].slice(0, 3));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Attach failed');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      {!active ? (
        <>
          <div className="flex items-center gap-3 px-5 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
            </motion.button>
            <div className="flex-1">
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Support Desk</h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Agent console</p>
            </div>
          </div>
          <div className="flex gap-2 px-5 mb-4 overflow-x-auto">
            {['', 'open', 'pending', 'closed'].map((s) => (
              <button
                key={s || 'all'}
                type="button"
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-full flex-shrink-0"
                style={{
                  background: filter === s ? 'var(--primary)' : 'var(--muted)',
                  color: filter === s ? '#fff' : 'var(--foreground)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {s || 'all'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            {error && <FeatureAlert reason="generic" message={error} />}
            {loading && (
              <div className="flex justify-center py-12">
                <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            )}
            {cases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => void openCase(c)}
                className="w-full text-left p-4 rounded-[16px] mb-2"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between gap-2">
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{c.subject}</p>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{c.status}</span>
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 4 }}>
                  User · {c.userId.slice(0, 8)}… · {c.category}
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="px-5 mb-2">
            <div className="flex items-center gap-3 mb-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setActive(null)}
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
              </motion.button>
              <div className="flex-1 min-w-0">
                <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }} className="truncate">
                  {active.subject}
                </h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                  {active.status} · {active.category}
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-2 p-3 rounded-[14px] mb-2"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600 }}>USER ID</p>
                <p style={{ color: 'var(--foreground)', fontSize: 12, fontFamily: 'monospace' }} className="truncate">
                  {active.userId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyUserId()}
                className="flex items-center gap-1 px-3 py-2 rounded-xl"
                style={{ background: 'var(--card)', color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              {active.status !== 'closed' ? (
                <button
                  type="button"
                  onClick={() => void closeCase()}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-[12px]"
                  style={{ background: 'var(--destructive)', color: '#fff', fontWeight: 600, fontSize: 13 }}
                >
                  <XCircle size={16} /> Close case
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void reopen()}
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-[12px]"
                  style={{ background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: 13 }}
                >
                  <RotateCcw size={16} /> Reopen
                </button>
              )}
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2">
            {messages.map((m) => {
              const mine = m.senderRole === 'agent';
              const system = m.senderRole === 'system';
              if (system) {
                return (
                  <p key={m.id} className="text-center my-2" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                    {m.body}
                  </p>
                );
              }
              const atts = Array.isArray(m.attachments) ? m.attachments : [];
              return (
                <div key={m.id} className={`flex flex-col mb-3 ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className="px-3 py-2 rounded-[14px] max-w-[85%]"
                    style={{
                      background: mine ? 'var(--primary)' : 'var(--card)',
                      color: mine ? '#fff' : 'var(--foreground)',
                      border: mine ? 'none' : '1px solid var(--border)',
                      fontSize: 14,
                    }}
                  >
                    {m.body}
                    {atts.map((a, i) =>
                      a.mimeType?.startsWith('image/') && a.dataUrl ? (
                        <img key={i} src={a.dataUrl} alt={a.name} className="mt-2 rounded-lg max-h-36" />
                      ) : (
                        <span key={i} className="block mt-1 text-xs opacity-90">
                          <Paperclip size={11} className="inline" /> {a.name}
                        </span>
                      ),
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>
                    {mine ? 'You (agent)' : 'User'} · {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          {active.status !== 'closed' && (
            <div className="px-4 pb-5 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--muted)', fontSize: 12 }}
                >
                  <ImageIcon size={14} /> Attach
                </button>
                {attachments.map((a, i) => (
                  <span key={i} style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                    {a.name}
                  </span>
                ))}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                multiple
                onChange={(e) => void onPickFiles(e.target.files)}
              />
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Reply as agent…"
                  className="flex-1 px-4 py-3 rounded-[14px] outline-none"
                  style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                />
                <button
                  type="button"
                  onClick={() => void reply()}
                  disabled={sending}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}
                >
                  <Send size={18} color="#fff" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
