import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { presentApiErrorI18n } from '@src/helpers/errors';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GetProfileResponse, profileApi, UpdateProfileRequest } from '../api/profile.api';
import { User } from '../types';

interface UseProfileProps {
  autoFetch?: boolean;
}

export const useProfile = ({ autoFetch = false }: UseProfileProps = {}) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotification();
  // Utiliser l'user du contexte AuthContext au lieu de le charger séparément
  const { user: contextUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState<GetProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // user vient maintenant du contexte
  const user = contextUser;

  // Charger le profil utilisateur (tenant, capabilities, etc.)
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profileData = await profileApi.getProfile();
      setProfile(profileData);
      // L'user est déjà dans le contexte AuthContext, pas besoin de le setter
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
    } finally {
      setLoading(false);
    }
  }, [t, showError]);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await profileApi.updateProfile(data);

      // Mettre à jour l'user dans le contexte Auth (attendre la propagation)
      await refreshUser();

      // Mettre à jour le profil complet si disponible
      if (profile) {
        setProfile({
          ...profile,
          user: response.user
        });
      }

      showSuccess(
        t('common.success'),
        t('profile.updateSuccess', { defaultValue: 'Profil mis à jour avec succès' })
      );

      return response.user;
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile, refreshUser, t, showError, showSuccess]);

  // Changer le mot de passe
  const changePassword = useCallback(async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await profileApi.changePassword(data);
      showSuccess(
        t('common.success'),
        t('profile.passwordChangeSuccess', { defaultValue: 'Mot de passe modifié avec succès' })
      );
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t, showError, showSuccess]);

  // Uploader un avatar
  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await profileApi.uploadAvatar(file);
      
      // Mettre à jour l'user dans le contexte Auth
      refreshUser();

      showSuccess(
        t('common.success'),
        t('profile.avatarUploadSuccess', { defaultValue: 'Avatar mis à jour avec succès' })
      );
      
      return response.avatarUrl;
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshUser, t, showError, showSuccess]);

  // Supprimer l'avatar
  const deleteAvatar = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await profileApi.deleteAvatar();
      
      // Mettre à jour l'user dans le contexte Auth
      refreshUser();

      showSuccess(
        t('common.success'),
        t('profile.avatarDeleteSuccess', { defaultValue: 'Avatar supprimé avec succès' })
      );
    } catch (err) {
      const { title, message } = presentApiErrorI18n(err, t);
      setError(message);
      showError(title, message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshUser, t, showError, showSuccess]);

  // Charger le profil complet (tenant, capabilities, etc.) si autoFetch et user disponible
  useEffect(() => {
    if (autoFetch && user && !profile) {
      fetchProfile();
    }
  }, [autoFetch, user, profile, fetchProfile]);

  return {
    // State
    profile,
    user,
    loading,
    error,

    // Actions
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,

    // Setters
    setProfile,
  };
};
