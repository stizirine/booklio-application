import React from 'react';
import { useProfileModal } from '../hooks/useProfileModal';
import { ProfileModalFooter } from './ProfileModalFooter';
import { ProfileModalHeader } from './ProfileModalHeader';
import { ProfileModalTabs } from './ProfileModalTabs';
import { PasswordTab } from './tabs/PasswordTab';
import { ProfileTab } from './tabs/ProfileTab';
import { StoreTab } from './tabs/StoreTab';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'password' | 'store';
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'profile' }) => {
  const modal = useProfileModal({ initialTab });

  if (!isOpen) return null;

  const handleSubmit =
    modal.activeTab === 'password'
      ? () => modal.handleSubmitPassword()
      : modal.activeTab === 'store'
        ? () => modal.handleSubmitStore()
        : () => modal.handleSubmitProfile();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-6">
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-card max-w-3xl w-full h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <ProfileModalHeader 
          onClose={onClose}
          title={modal.t('profile.title')}
        />

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[var(--color-bg)]">
          {/* Onglets */}
          <ProfileModalTabs
            activeTab={modal.activeTab}
            onTabChange={modal.setActiveTab}
            profileLabel={modal.t('profile.profileTab')}
            storeLabel={modal.t('profile.storeTab')}
            passwordLabel={modal.t('profile.passwordTab')}
          />

          {/* Contenu des onglets */}
          {modal.activeTab === 'profile' && (
            <ProfileTab
              user={modal.user}
              formData={modal.formData}
              fileInputRef={modal.fileInputRef}
              handleInputChange={modal.handleInputChange}
              handleAvatarUpload={modal.handleAvatarUpload}
              handleDeleteAvatar={modal.handleDeleteAvatar}
              onSubmit={modal.handleSubmitProfile}
              t={modal.t}
            />
          )}

          {modal.activeTab === 'store' && (
            <StoreTab
              storeData={modal.storeData}
              handleStoreChange={modal.handleStoreChange}
              onSubmit={modal.handleSubmitStore}
              t={modal.t}
            />
          )}

          {modal.activeTab === 'password' && (
            <PasswordTab
              passwordData={modal.passwordData}
              handlePasswordChange={modal.handlePasswordChange}
              onSubmit={modal.handleSubmitPassword}
              t={modal.t}
            />
          )}
        </main>

        {/* Footer */}
        <ProfileModalFooter 
          loading={modal.loading}
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={modal.activeTab === 'password' 
            ? modal.t('profile.changePassword')
            : modal.t('common.save')
          }
          cancelLabel={modal.t('common.cancel')}
        />
      </div>
    </div>
  );
};

export default ProfileModal;
