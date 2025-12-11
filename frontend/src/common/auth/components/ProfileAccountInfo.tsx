import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface ProfileAccountInfoProps {
  user: User;
  tenantId?: string;
  clientType?: string;
  capabilities?: string[];
}

const ProfileAccountInfo: React.FC<ProfileAccountInfoProps> = ({ 
  user, 
  tenantId, 
  clientType, 
  capabilities 
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[var(--color-card)] rounded-[var(--radius-md)] shadow-card border border-[var(--color-border)]">
      <div className="px-5 sm:px-6 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-lg font-semibold text-[var(--color-fg)]">
          {t('profile.accountInfo', { defaultValue: 'Informations du compte' })}
        </h3>
      </div>
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
            {t('profile.tenantId', { defaultValue: 'ID Tenant' })}
          </label>
          <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] font-mono">
            {tenantId || user.tenantId}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
            {t('profile.clientType', { defaultValue: 'Type de client' })}
          </label>
          <p className="text-sm text-[var(--color-fg)] bg-[var(--color-bg)] px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            {clientType || 'optician'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
            {t('profile.capabilities', { defaultValue: 'Capacités' })}
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {(capabilities || ['optics']).map((capability) => (
              <span
                key={capability}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--color-muted)] mb-1">
            {t('profile.roles', { defaultValue: 'Rôles' })}
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccountInfo;
