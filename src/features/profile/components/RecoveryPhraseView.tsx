import { AlertTriangle } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';

interface RecoveryPhraseViewProps {
  onBack: () => void;
}

/**
 * Custodial omnibus: user seed reveal is permanently disabled on the backend
 * (POST /security/:userId/recovery-phrase/reveal → 403 seed_reveal_disabled).
 * Emergency recovery is admin-only.
 */
export function RecoveryPhraseView({ onBack }: RecoveryPhraseViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Recovery Phrase" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div
          className="flex items-start gap-2 p-4 rounded-[12px] mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Not available for user accounts
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.55 }}>
              Convia holds balances on a custodial ledger. Exporting a seed phrase is disabled so on-chain
              wallets stay aligned with what you see in the app.
            </p>
            <ul
              className="mt-3 list-disc pl-4"
              style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.55 }}
            >
              <li>Move funds with in-app Send (username) or Withdraw (on-chain).</li>
              <li>If you deposited an unsupported asset, contact Support — staff can use emergency recovery.</li>
              <li>Never share a seed with anyone claiming to be Convia support.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
