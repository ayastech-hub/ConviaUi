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
import { useLanguage } from '../../../shared/context/LanguageContext';

interface EditProfileScreenProps {
  goBack: () => void;
}

/** PATCH /profiles/me for fields the API accepts. Username is registration-only. */
export function EditProfileScreen({ goBack }: EditProfileScreenProps) {
  const { t } = useLanguage();
