import type { CSSProperties } from 'react';
import { AlertCircle, IdCard, BadgeCheck } from 'lucide-react';
import { StepNavButtons } from './StepNavButtons';

interface NigeriaIdStepProps {
  nin: string;
  setNin: (v: string) => void;
  bvn: string;
  setBvn: (v: string) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
  onContinue: () => void;
}

const inputStyle: CSSProperties = {
  color: 'var(--foreground)',
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: 0.5,
  width: '100%',
  background: 'transparent',
  outline: 'none',
  border: 'none',
  padding: '12px 0',
};

/** Nigeria Tier-1: NIN required, BVN recommended — no face capture. */
export function NigeriaIdStep({
  nin,
  setNin,
  bvn,
  setBvn,
  errors,
  clearError,
  onContinue,
}: NigeriaIdStepProps) {
  return (
    <div>
      <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', marginBottom: 6 }}>
        Verify with NIN
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45, marginBottom: 20 }}>
        Tier 1 identity for Nigeria. BVN is recommended for higher limits — no selfie required at this stage.
      </p>

      <div className="mb-4">
        <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>
          NIN <span style={{ color: 'var(--destructive)' }}>*</span>
        </label>
        <div
          className="flex items-center gap-2.5 px-3.5 rounded-2xl"
          style={{
            background: 'var(--muted)',
            border: `1px solid ${errors.nin ? 'var(--destructive)' : 'var(--border)'}`,
          }}
        >
          <IdCard size={18} style={{ color: errors.nin ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
          <input
            value={nin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 11);
              setNin(v);
              clearError('nin');
            }}
            placeholder="11-digit National Identity Number"
            inputMode="numeric"
            style={inputStyle}
          />
        </div>
        {errors.nin && (
          <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
            <AlertCircle size={11} /> {errors.nin}
          </p>
        )}
      </div>

      <div className="mb-2">
        <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>
          BVN <span style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>(recommended)</span>
        </label>
        <div
          className="flex items-center gap-2.5 px-3.5 rounded-2xl"
          style={{
            background: 'var(--muted)',
            border: `1px solid ${errors.bvn ? 'var(--destructive)' : 'var(--border)'}`,
          }}
        >
          <BadgeCheck size={18} style={{ color: errors.bvn ? 'var(--destructive)' : 'var(--muted-foreground)' }} />
          <input
            value={bvn}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 11);
              setBvn(v);
              clearError('bvn');
            }}
            placeholder="11-digit Bank Verification Number"
            inputMode="numeric"
            style={inputStyle}
          />
        </div>
        {errors.bvn && (
          <p className="flex items-center gap-1 mt-1.5" style={{ color: 'var(--destructive)', fontSize: 11 }}>
            <AlertCircle size={11} /> {errors.bvn}
          </p>
        )}
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 8, lineHeight: 1.4 }}>
          Adding BVN unlocks higher withdrawal and bills limits. You can skip and add it later.
        </p>
      </div>

      <div
        className="rounded-2xl px-3.5 py-3 mb-6 mt-4"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45 }}>
          <strong style={{ color: 'var(--foreground)' }}>Tier 2 (optional later):</strong> utility bill + face
          verification for maximum limits.
        </p>
      </div>

      <StepNavButtons onContinue={onContinue} continueLabel="Continue" />
    </div>
  );
}
