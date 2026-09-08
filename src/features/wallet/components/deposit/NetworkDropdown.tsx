import { NETWORKS } from './types';

interface NetworkDropdownProps {
  open: boolean;
  networks: string[];
  selected: string;
  onSelect: (n: string) => void;
  onClose: () => void;
}

/** Compact bottom sheet — same interaction as withdraw network picker. */
export function NetworkDropdown({ open, networks, selected, onSelect, onClose }: NetworkDropdownProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[45vh] overflow-y-auto rounded-t-[20px] px-4 pt-3 pb-8"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />
        <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
          Network
        </p>
        {networks.map((n) => {
          const info = NETWORKS[n] || { label: n, name: n, estTime: '—', color: 'var(--muted)' };
          const active = selected === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                onSelect(n);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-3.5 rounded-xl text-left"
              style={{ background: active ? 'var(--muted)' : 'transparent' }}
            >
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                  {info.name || n}
                </p>
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
