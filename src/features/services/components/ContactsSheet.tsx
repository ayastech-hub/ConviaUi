import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User } from 'lucide-react';
import { loadDeviceContacts, isNativeShell } from '../../../shared/native/nativeShell';
import { normalizeNgMobile } from '../../../shared/utils/ngPhone';

type Contact = { name: string; phone: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (phone: string) => void;
};

/**
 * Contact picker — uses Contacts Picker API when available,
 * otherwise shows permission guidance + manual recent list.
 */
export function ContactsSheet({ open, onClose, onPick }: Props) {
  const [status, setStatus] = useState<'idle' | 'denied' | 'unsupported' | 'ready'>('idle');
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // Native ConviaMobile shell — full contact list
      if (await isNativeShell()) {
        try {
          const rows = await loadDeviceContacts(150);
          if (cancelled) return;
          if (rows.length) {
            setContacts(rows.map((r) => ({
              name: r.name,
              phone: normalizeNgMobile(r.phone),
            })));
            setStatus('ready');
            return;
          }
        } catch {
          /* fall through */
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if (!nav.contacts?.select) {
        if (!cancelled) setStatus('unsupported');
        return;
      }
      try {
        const selected = await nav.contacts.select(['name', 'tel'], { multiple: false });
        if (cancelled) return;
        const rows: Contact[] = [];
        for (const c of selected || []) {
          const tel = Array.isArray(c.tel) ? c.tel[0] : c.tel;
          const name = Array.isArray(c.name) ? c.name[0] : c.name;
          if (tel) rows.push({ name: String(name || 'Contact'), phone: normalizeNgMobile(String(tel)) });
        }
        if (rows.length) {
          onPick(normalizeNgMobile(rows[0].phone));
          onClose();
          return;
        }
        setContacts(rows);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, onClose, onPick]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] px-5 pt-3 pb-8"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border)' }} />
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Contacts</h2>
              <button type="button" onClick={onClose} className="p-2" aria-label="Close">
                <X size={18} style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>
            {status === 'unsupported' && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.5 }}>
                Contact access isn&apos;t available in this browser. Enter the number manually, or open Convia in a
                supported mobile browser / app.
              </p>
            )}
            {status === 'denied' && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.5 }}>
                Permission was denied. Enable contacts for this site in your browser settings, or type the number.
              </p>
            )}
            {status === 'ready' && contacts.length === 0 && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>No contacts selected.</p>
            )}
            {contacts.map((c) => (
              <button
                key={c.phone}
                type="button"
                onClick={() => {
                  onPick(normalizeNgMobile(c.phone));
                  onClose();
                }}
                className="w-full flex items-center gap-3 py-3.5 text-left"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <User size={18} style={{ color: 'var(--foreground)' }} />
                </span>
                <span>
                  <span style={{ display: 'block', fontWeight: 600, color: 'var(--foreground)' }}>{c.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{c.phone}</span>
                </span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
