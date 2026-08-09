import { useRef } from 'react';
import { motion } from 'motion/react';
import { Camera } from 'lucide-react';

interface AvatarUploaderProps {
  avatar: string | null;
  onChange: (dataUrl: string) => void;
  initials: string;
  size?: number;
}

/**
 * Circular avatar with a camera button overlay for picking a new photo.
 * Shared by `ProfileCard` (72px) and `EditProfileScreen`'s form (90px).
 */
export function AvatarUploader({ avatar, onChange, initials, size = 72 }: AvatarUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="rounded-[22px] flex items-center justify-center text-white relative"
      style={{ width: size, height: size, background: avatar ? 'transparent' : 'var(--primary)', fontSize: size * 0.36, fontWeight: 800, overflow: 'hidden' }}
    >
      {avatar ? (
        <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => fileRef.current?.click()}
        className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
        style={{ width: size * 0.32, height: size * 0.32, background: 'var(--secondary)', border: '2px solid var(--card)' }}
      >
        <Camera size={size * 0.15} className="text-white" />
      </motion.button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
