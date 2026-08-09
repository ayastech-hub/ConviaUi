import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, User, AtSign, Mail, Phone, Camera, Check, Shield } from 'lucide-react';

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

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          aria-label="Back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>Edit Profile</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>Manage your personal information</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="rounded-[22px] flex items-center justify-center text-white relative"
            style={{ width: 90, height: 90, background: avatar ? 'transparent' : 'var(--primary)', fontSize: 32, fontWeight: 800, boxShadow: 'none', overflow: 'hidden' }}
          >
            {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'AM'}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'var(--secondary)', border: '3px solid var(--background)' }}>
              <Camera size={13} className="text-white" />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setAvatar(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 10 }}>Tap camera to change photo</p>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>Full Name</label>
            <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <User size={18} style={{ color: 'var(--muted-foreground)' }} />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>Username</label>
            <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: `1px solid ${usernameAvailable ? 'var(--border)' : 'var(--muted)'}` }}>
              <AtSign size={18} style={{ color: 'var(--muted-foreground)' }} />
              <input
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
                placeholder="username"
              />
              {username && (
                usernameAvailable
                  ? <Check size={18} style={{ color: 'var(--positive)' }} />
                  : <span style={{ color: 'var(--destructive)', fontSize: 11, fontWeight: 600 }}>Taken</span>
              )}
            </div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 6, marginLeft: 4 }}>
              Your unique handle on Convia · @{username}
            </p>
          </div>

          {/* Email */}
          <div>
            <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>Email Address</label>
            <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <Mail size={18} style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
              />
              <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--positive)', fontSize: 10, fontWeight: 700 }}>VERIFIED</span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' }}>Phone Number</label>
            <div className="flex items-center gap-3 p-3.5 rounded-[14px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <Phone size={18} style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
              />
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] mt-5" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
          <Shield size={15} style={{ color: 'var(--foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            Your information is encrypted and never shared with third parties
          </p>
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2 mt-5"
          style={{
            background: saved ? 'var(--positive)' : 'var(--primary)',
            fontWeight: 700,
            fontSize: 15,
            boxShadow: saved ? 'none' : 'none',
          }}
        >
          {saved ? (
            <>
              <Check size={18} /> Saved Successfully
            </>
          ) : (
            'Save Changes'
          )}
        </motion.button>

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}
