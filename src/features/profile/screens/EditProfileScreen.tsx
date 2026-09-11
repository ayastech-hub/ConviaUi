import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, AtSign, Mail, Lock, Check, Loader, AlignLeft } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ProfileFormField } from '../components/ProfileFormField';
import { AvatarUploader } from '../components/AvatarUploader';
import { useAuth } from '../../../shared/context/AuthContext';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import * as profileApi from '../../../shared/api/profile';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { cacheInvalidate } from '../../../shared/cache/queryCache';

interface EditProfileScreenProps {
  goBack: () => void;
}

type Visibility = 'public' | 'followers_only' | 'private';

const VIS: { id: Visibility; label: string; desc: string }[] = [
  { id: 'public', label: 'Public', desc: 'Anyone can find you' },
  { id: 'followers_only', label: 'Followers', desc: 'Only people you accept' },
  { id: 'private', label: 'Private', desc: 'Hidden from search' },
];

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';
}

/** PATCH /profiles/me — username is registration-only; country locks after KYC. */
export function EditProfileScreen({ goBack }: EditProfileScreenProps) {
  const { username, email } = useAuth();
  const { invalidate } = useMyProfile();

  const [nameLocked, setNameLocked] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrencyCode] = useState('NGN');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [orig, setOrig] = useState({ displayName: '', bio: '', country: '', currency: 'NGN', visibility: 'public' as Visibility });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    profileApi
      .getMyProfile()
      .then((p) => {
        const vis = (p.profileVisibility as Visibility) || 'public';
        const next = {
          displayName: p.displayName || '',
          bio: p.bio || '',
          country: (p.country || '').toUpperCase(),
          currency: (p.preferredCurrency || 'NGN').toUpperCase(),
          visibility: vis,
        };
        setDisplayName(next.displayName);
        setBio(next.bio);
        setCountry(next.country);
        setCurrencyCode(next.currency);
        setVisibility(next.visibility);
        setAvatar(p.avatarUrl || null);
        setOrig(next);
        const locked =
          Boolean((p as { nameLocked?: boolean }).nameLocked) ||
          (p as { kycStatus?: string }).kycStatus === 'approved';
        setNameLocked(locked);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dirty =
    displayName.trim() !== orig.displayName ||
    bio.trim() !== orig.bio ||
    visibility !== orig.visibility;

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: {
        displayName?: string;
        bio?: string;
        avatarUrl?: string;
      } = {};
      if (displayName.trim() && !nameLocked) body.displayName = displayName.trim();
      body.bio = bio.trim();
      if (avatar && /^https?:\/\//i.test(avatar)) body.avatarUrl = avatar;
      await profileApi.updateMyProfile(body);
      if (visibility !== orig.visibility) {
        await profileApi.updatePrivacy(visibility);
      }
      cacheInvalidate('profile:');
      invalidate();
      setOrig({
        displayName: displayName.trim(),
        bio: bio.trim(),
        country: orig.country,
        currency: orig.currency,
        visibility,
      });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.body.message || err.message });
      else setError({ message: 'Could not save profile' });
    } finally {
      setSaving(false);
    }
  };

  const localPreview = Boolean(avatar && !/^https?:\/\//i.test(avatar));

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title="Edit profile" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <AvatarUploader
                avatar={avatar}
                onChange={setAvatar}
                initials={initialsOf(displayName || username || 'C')}
              />
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 10 }}>
                Tap to change photo
              </p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <ProfileFormField
                label="Name"
                icon={User}
                value={displayName}
                onChange={nameLocked ? () => {} : setDisplayName}
                placeholder="Your name"
                readOnly={nameLocked}
                trailing={nameLocked ? <Lock size={14} style={{ color: 'var(--muted-foreground)' }} /> : undefined}
                hint={nameLocked ? 'Locked after identity verification' : undefined}
              />
              <ProfileFormField
                label="Username"
                icon={AtSign}
                value={username ? `@${username}` : ''}
                onChange={() => {}}
                readOnly
                trailing={<Lock size={14} style={{ color: 'var(--muted-foreground)' }} />}
                hint="Set at registration"
              />
              {email && (
                <ProfileFormField
                  label="Email"
                  icon={Mail}
                  value={email}
                  onChange={() => {}}
                  readOnly
                  trailing={<Lock size={14} style={{ color: 'var(--muted-foreground)' }} />}
                />
              )}
              <ProfileFormField
                label="Bio"
                icon={AlignLeft}
                value={bio}
                onChange={setBio}
                placeholder="Short bio"
                multiline
                maxLength={160}
                hint={`${bio.length}/160`}
              />
            </div>

            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
              PRIVACY
            </p>
            <div className="rounded-[20px] overflow-hidden mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {VIS.map((v, i) => {
                const on = visibility === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVisibility(v.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    style={{ borderBottom: i < VIS.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex-1">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{v.label}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{v.desc}</p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: on ? 'var(--primary)' : 'var(--border)',
                        background: on ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      {on && <Check size={11} style={{ color: '#fff', strokeWidth: 3 }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={saving || !dirty}
              onClick={() => void save()}
              className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2"
              style={{
                background: saved && !dirty ? 'var(--positive)' : 'var(--primary)',
                fontWeight: 700,
                fontSize: 15,
                opacity: !dirty && !saved ? 0.45 : 1,
              }}
            >
              {saving ? <Loader size={18} className="animate-spin" /> : saved && !dirty ? <Check size={18} /> : null}
              {saved && !dirty ? 'Saved' : 'Save changes'}
            </motion.button>
            <div style={{ height: 32 }} />
          </>
        )}
      </div>
    </div>
  );
}
