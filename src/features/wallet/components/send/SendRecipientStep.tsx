import type { RefObject } from 'react';
import { motion } from 'motion/react';
import { Search, X, ClipboardPaste, ScanLine, ChevronDown, ArrowUpRight } from 'lucide-react';
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
  addressInputRef: RefObject<HTMLInputElement>;
  onPaste: () => void;
  onScan: () => void;
  selectedAsset: Asset;
  onOpenAssetPicker: () => void;
  onContinue: () => void;
}

/** Send step 1: search contacts, or enter/scan/paste an address, and pick the asset. */
export function SendRecipientStep({
  search, setSearch, filteredContacts, onSelectContact, recipient, setRecipient, setSelectedContact,
  addressInputRef, onPaste, onScan, selectedAsset, onOpenAssetPicker, onContinue,
}: SendRecipientStepProps) {
  return (
    <motion.div key="recipient" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
      <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
        <input
          placeholder="Search contacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14 }}
          autoFocus
        />
        {search && (
          <button onClick={() => setSearch('')} className="flex items-center justify-center w-5 h-5">
            <X size={14} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Recent contacts</p>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{filteredContacts.length}</span>
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {filteredContacts.map((contact, i) => (
          <motion.button
            key={contact.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectContact(contact)}
            className="flex items-center gap-3 p-3 rounded-[16px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white relative" style={{ background: contact.color, fontSize: 13, fontWeight: 700 }}>
              {contact.initials}
              {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: 'var(--positive)', border: '2px solid var(--background)' }} />}
            </div>
            <div className="flex-1 text-left">
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{contact.name}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@{contact.username}</p>
            </div>
            {contact.online && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--foreground)' }} />}
          </motion.button>
        ))}
        {filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No contacts found</p>
          </div>
        )}
      </div>

      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Or enter address</p>
      <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <input
          ref={addressInputRef}
          placeholder="0x… or @username"
          value={recipient}
          onChange={(e) => { setRecipient(e.target.value); setSelectedContact(null); }}
          className="flex-1 bg-transparent outline-none"
          style={{ color: 'var(--foreground)', fontSize: 14, fontFamily: recipient.startsWith('0x') ? 'monospace' : 'inherit' }}
        />
        <button onClick={onPaste} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--muted)' }}>
          <ClipboardPaste size={13} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Paste</span>
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <motion.button whileTap={{ scale: 0.97 }} onClick={onScan} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <ScanLine size={18} style={{ color: 'var(--foreground)' }} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>Scan QR</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onOpenAssetPicker} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <AssetIcon symbol={selectedAsset.symbol} size={22} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={!recipient.trim()}
        onClick={onContinue}
        className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
        style={{ background: recipient.trim() ? 'var(--primary)' : 'var(--muted)', color: recipient.trim() ? '#fff' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 15 }}
      >
        Continue <ArrowUpRight size={18} />
      </motion.button>
    </motion.div>
  );
}
