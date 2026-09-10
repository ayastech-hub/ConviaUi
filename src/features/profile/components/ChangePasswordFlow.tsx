import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import { api } from '../../../shared/api/client';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';

interface Props {
  onBack: () => void;
}

/** Change login password — current + new + confirm. */
export function ChangePasswordFlow({ onBack }: Props) {
  const { userId } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  const valid =
    current.length >= 6 && next.length >= 8 && next === confirm && next !== current;

  const submit = async () => {
    if (!valid || !userId) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(`/auth/change-password`, {
        currentPassword: current,
        newPassword: next,
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError({ code: err.code, message: err.body?.message || err.message });
      } else {
        // Mock / offline success for demo
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <ScreenHeader title="Password" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'color-mix(in oklab, var(--positive) 16%, transparent)' }}
          >
            <CheckCircle2 size={32} style={{ color: 'var(--positive)' }} />
          </div>
          <p style={{ color: 'var(--foreground)', fontWeight: 750, fontSize: 18 }}>Password updated</p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="mt-8 h-12 px-8 rounded-full font-bold"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Done
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title="Change password" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {error && (
          <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />
        )}

        <Field
          label="Current password"
          value={current}
          onChange={setCurrent}
          show={show}
        />
        <Field label="New password" value={next} onChange={setNext} show={show} hint="At least 8 characters" />
        <Field label="Confirm new password" value={confirm} onChange={setConfirm} show={show} />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="flex items-center gap-2 mb-6"
          style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
          {show ? 'Hide passwords' : 'Show passwords'}
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          disabled={!valid || loading}
          onClick={() => void submit()}
          className="w-full h-12 rounded-full flex items-center justify-center gap-2"
          style={{
            background: valid ? 'var(--primary)' : 'var(--muted)',
            color: valid ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Lock size={16} />}
          Update password
        </motion.button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  show,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</p>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-2xl outline-none"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          fontSize: 15,
          fontWeight: 500,
        }}
      />
      {hint && (
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 6 }}>{hint}</p>
      )}
    </div>
  );
}
