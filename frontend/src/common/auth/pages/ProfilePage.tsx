import Icon from '@assets/icons/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileModalHeader } from '../components/ProfileModalHeader';
import { ProfileModalTabs } from '../components/ProfileModalTabs';
import { PasswordTab } from '../components/tabs/PasswordTab';
import { ProfileTab } from '../components/tabs/ProfileTab';
import { StoreTab } from '../components/tabs/StoreTab';
import { useProfile } from '../hooks/useProfile';
import { useProfileModal } from '../hooks/useProfileModal';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile, loading } = useProfile();
  const modal = useProfileModal({ initialTab: 'profile' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-muted)]">{t('common.loading', { defaultValue: 'Chargement...' })}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
            <Icon name="user" className="w-8 h-8 text-[var(--color-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
            {t('profile.notFound', { defaultValue: 'Profil non trouvé' })}
          </h1>
          <p className="text-[var(--color-muted)]">
            {t('profile.notFoundDescription', { defaultValue: 'Impossible de charger les informations du profil.' })}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit =
    modal.activeTab === 'password'
      ? () => modal.handleSubmitPassword()
      : modal.activeTab === 'store'
        ? () => modal.handleSubmitStore()
        : () => modal.handleSubmitProfile();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('authChanged'));
  };

  return (
    <div className="bg-[var(--color-bg)]">
      <div className="max-w-5xl mx-auto">
        {/* Card principale avec tabs - plein écran sur mobile */}
        <div className="bg-[var(--color-card)] lg:rounded-[var(--radius-md)] lg:border lg:border-[var(--color-border)] lg:shadow-card">
          {/* Header sticky */}
          <div className="sticky top-0 z-30 bg-[var(--color-card)] border-b border-[var(--color-border)] lg:rounded-t-[var(--radius-md)]">
            <ProfileModalHeader 
              title={modal.t('profile.title')}
              onLogout={handleLogout}
            />
          </div>

          {/* Body avec tabs */}
          <main className="p-5 sm:p-6 bg-[var(--color-bg)] pb-28 lg:pb-6">
            {/* Onglets sticky */}
            <ProfileModalTabs
              activeTab={modal.activeTab}
              onTabChange={modal.setActiveTab}
              profileLabel={modal.t('profile.profileTab')}
              storeLabel={modal.t('profile.storeTab')}
              passwordLabel={modal.t('profile.passwordTab')}
            />

            {/* Contenu des onglets */}
            {modal.activeTab === 'profile' && (
              <div className="space-y-6">
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
                
                {/* Informations du compte - intégrées de manière fluide */}
                {/* <div className="pt-6 border-t border-[var(--color-border)]">
                  <h3 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-4">
                    {modal.t('profile.accountInfo', { defaultValue: 'Informations du compte' })}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                        {modal.t('profile.tenantId', { defaultValue: 'ID Tenant' })}
                      </span>
                      <p className="text-sm text-[var(--color-fg)] font-mono mt-1">
                        {profile?.tenant?.tenantId || user.tenantId}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                        {modal.t('profile.clientType', { defaultValue: 'Type de client' })}
                      </span>
                      <p className="text-sm text-[var(--color-fg)] mt-1 capitalize">
                        {profile?.tenant?.clientType || 'optician'}
                      </p>
                    </div>
                    {(profile?.tenant?.capabilities || ['optics']).length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide block mb-2">
                          {modal.t('profile.capabilities', { defaultValue: 'Capacités' })}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(profile?.tenant?.capabilities || ['optics']).map((capability) => (
                            <span
                              key={capability}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface)] text-[var(--color-primary)]"
                            >
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.roles && user.roles.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide block mb-2">
                          {modal.t('profile.roles', { defaultValue: 'Rôles' })}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[var(--color-primary)]/15 to-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div> */}
              </div>
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
        </div>
      </div>

      {/* Bouton sauvegarder flottant moderne */}
      <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 pointer-events-none lg:hidden">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={modal.loading}
            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold py-4 px-6 rounded-[var(--radius-md)] shadow-card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto flex items-center justify-center gap-2"
          >
            {modal.loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{modal.activeTab === 'password' 
                  ? modal.t('profile.changePassword')
                  : modal.t('common.save')
                }</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer pour desktop - sans card */}
      <div className="hidden lg:block max-w-5xl mx-auto px-6 py-6">
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={modal.loading}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold py-3.5 px-8 rounded-[var(--radius-md)] shadow-card hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base min-w-[180px]"
          >
            {modal.loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{modal.activeTab === 'password' 
                  ? modal.t('profile.changePassword')
                  : modal.t('common.save')
                }</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;