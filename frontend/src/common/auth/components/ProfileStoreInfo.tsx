import Icon from '@assets/icons/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface ProfileStoreInfoProps {
  user: User;
  onEditClick: () => void;
}

const ProfileStoreInfo: React.FC<ProfileStoreInfoProps> = ({ user, onEditClick }) => {
  const { t } = useTranslation();

  const hasStoreInfo = user?.storeName || user?.storeAddress || user?.phoneNumber || 
                      user?.patenteNumber || user?.rcNumber || user?.npeNumber || user?.iceNumber;

  if (!hasStoreInfo) {
    return (
      <div className="bg-[var(--color-card)] rounded-[var(--radius-md)] shadow-card border border-[var(--color-border)]">
        <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">
            {t('profile.storeInfo', { defaultValue: 'Informations du magasin' })}
          </h3>
          <button
            onClick={onEditClick}
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
          >
            {t('profile.addStoreInfo', { defaultValue: 'Ajouter' })}
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-surface)] rounded-full flex items-center justify-center">
            <Icon name="building" className="w-8 h-8 text-[var(--color-muted)]" />
          </div>
          <p className="text-[var(--color-muted)] mb-4">
            {t('profile.noStoreInfo', { defaultValue: 'Aucune information de magasin renseignée' })}
          </p>
          <button
            onClick={onEditClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-success)] text-white text-sm font-semibold rounded-[var(--radius-sm)] hover:opacity-90 transition-colors shadow-sm"
          >
            <Icon name="plus" className="w-4 h-4" />
            {t('profile.addStoreInfo', { defaultValue: 'Ajouter les informations du magasin' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-md)] shadow-card border border-[var(--color-border)]">
      <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-fg)]">
          {t('profile.storeInfo', { defaultValue: 'Informations du magasin' })}
        </h3>
        <button
          onClick={onEditClick}
          className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
        >
          {t('profile.editStoreInfo', { defaultValue: 'Modifier' })}
        </button>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {user.storeName && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
                {t('profile.storeName', { defaultValue: 'Nom du magasin' })}
              </label>
              <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                {user.storeName}
              </p>
            </div>
          )}
          {user.phoneNumber && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
                {t('profile.storePhone', { defaultValue: 'Téléphone' })}
              </label>
              <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                {user.phoneNumber}
              </p>
            </div>
          )}
          {user.patenteNumber && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
                {t('profile.patenteNumber', { defaultValue: 'Numéro de patente' })}
              </label>
              <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                {user.patenteNumber}
              </p>
            </div>
          )}
          {user.rcNumber && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
                {t('profile.rcNumber', { defaultValue: 'Registre de commerce (RC)' })}
              </label>
              <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                {user.rcNumber}
              </p>
            </div>
          )}
          {user.npeNumber && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
                {t('profile.npeNumber', { defaultValue: 'NPE' })}
              </label>
              <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                {user.npeNumber}
              </p>
            </div>
          )}
          {user.iceNumber && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
                {t('profile.iceNumber', { defaultValue: 'ICE' })}
              </label>
              <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                {user.iceNumber}
              </p>
            </div>
          )}
        </div>
        {user.storeAddress && (
          <div className="mt-6">
            <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
              {t('profile.storeAddress', { defaultValue: 'Adresse' })}
            </label>
            <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              {user.storeAddress}
            </p>
          </div>
        )}
        <div className="mt-6">
          <button
            onClick={onEditClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-success)] text-white text-sm font-semibold rounded-[var(--radius-sm)] hover:opacity-90 transition-colors shadow-sm"
          >
            <Icon name="edit" className="w-4 h-4" />
            {t('profile.editStoreInfo', { defaultValue: 'Modifier les informations du magasin' })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStoreInfo;
