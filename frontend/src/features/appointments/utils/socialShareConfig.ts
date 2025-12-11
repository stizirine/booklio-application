export interface SocialSharePlatform {
  id: string;
  name: string;
  iconName: string;
  color: string;
  enabled: boolean;
  action: (title: string, text: string, url?: string) => void;
}

export interface SocialShareConfig {
  platforms: SocialSharePlatform[];
  defaultEnabled: string[];
}

// Configuration par défaut de toutes les plateformes disponibles
export const createDefaultSocialShareConfig = (
  onClose: () => void,
  t: (key: string) => string
): SocialShareConfig => {
  const platforms: SocialSharePlatform[] = [
    {
      id: 'email',
      name: t('socialShare.email'),
      iconName: 'mail',
      color: 'bg-blue-500 hover:bg-blue-600',
      enabled: true,
      action: (title: string, text: string) => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(text);
        const emailUrl = `mailto:?subject=${subject}&body=${body}`;
        window.open(emailUrl, '_blank');
        onClose();
      }
    },
    {
      id: 'whatsapp',
      name: t('socialShare.whatsapp'),
      iconName: 'whatsapp',
      color: 'bg-green-500 hover:bg-green-600',
      enabled: true,
      action: (title: string, text: string) => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
      }
    },
    {
      id: 'telegram',
      name: t('socialShare.telegram'),
      iconName: 'telegram',
      color: 'bg-blue-400 hover:bg-blue-500',
      enabled: true,
      action: (title: string, text: string, url?: string) => {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url || '')}&text=${encodeURIComponent(text)}`;
        window.open(telegramUrl, '_blank');
        onClose();
      }
    },
    {
      id: 'twitter',
      name: t('socialShare.twitter'),
      iconName: 'twitter',
      color: 'bg-sky-400 hover:bg-sky-500',
      enabled: true,
      action: (title: string, text: string) => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
        onClose();
      }
    },
    {
      id: 'facebook',
      name: t('socialShare.facebook'),
      iconName: 'facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      enabled: true,
      action: (title: string, text: string, url?: string) => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || '')}&quote=${encodeURIComponent(text)}`;
        window.open(facebookUrl, '_blank');
        onClose();
      }
    },
    {
      id: 'linkedin',
      name: t('socialShare.linkedin'),
      iconName: 'linkedin',
      color: 'bg-blue-700 hover:bg-blue-800',
      enabled: true,
      action: (title: string, text: string, url?: string) => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || '')}&summary=${encodeURIComponent(text)}`;
        window.open(linkedinUrl, '_blank');
        onClose();
      }
    },
    {
      id: 'instagram',
      name: t('socialShare.instagram'),
      iconName: 'instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      enabled: false, // Désactivé par défaut car Instagram ne supporte pas le partage direct de texte
      action: (title: string, text: string) => {
        // Instagram ne permet pas le partage direct de texte via URL
        // On copie le texte dans le presse-papiers et on ouvre Instagram
        navigator.clipboard.writeText(text).then(() => {
          alert(t('socialShare.instagramCopied'));
          window.open('https://www.instagram.com/', '_blank');
        }).catch(() => {
          alert(t('socialShare.copyError'));
        });
        onClose();
      }
    },
    {
      id: 'copy',
      name: t('socialShare.copy'),
      iconName: 'clipboard',
      color: 'bg-gray-500 hover:bg-gray-600',
      enabled: true,
      action: async (title: string, text: string) => {
        try {
          await navigator.clipboard.writeText(text);
          alert(t('socialShare.copied'));
        } catch (err) {
          alert(t('socialShare.copyError'));
        }
        onClose();
      }
    }
  ];

  return {
    platforms,
    defaultEnabled: ['email', 'whatsapp', 'copy'] // Plateformes activées par défaut
  };
};

// Fonction pour créer une configuration personnalisée
export const createCustomSocialShareConfig = (
  enabledPlatforms: string[],
  onClose: () => void,
  t: (key: string) => string
): SocialShareConfig => {
  const defaultConfig = createDefaultSocialShareConfig(onClose, t);
  
  return {
    platforms: defaultConfig.platforms.map(platform => ({
      ...platform,
      enabled: enabledPlatforms.includes(platform.id)
    })),
    defaultEnabled: enabledPlatforms
  };
};
