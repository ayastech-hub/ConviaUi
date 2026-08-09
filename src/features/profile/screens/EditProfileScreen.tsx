import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, AtSign, MapPin, Coins, Check, Shield, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ProfileFormField } from '../components/ProfileFormField';
import { AvatarUploader } from '../components/AvatarUploader';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSupportedCountries } from '../../../shared/hooks/useSupportedCountries';
import * as profileApi from '../../../shared/api/profile';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { cacheInvalidate } from '../../../shared/cache/queryCache';

interface EditProfileScreenProps {
  goBack: () => void;
}

/** PATCH /profiles/me for fields the API accepts. Username is registration-only. */
export function EditProfileScreen({ goBack }: EditProfileScreenProps) {
  const { username } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    profileApi
      .getMyProfile()
      .then((p) => {
        setDisplayName(p.displayName || '');
        setBio(p.bio || '');
        setCountry(p.country || '');
        setCurrency(p.preferredCurrency || 'NGN');
        setAvatar(p.avatarUrl || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: {
        displayName?: string;
        bio?: string;
        country?: string;
        preferredCurrency?: string;
        avatarUrl?: string;
      } = {};
      if (displayName.trim()) body.displayName = displayName.trim();
      if (bio.trim()) body.bio = bio.trim();
      if (country.trim().length === 2) body.country = country.trim().toUpperCase();
      if (currency.trim().length === 3) body.preferredCurrency = currency.trim().toUpperCase();
      // Only send avatar if it's already a URL (data URLs need upload infrastructure)
      if (avatar && /^https?:\/\//i.test(avatar)) body.avatarUrl = avatar;
      await profileApi.updateMyProfile(body);
      cacheInvalidate('profile:');
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.body.message || err.message });
      else setError({ message: 'Could not save profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Edit Profile" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5">
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} detail={error.code} />}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <AvatarUploader
                avatar={avatar}
                onChange={setAvatar}
                initials={(displayName || username || 'C').slice(0, 2).toUpperCase()}
                size={90}
              />
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 10 }}>
                Avatar URL upload requires a hosted image URL (PATCH accepts url only)
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <ProfileFormField label="Display name" icon={User} value={displayName} onChange={setDisplayName} />
              <ProfileFormField
                label="Username"
                icon={AtSign}
                value={username || ''}
                onChange={() => {}}
                hint="Set at registration — not editable via API"
              />
              <ProfileFormField label="Bio" icon={User} value={bio} onChange={setBio} placeholder="Short bio" />
              <ProfileFormField
                label="Country (ISO-2)"
                icon={MapPin}
                value={country}
                onChange={(v) => setCountry(v.slice(0, 2))}
                placeholder="NG"
              />
              <ProfileFormField
                label="Preferred currency"
                icon={Coins}
                value={currency}
                onChange={(v) => setCurrency(v.slice(0, 3).toUpperCase())}
                placeholder="NGN"
              />
            </div>
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] mt-5"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <Shield size={15} style={{ color: 'var(--foreground)' }} />
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                Country locks after KYC approval (`country_locked`).
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              onClick={() => void save()}
              className="w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2 mt-5"
              style={{ background: saved ? 'var(--positive)' : 'var(--primary)', fontWeight: 700, fontSize: 15 }}
            >
              {saving ? <Loader size={18} className="animate-spin" /> : saved ? <Check size={18} /> : null}
              {saved ? 'Saved successfully' : 'Save changes'}
            </motion.button>
            <div style={{ height: 60 }} />
          </>
        )}
      </div>
    </div>
  );
}
