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
 * Avatar with camera overlay. PATCH /profiles/me only accepts https URLs —
 * local files are preview-only until an upload service exists.
 */
export function AvatarUploader({ avatar, onChange, initials, size = 88 }: AvatarUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isUrl = Boolean(avatar && /^https?:\/\//i.test(avatar));
  const showImg = Boolean(avatar);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="rounded-[22px] flex items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: size,
          background: showImg ? 'var(--muted)' : 'color-mix(in oklab, var(--primary) 18%, var(--muted))',
          fontSize: size * 0.32,
          fontWeight: 700,
          color: 'var(--foreground)',
          letterSpacing: '-0.04em',
        }}
      >
        {showImg ? (
          <img src={avatar!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials
        )}
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => fileRef.current?.click()}
        aria-label="Change photo"
        className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          background: 'var(--foreground)',
          color: 'var(--background)',
          border: '2px solid var(--background)',
        }}
      >
        <Camera size={13} />
      </motion.button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {!isUrl && avatar && (
        <span className="sr-only">Local preview only</span>
      )}
    </div>
  );
}
