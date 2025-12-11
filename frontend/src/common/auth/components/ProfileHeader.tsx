import Icon from '@assets/icons/Icon';
import { Button } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  onEditClick: () => void;
  onPasswordChangeClick: () => void;
  onStoreEditClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onEditClick,
  onPasswordChangeClick,
  onStoreEditClick
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 sm:p-5 shadow-card sticky top-0 sm:top-2 z-30">
      <div className="flex flex-col gap-4">
        {/* Titre et icône */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-sm">
            <Icon name="user" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-fg)]">
              {t('profile.title', { defaultValue: 'Profil utilisateur' })}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              {t('profile.description', { defaultValue: 'Gérez vos informations personnelles et paramètres de compte' })}
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onEditClick}
            variant="gradient"
            size="sm"
            className="shadow-card"
            leftIcon={<Icon name="edit" className="w-4 h-4" />}
          >
            {t('profile.editProfile', { defaultValue: 'Modifier le profil' })}
          </Button>
          
          <Button
            onClick={onPasswordChangeClick}
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="key" className="w-4 h-4" />}
          >
            {t('profile.changePassword', { defaultValue: 'Changer le mot de passe' })}
          </Button>
          
          <Button
            onClick={onStoreEditClick}
            variant="secondary"
            size="sm"
            className="border border-[var(--color-border)] text-[var(--color-success)]"
            leftIcon={<Icon name="building" className="w-4 h-4" />}
          >
            {t('profile.editStoreInfo', { defaultValue: 'Modifier le magasin' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
