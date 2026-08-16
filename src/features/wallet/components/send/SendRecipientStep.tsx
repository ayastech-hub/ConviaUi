import type { RefObject } from 'react';
import { motion } from 'motion/react';
import { Search, X, ClipboardPaste, ScanLine, ChevronDown, ArrowUpRight, Users, Loader } from 'lucide-react';
import type { Asset, ChatContact } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

interface SendRecipientStepProps {
  search: string;
  setSearch: (v: string) => void;
  filteredContacts: ChatContact[];
  onSelectContact: (c: ChatContact) => void;
  recipient: string;
  setRecipient: (v: string) => void;
  setSelectedContact: (c: ChatContact | null) => void;
  addressInputRef: RefObject<HTMLInputElement | null>;
  onPaste: () => void;
  onScan: () => void;
  selectedAsset: Asset;
  onOpenAssetPicker: () => void;
  onContinue: () => void;
  onFindFriends?: () => void;
  findFriendsLoading?: boolean;
  findFriendsNote?: string | null;
}

/**
 * Recipient step: @username search + optional device-contact match.
 * Phone is only for discovery — payment is always by Convia username.
 */
export function SendRecipientStep({
  search,
  setSearch,
  filteredContacts,
  onSelectContact,
  recipient,
  setRecipient,
  setSelectedContact,
  addressInputRef,
  onPaste,
  onScan,
  selectedAsset,
  onOpenAssetPicker,
  onContinue,
  onFindFriends,
  findFriendsLoading,
  findFriendsNote,
}: SendRecipientStepProps) {
  return (
    <motion.div
      key="recipient"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <p className="mb-3" style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.4 }}>
        Send to a <strong style={{ color: 'var(--foreground)' }}>Convia username</strong>. Phone contacts are
        only used to find friends already on Convia — not as a payment address.
      </p>

      <div
        className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
        <input
          placeholder="Search @username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14 }}
          autoFocus
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="flex items-center justify-center w-5 h-5">
            <X size={14} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        )}
      </div>

      {onFindFriends && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={findFriendsLoading}
          onClick={onFindFriends}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] mb-3"
          style={{
            background: 'var(--muted)',
            color: 'var(--foreground)',
            fontWeight: 600,
            fontSize: 13,
            opacity: findFriendsLoading ? 0.7 : 1,
          }}
        >
          {findFriendsLoading ? <Loader size={16} className="animate-spin" /> : <Users size={16} />}
          {findFriendsLoading ? 'Matching contacts…' : 'Find friends on Convia'}
        </motion.button>
      )}

      {findFriendsNote && (
        <p className="mb-3 px-1" style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.4 }}>
          {findFriendsNote}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
          {filteredContacts.length ? 'On Convia' : 'Recipients'}
        </p>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{filteredContacts.length}</span>
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {filteredContacts.map((contact, i) => (
          <motion.button
            key={contact.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.2) }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectContact(contact)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}
            >
              {contact.initials || contact.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }} className="truncate">
                {contact.name}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@{contact.username}</p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              On Convia
            </span>
          </motion.button>
        ))}
        {!filteredContacts.length && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="px-1">
            Type a username (min 3 characters) or find friends from your contacts.
          </p>
        )}
      </div>

      <p className="mb-2" style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
        Or enter @username
      </p>
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <input
          ref={addressInputRef as RefObject<HTMLInputElement>}
          placeholder="@username"
          value={recipient}
          onChange={(e) => {
            setRecipient(e.target.value);
            setSelectedContact(null);
          }}
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14 }}
        />
        <button type="button" onClick={onPaste} className="p-1" aria-label="Paste">
          <ClipboardPaste size={16} style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onScan}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ScanLine size={18} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>Scan QR</span>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onOpenAssetPicker}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={selectedAsset.symbol} size={22} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        disabled={!recipient.trim() || /^\+?\d{8,}$/.test(recipient.trim())}
        onClick={onContinue}
        className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
        style={{
          background: recipient.trim() && !/^\+?\d{8,}$/.test(recipient.trim()) ? 'var(--primary)' : 'var(--muted)',
          color: recipient.trim() && !/^\+?\d{8,}$/.test(recipient.trim()) ? '#fff' : 'var(--muted-foreground)',
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        Continue <ArrowUpRight size={18} />
      </motion.button>
    </motion.div>
  );
}
