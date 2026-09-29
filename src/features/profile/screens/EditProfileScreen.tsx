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
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrencyCode] = useState('NGN');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [orig, setOrig] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    displayName: '',
    bio: '',
    country: '',
    currency: 'NGN',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    profileApi
      .getMyProfile()
      .then((p) => {
        const next = {
          firstName: p.firstName || '',
          middleName: p.middleName || '',
          lastName: p.lastName || '',
          displayName: p.displayName || '',
          bio: p.bio || '',
          country: (p.country || '').toUpperCase(),
          currency: (p.preferredCurrency || 'NGN').toUpperCase(),
        };
        setFirstName(next.firstName);
        setMiddleName(next.middleName);
        setLastName(next.lastName);
        setDisplayName(next.displayName);
        setBio(next.bio);
        setCountry(next.country);
        setCurrencyCode(next.currency);
        
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
    firstName.trim() !== orig.firstName ||
    middleName.trim() !== orig.middleName ||
    lastName.trim() !== orig.lastName ||
    bio.trim() !== orig.bio;

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: {
        firstName?: string;
        lastName?: string;
        middleName?: string | null;
        bio?: string;
        avatarUrl?: string;
      } = {};
      if (!nameLocked) {
        if (firstName.trim()) body.firstName = firstName.trim();
        if (lastName.trim()) body.lastName = lastName.trim();
        body.middleName = middleName.trim() || null;
      }
      body.bio = bio.trim();
      if (avatar && /^https?:\/\//i.test(avatar)) body.avatarUrl = avatar;
      await profileApi.updateMyProfile(body);
      cacheInvalidate('profile:');
      invalidate();
      const composed = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');
      setDisplayName(composed);
      setOrig({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        displayName: composed,
        bio: bio.trim(),
        country: orig.country,
        currency: orig.currency,
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
                label="First name"
                icon={User}
                value={firstName}
                onChange={nameLocked ? () => {} : setFirstName}
                placeholder="First name"
                readOnly={nameLocked}
                trailing={nameLocked ? <Lock size={14} style={{ color: 'var(--muted-foreground)' }} /> : undefined}
                hint={nameLocked ? 'Locked after identity verification' : undefined}
              />
              <ProfileFormField
                label="Middle name"
                icon={User}
                value={middleName}
                onChange={nameLocked ? () => {} : setMiddleName}
                placeholder="Optional"
                readOnly={nameLocked}
              />
              <ProfileFormField
                label="Last name"
                icon={User}
                value={lastName}
                onChange={nameLocked ? () => {} : setLastName}
                placeholder="Last name"
                readOnly={nameLocked}
                trailing={nameLocked ? <Lock size={14} style={{ color: 'var(--muted-foreground)' }} /> : undefined}
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
