import { Building2, CreditCard } from 'lucide-react';

export type PaymentMethod = 'bank' | 'card';

export interface NewCardDraft {
  number: string;
  expiry: string;
  cvc: string;
  name?: string;
}

interface PaymentMethodSelectorProps {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
}

/** Bank or card — liquid glass, active clearly elevated. */
export function PaymentMethodSelector({ method, setMethod }: PaymentMethodSelectorProps) {
  const options: { id: PaymentMethod; label: string; Icon: typeof Building2 }[] = [
    { id: 'bank', label: 'Bank transfer', Icon: Building2 },
    { id: 'card', label: 'Card', Icon: CreditCard },
  ];

  return (
    <div className="mb-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
        Pay with
      </p>
      <div
        className="grid grid-cols-2 gap-1 p-1 rounded-2xl"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        {options.map(({ id, label, Icon }) => {
          const active = method === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMethod(id)}
              className="flex items-center justify-center gap-2 py-3 rounded-[14px]"
              style={{
                background: active ? 'var(--liquid-chip-on-bg)' : 'var(--liquid-chip-off-bg)',
                border: `1.5px solid ${active ? 'var(--liquid-chip-on-border)' : 'transparent'}`,
                boxShadow: active ? 'var(--liquid-chip-on-shadow)' : 'none',
                color: active ? 'var(--liquid-chip-on-text)' : 'var(--liquid-chip-off-text)',
                backdropFilter: active ? 'blur(16px)' : undefined,
                WebkitBackdropFilter: active ? 'blur(16px)' : undefined,
                fontSize: 13,
                fontWeight: active ? 700 : 550,
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
