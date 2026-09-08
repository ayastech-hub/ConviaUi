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

/** Bank or card only — details collected on review step. */
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
      <div className="grid grid-cols-2 gap-2.5">
        {options.map(({ id, label, Icon }) => {
          const active = method === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setMethod(id)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl"
              style={{
                background: active ? 'var(--primary)' : 'var(--card)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                color: active ? 'var(--primary-foreground, #fff)' : 'var(--foreground)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
