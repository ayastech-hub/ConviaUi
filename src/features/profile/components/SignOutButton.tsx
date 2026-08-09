import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';

/** Destructive "Sign Out" button used on both the Profile and Settings screens. */
export function SignOutButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2"
      style={{ background: 'var(--muted)', color: 'var(--destructive)', fontWeight: 700, fontSize: 14, border: '1px solid var(--muted)' }}
    >
      <LogOut size={16} />
      Sign Out
    </motion.button>
  );
}
