import { useState } from 'react';
import { motion } from 'motion/react';
import { User, AtSign, Mail, Phone, Check, Shield } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { AvatarUploader } from '../components/AvatarUploader';
import { ProfileFormField } from '../components/ProfileFormField';

interface EditProfileScreenProps {
  goBack: () => void;
}

export function EditProfileScreen({ goBack }: EditProfileScreenProps) {
  const [name, setName] = useState('Ade Mensah');
  const [username, setUsername] = useState('ade_mensah');
  const [email, setEmail] = useState('ade.mensah@example.com');
  const [phone, setPhone] = useState('+233 24 123 4567');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 20);
    setUsername(clean);
    setUsernameAvailable(clean !== 'taken_name');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      goBack();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Edit Profile" subtitle="Manage your personal information" onBack={goBack} />

      <div className="px-5 pb-5">
        <div className="flex flex-col items-center mb-6">
          <AvatarUploader avatar={avatar} onChange={setAvatar} initials="AM" size={90} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 10 }}>Tap camera to change photo</p>
        </div>

        <div className="flex flex-col gap-4">
          <ProfileFormField label="Full Name" icon={User} value={name} onChange={setName} />

          <ProfileFormField
            label="Username"
            icon={AtSign}
            value={username}
            onChange={handleUsernameChange}
            placeholder="username"
            hint={`Your unique handle on Convia · @${username}`}
            borderColor={usernameAvailable ? undefined : 'var(--muted)'}
            trailing={
              username ? (
                usernameAvailable
                  ? <Check size={18} style={{ color: 'var(--positive)' }} />
                  : <span style={{ color: 'var(--destructive)', fontSize: 11, fontWeight: 600 }}>Taken</span>
              ) : undefined
            }
          />

          <ProfileFormField
            label="Email Address"
            icon={Mail}
            type="email"
            value={email}
            onChange={setEmail}
            trailing={
              <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--positive)', fontSize: 10, fontWeight: 700 }}>
                VERIFIED
              </span>
            }
          />

          <ProfileFormField label="Phone Number" icon={Phone} type="tel" value={phone} onChange={setPhone} />
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] mt-5" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
          <Shield size={15} style={{ color: 'var(--foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            Your information is encrypted and never shared with third parties
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2 mt-5"
          style={{ background: saved ? 'var(--positive)' : 'var(--primary)', fontWeight: 700, fontSize: 15 }}
        >
          {saved ? (<><Check size={18} /> Saved Successfully</>) : 'Save Changes'}
        </motion.button>

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}
