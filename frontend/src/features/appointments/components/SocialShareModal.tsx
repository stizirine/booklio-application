import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SocialShareConfig, createCustomSocialShareConfig, createDefaultSocialShareConfig } from '../utils/socialShareConfig';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  url?: string;
  enabledPlatforms?: string[]; // Plateformes à afficher (optionnel)
  customConfig?: SocialShareConfig; // Configuration personnalisée (optionnel)
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
  url,
  enabledPlatforms,
  customConfig
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Déterminer la configuration à utiliser
  const config = customConfig || 
    (enabledPlatforms ? createCustomSocialShareConfig(enabledPlatforms, onClose, t) : createDefaultSocialShareConfig(onClose, t));

  // Filtrer les plateformes activées
  const shareOptions = config.platforms.filter(platform => platform.enabled);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 pb-20 sm:pb-6">
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 sm:p-6 max-w-md w-full mx-4 shadow-card max-h-[calc(100vh-5rem)] sm:max-h-[90vh] flex flex-col">
        {/* Header fixe */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--color-fg)]">{t('socialShare.title')}</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors p-2 rounded-full hover:bg-[var(--color-surface)]"
            aria-label={t('common.close')}
          >
            <Icon name="x" className="w-5 h-5" size="md" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Content Preview */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[var(--color-surface)] rounded-[var(--radius-md)]">
            <h4 className="font-semibold text-[var(--color-fg)] mb-2 text-sm sm:text-base">{title}</h4>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] whitespace-pre-wrap">{text}</p>
          </div>

          {/* Share Options Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => option.action(title, text, url)}
                className={`${option.color} text-white p-3 sm:p-4 rounded-lg sm:rounded-xl font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex flex-col items-center gap-2`}
              >
                <Icon name={option.iconName} size="lg" className="text-white" />
                <span className="text-xs sm:text-sm">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer fixe */}
        <div className="text-center flex-shrink-0 border-t border-[var(--color-border)] pt-4">
          <p className="text-xs text-[var(--color-muted)]">
            {t('socialShare.description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
