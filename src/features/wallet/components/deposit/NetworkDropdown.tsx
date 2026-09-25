import { networkInfoForKey } from './types';

interface NetworkDropdownProps {
  open: boolean;
  networks: string[];
  selected: string;
  onSelect: (network: string) => void;
  onClose: () => void;
}

export function NetworkDropdown({ open, networks, selected, onSelect, onClose }: NetworkDropdownProps) {
  if (!open) return null;
  const selectedKey = networkInfoForKey(selected).chainKey;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
      <div
        className="rounded-t-[24px] max-h-[70vh] overflow-y-auto px-4 pb-8 pt-3"
        style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--muted-foreground)' }} />
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Network</p>
        {networks.map((n) => {
          const info = networkInfoForKey(n);
          const active = info.chainKey === selectedKey || n === selected;
          return (
            <button
              key={info.chainKey || n}
              type="button"
              onClick={() => {
                onSelect(info.chainKey);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl mb-1.5 text-left"
              style={{
                background: active ? 'var(--muted)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{info.name}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                  {info.label}
                  {info.estTime ? ` · ${info.estTime}` : ''}
                </p>
              </div>
              {active && (
                <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>Selected</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
