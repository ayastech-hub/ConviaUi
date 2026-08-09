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
    <div className="px-5 mb-8">
      <motion.button
        whileTap={{ scale: 0.97 }}
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
          background: 'rgba(239,68,68,0.12)',
          color: '#EF4444',
          fontWeight: 700,
          fontSize: 15,
          border: '1px solid rgba(239,68,68,0.25)',
        }}
      >
        {loading ? <Loader size={18} className="animate-spin" /> : <LogOut size={18} />}
        Sign out
      </motion.button>
    </div>
  );
}
