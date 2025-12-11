import DevicePreview from '@components/DevicePreview';
import { useSocialShare } from '@hooks/useSocialShare';
import React from 'react';
import SocialShareModal from './SocialShareModal';

/**
 * Composant de démonstration pour tester différentes configurations de partage social
 */
const SocialShareDemo: React.FC = () => {
  const socialShare = useSocialShare();

  const handleBasicShare = () => {
    socialShare.openShareModal(
      'Rendez-vous de démonstration',
      'Voici un exemple de partage basique avec les plateformes par défaut.',
      {
        enabledPlatforms: ['email', 'whatsapp', 'copy']
      }
    );
  };

  const handleFullShare = () => {
    socialShare.openShareModal(
      'Partage complet',
      'Voici un exemple avec toutes les plateformes disponibles, y compris Instagram !',
      {
        enabledPlatforms: ['email', 'whatsapp', 'telegram', 'twitter', 'facebook', 'linkedin', 'instagram', 'copy']
      }
    );
  };

  const handleCustomShare = () => {
    socialShare.openShareModal(
      'Partage personnalisé',
      'Configuration personnalisée avec seulement les réseaux sociaux.',
      {
        enabledPlatforms: ['twitter', 'facebook', 'linkedin', 'instagram']
      }
    );
  };

  return (
    <DevicePreview>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Démonstration du partage social</h3>
        
        <div className="space-y-2">
          <button
            onClick={handleBasicShare}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Partage basique (Email, WhatsApp, Copier)
          </button>
          
          <button
            onClick={handleFullShare}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Partage complet (Toutes les plateformes)
          </button>
          
          <button
            onClick={handleCustomShare}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Partage personnalisé (Réseaux sociaux uniquement)
          </button>
        </div>

        {/* Modal de partage */}
        <SocialShareModal
          isOpen={socialShare.shareState.isOpen}
          onClose={socialShare.closeShareModal}
          title={socialShare.shareState.title}
          text={socialShare.shareState.text}
          url={socialShare.shareState.url}
          enabledPlatforms={socialShare.shareState.enabledPlatforms}
          customConfig={socialShare.shareState.customConfig}
        />
      </div>
    </DevicePreview>
  );
};

export default SocialShareDemo;
