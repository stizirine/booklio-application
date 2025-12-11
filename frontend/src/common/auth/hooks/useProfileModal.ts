import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UpdateProfileRequest } from '../api/profile.api';
import { useProfile } from './useProfile';

interface UseProfileModalProps {
  initialTab?: 'profile' | 'password' | 'store';
}

export const useProfileModal = ({ initialTab = 'profile' }: UseProfileModalProps = {}) => {
  const { t } = useTranslation();
  const { user, loading, updateProfile, changePassword, uploadAvatar, deleteAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'store'>(initialTab);
  type ProfileForm = UpdateProfileRequest & { email?: string };
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [storeData, setStoreData] = useState({
    storeName: '',
    storeAddress: '',
    phoneNumber: '',
    patenteNumber: '',
    rcNumber: '',
    npeNumber: '',
    iceNumber: '',
  });

  // Mettre à jour le formulaire quand l'utilisateur change
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Mettre à jour les données du store quand l'utilisateur change
  React.useEffect(() => {
    if (user) {
      setStoreData({
        storeName: user.storeName || '',
        storeAddress: user.storeAddress || '',
        phoneNumber: user.phoneNumber || '',
        patenteNumber: user.patenteNumber || '',
        rcNumber: user.rcNumber || '',
        npeNumber: user.npeNumber || '',
        iceNumber: user.iceNumber || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const { firstName, lastName, phone, email } = formData;
      const updated = await updateProfile({ firstName, lastName, phone, email });

      // Synchroniser le formulaire immédiatement après la mise à jour
      if (updated) {
        setFormData({
          firstName: updated.firstName || '',
          lastName: updated.lastName || '',
          email: updated.email || '',
          phone: updated.phone || '',
        });
      }
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleSubmitStore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      // L'API attend des champs à plat; on envoie directement storeData
      await updateProfile({
        storeName: storeData.storeName,
        storeAddress: storeData.storeAddress,
        phoneNumber: storeData.phoneNumber,
        patenteNumber: storeData.patenteNumber,
        rcNumber: storeData.rcNumber,
        npeNumber: storeData.npeNumber,
        iceNumber: storeData.iceNumber,
      });
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleSubmitPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (error) {
        // L'erreur est déjà gérée dans le hook
      }
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  return {
    t,
    user,
    loading,
    activeTab,
    setActiveTab,
    formData,
    passwordData,
    storeData,
    fileInputRef,
    handleInputChange,
    handlePasswordChange,
    handleStoreChange,
    handleSubmitProfile,
    handleSubmitStore,
    handleSubmitPassword,
    handleAvatarUpload,
    handleDeleteAvatar,
  };
};

