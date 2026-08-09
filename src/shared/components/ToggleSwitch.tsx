import { motion } from 'motion/react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

/** The pill-shaped on/off switch used across Settings & Security rows. */
export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="w-12 h-7 rounded-full flex items-center px-1 transition-colors"
      style={{ background: checked ? 'var(--primary)' : 'var(--switch-background)', justifyContent: checked ? 'flex-end' : 'flex-start' }}
    >
      <div className="w-5 h-5 rounded-full bg-white" />
    </motion.button>
  );
}
