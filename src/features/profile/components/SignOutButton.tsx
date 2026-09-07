import { useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, Loader } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';

/** Signs out via POST /auth/logout and clears local session. */
export function SignOutButton({ onSignedOut }: { onSignedOut?: () => void }) {
  const { logout, status } = useAuth();
  const [loading, setLoading] = useState(false);

  if (status !== 'authenticated') return null;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await logout();
          onSignedOut?.();
        } finally {
          setLoading(false);
        }
      }}
      className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2"
      style={{
        background: 'transparent',
        color: 'var(--destructive)',
        fontWeight: 600,
        fontSize: 14,
        border: '1px solid color-mix(in oklab, var(--destructive) 28%, var(--border))',
      }}
    >
      {loading ? <Loader size={16} className="animate-spin" /> : <LogOut size={16} />}
      Sign out
    </motion.button>
  );
}
