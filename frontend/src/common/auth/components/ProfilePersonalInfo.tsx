import Icon from '@assets/icons/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface ProfilePersonalInfoProps {
  user: User;
  onEditClick: () => void;
}

const ProfilePersonalInfo: React.FC<ProfilePersonalInfoProps> = ({ user, onEditClick }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-md)] shadow-card border border-[var(--color-border)]">
      <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-fg)]">
          {t('profile.personalInfo', { defaultValue: 'Informations personnelles' })}
        </h3>
        <button
          onClick={onEditClick}
          className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
        >
          {t('profile.editProfile', { defaultValue: 'Modifier' })}
        </button>
      </div>
      <div className="p-5 sm:p-6">
        {/* Avatar et nom en haut */}
        <div className="flex items-center gap-4 sm:gap-6 mb-6 flex-wrap">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-border)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                <Icon name="user" className="w-10 h-10 text-[var(--color-muted)]" />
              </div>
            )}
            <button
              type="button"
              onClick={onEditClick}
              className="absolute -bottom-1 -right-1 bg-[var(--color-primary)] text-white rounded-full p-1.5 hover:opacity-90 transition-colors shadow-sm"
            >
              <Icon name="camera" className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-[var(--color-fg)]">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-[var(--color-muted)]">{user.email}</p>
            <button
              onClick={onEditClick}
              className="text-sm text-[var(--color-primary)] hover:text-[var(--color-secondary)] mt-1 font-semibold"
            >
              {user?.avatar ? t('profile.changeAvatar', { defaultValue: 'Changer l\'avatar' }) : t('profile.addAvatar', { defaultValue: 'Ajouter un avatar' })}
            </button>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
              {t('profile.firstName', { defaultValue: 'Prénom' })}
            </label>
            <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              {user.firstName || t('profile.notProvided', { defaultValue: 'Non renseigné' })}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
              {t('profile.lastName', { defaultValue: 'Nom' })}
            </label>
            <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              {user.lastName || t('profile.notProvided', { defaultValue: 'Non renseigné' })}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
              {t('profile.email', { defaultValue: 'Email' })}
            </label>
            <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              {user.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
              {t('profile.phone', { defaultValue: 'Téléphone' })}
            </label>
            <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              {user.phone || t('profile.notProvided', { defaultValue: 'Non renseigné' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePersonalInfo;
