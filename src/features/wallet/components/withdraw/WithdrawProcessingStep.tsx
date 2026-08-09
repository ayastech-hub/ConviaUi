import { Loader } from 'lucide-react';

interface WithdrawProcessingStepProps {
  amount: string;
  symbol: string;
  chain: string;
}

/** Loading spinner shown while a withdrawal is "submitting". */
export function WithdrawProcessingStep({ amount, symbol, chain }: WithdrawProcessingStepProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'var(--muted)' }}>
        <Loader size={36} className="animate-spin" style={{ color: 'var(--foreground)' }} />
      </div>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Processing Withdrawal...</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Sending {amount} {symbol} on {chain}</p>
    </div>
  );
}
