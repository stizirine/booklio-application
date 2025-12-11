import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SocialShareConfig, createCustomSocialShareConfig, createDefaultSocialShareConfig } from '../features/appointments/utils/socialShareConfig';

export interface SocialShareState {
  isOpen: boolean;
  title: string;
  text: string;
  url?: string;
  enabledPlatforms?: string[];
  customConfig?: SocialShareConfig;
}

export function useSocialShare() {
  const { t } = useTranslation();
  
  const [shareState, setShareState] = useState<SocialShareState>({
    isOpen: false,
    title: '',
    text: '',
    url: undefined,
    enabledPlatforms: undefined,
    customConfig: undefined
  });

  const openShareModal = useCallback((
    title: string, 
    text: string, 
    options?: {
      url?: string;
      enabledPlatforms?: string[];
      customConfig?: SocialShareConfig;
    }
  ) => {
    setShareState({
      isOpen: true,
      title,
      text,
      url: options?.url,
      enabledPlatforms: options?.enabledPlatforms,
      customConfig: options?.customConfig
    });
  }, []);

  const closeShareModal = useCallback(() => {
    setShareState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Configuration par défaut pour les rendez-vous
  const defaultAppointmentConfig = useMemo(() => 
    createCustomSocialShareConfig(
      ['email', 'whatsapp', 'copy'], // Plateformes par défaut pour les RDV
      closeShareModal,
      t
    ), [closeShareModal, t]
  );

  // Configuration complète pour le partage général
  const fullSocialConfig = useMemo(() => 
    createDefaultSocialShareConfig(closeShareModal, t), 
    [closeShareModal, t]
  );

  return {
    shareState,
    openShareModal,
    closeShareModal,
    defaultAppointmentConfig,
    fullSocialConfig
  };
}
