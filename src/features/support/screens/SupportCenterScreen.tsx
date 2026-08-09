import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Plus, MessageSquare, Paperclip, Send, Loader, Image as ImageIcon, X, Circle,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as supportApi from '../../../shared/api/support';
import type { SupportCase, SupportMessage, SupportAttachment } from '../../../shared/api/support';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert } from '../../../shared/components/FeatureAlert';

interface SupportCenterScreenProps {
  goBack: () => void;
}

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'account', label: 'Account' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'payments', label: 'Payments' },
  { id: 'kyc', label: 'KYC' },
  { id: 'technical', label: 'Technical' },
];

function statusColor(s: string) {
  if (s === 'open') return 'var(--positive)';
  if (s === 'pending') return 'var(--primary)';
  return 'var(--muted-foreground)';
}

/** User enterprise support centre — cases, thread chat, image/file upload. */
export function SupportCenterScreen({ goBack }: SupportCenterScreenProps) {
  const { status: authStatus } = useAuth();
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'thread' | 'new'>('list');
  const [active, setActive] = useState<SupportCase | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [body, setBody] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadCases = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setCases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await supportApi.listMyCases();
      setCases(res.cases || []);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load cases');
    } finally {
      setLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const openCase = async (c: SupportCase) => {
    setActive(c);
    setView('thread');
    try {
      const full = await supportApi.getCase(c.id);
      setActive(full);
      setMessages(full.messages || []);
    } catch {
      setMessages(c.messages || []);
    }
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const next: SupportAttachment[] = [];
      for (const f of Array.from(files).slice(0, 3 - attachments.length)) {
        next.push(await supportApi.fileToAttachment(f));
      }
      setAttachments((prev) => [...prev, ...next].slice(0, 3));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Attachment failed');
    }
  };

  const sendReply = async () => {
    if (!active || (!input.trim() && !attachments.length)) return;
    setSending(true);
    try {
      const msg = await supportApi.postMessage(active.id, input.trim() || '(attachment)', attachments);
      setMessages((prev) => [...prev, msg]);
      setInput('');
      setAttachments([]);
      void loadCases();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const createNew = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      const created = await supportApi.createCase({
        subject: subject.trim(),
        category,
        body: body.trim(),
        attachments,
      });
      setSubject('');
      setBody('');
      setAttachments([]);
      setView('list');
      await loadCases();
      await openCase(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not open case');
    } finally {
      setSending(false);
    }
  };

  if (authStatus !== 'authenticated') {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <Header title="Support Centre" onBack={goBack} />
        <div className="px-5">
          <FeatureAlert reason="generic" message="Sign in to open support cases with our team." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      {view === 'list' && (
        <>
          <Header
            title="Support Centre"
            onBack={goBack}
            right={
              <button
                type="button"
                onClick={() => setView('new')}
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--primary)' }}
              >
                <Plus size={18} color="#fff" />
              </button>
            }
          />
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            {error && <FeatureAlert reason="generic" message={error} />}
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16, lineHeight: 1.45 }}>
              Message Convia support. Attach images or small files (max 400KB each). Agents can reply and close cases from the admin desk.
            </p>
            {loading && (
              <div className="flex justify-center py-10">
                <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            )}
            {!loading && cases.length === 0 && (
              <div
                className="rounded-[20px] p-8 text-center"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <MessageSquare size={28} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
                <p style={{ color: 'var(--foreground)', fontWeight: 700 }}>No cases yet</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>
                  Tap + to open a new support case.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {cases.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => void openCase(c)}
                  className="text-left p-4 rounded-[16px]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Circle size={8} fill={statusColor(c.status)} color={statusColor(c.status)} />
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                      {c.status} · {c.category}
                    </span>
                  </div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{c.subject}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }} className="truncate">
                    {c.messages?.[0]?.body || 'No messages'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {view === 'new' && (
        <>
          <Header title="New case" onBack={() => setView('list')} />
          <div className="flex-1 overflow-y-auto px-5 pb-8">
            <label style={labelStyle}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary"
              className="w-full px-4 py-3 rounded-[14px] mb-4 outline-none"
              style={inputStyle}
            />
            <label style={labelStyle}>Category</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    background: category === c.id ? 'var(--primary)' : 'var(--muted)',
                    color: category === c.id ? '#fff' : 'var(--foreground)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label style={labelStyle}>Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Describe the issue…"
              className="w-full px-4 py-3 rounded-[14px] mb-4 outline-none resize-none"
              style={inputStyle}
            />
            <AttachmentBar
              attachments={attachments}
              onRemove={(i) => setAttachments((p) => p.filter((_, idx) => idx !== i))}
              onAdd={() => fileRef.current?.click()}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.txt"
              multiple
              className="hidden"
              onChange={(e) => void onPickFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={sending || !subject.trim() || !body.trim()}
              onClick={() => void createNew()}
              className="w-full py-3.5 rounded-[16px] text-white mt-4"
              style={{ background: 'var(--primary)', fontWeight: 700, opacity: sending ? 0.6 : 1 }}
            >
              {sending ? 'Opening…' : 'Open case'}
            </button>
          </div>
        </>
      )}

      {view === 'thread' && active && (
        <>
          <Header
            title={active.subject}
            onBack={() => {
              setView('list');
              setActive(null);
            }}
            subtitle={`${active.status} · ${active.category}`}
          />
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} mine={m.senderRole === 'user'} />
            ))}
          </div>
          {active.status !== 'closed' ? (
            <div className="px-4 pb-5 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <AttachmentBar
                attachments={attachments}
                onRemove={(i) => setAttachments((p) => p.filter((_, idx) => idx !== i))}
                onAdd={() => fileRef.current?.click()}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.txt"
                multiple
                className="hidden"
                onChange={(e) => void onPickFiles(e.target.files)}
              />
              <div className="flex items-end gap-2 mt-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && void sendReply()}
                  placeholder="Write a reply…"
                  className="flex-1 px-4 py-3 rounded-[14px] outline-none"
                  style={inputStyle}
                />
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => void sendReply()}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}
                >
                  {sending ? <Loader size={18} className="animate-spin" color="#fff" /> : <Send size={18} color="#fff" />}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center py-4" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              This case is closed. Open a new case if you still need help.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Header({
  title,
  onBack,
  right,
  subtitle,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 mb-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
      </motion.button>
      <div className="flex-1 min-w-0">
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }} className="truncate">
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textTransform: 'capitalize' }}>{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

function MessageBubble({ message, mine }: { message: SupportMessage; mine: boolean }) {
  const isSystem = message.senderRole === 'system';
  if (isSystem) {
    return (
      <p className="text-center my-3" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
        {message.body}
      </p>
    );
  }
  const atts = Array.isArray(message.attachments) ? message.attachments : [];
  return (
    <div className={`flex flex-col mb-3 ${mine ? 'items-end' : 'items-start'}`}>
      <div
        className="px-3.5 py-2.5 rounded-[16px] max-w-[85%]"
        style={{
          background: mine ? 'var(--primary)' : 'var(--card)',
          color: mine ? '#fff' : 'var(--foreground)',
          border: mine ? 'none' : '1px solid var(--border)',
          fontSize: 14,
          lineHeight: 1.45,
        }}
      >
        {message.body}
        {atts.map((a, i) => (
          <div key={i} className="mt-2">
            {a.mimeType?.startsWith('image/') && a.dataUrl ? (
              <img src={a.dataUrl} alt={a.name} className="rounded-lg max-h-40 max-w-full" />
            ) : (
              <span style={{ fontSize: 12, opacity: 0.9 }}>
                <Paperclip size={12} className="inline" /> {a.name}
              </span>
            )}
          </div>
        ))}
      </div>
      <span style={{ color: 'var(--muted-foreground)', fontSize: 10, marginTop: 4 }}>
        {mine ? 'You' : message.senderRole === 'agent' ? 'Support' : message.senderRole} ·{' '}
        {new Date(message.createdAt).toLocaleString()}
      </span>
    </div>
  );
}

function AttachmentBar({
  attachments,
  onRemove,
  onAdd,
}: {
  attachments: SupportAttachment[];
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full"
        style={{ background: 'var(--muted)', fontSize: 12, color: 'var(--foreground)' }}
      >
        <ImageIcon size={14} /> Attach
      </button>
      {attachments.map((a, i) => (
        <span
          key={i}
          className="flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ background: 'var(--muted)', fontSize: 11, color: 'var(--foreground)' }}
        >
          {a.name.slice(0, 16)}
          <button type="button" onClick={() => onRemove(i)} aria-label="Remove">
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  color: 'var(--muted-foreground)',
  fontSize: 12,
  fontWeight: 600,
  display: 'block',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  background: 'var(--muted)',
  color: 'var(--foreground)',
  border: '1px solid var(--border)',
  fontSize: 14,
};
