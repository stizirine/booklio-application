import AppointmentCard from '@appointments/components/AppointmentCard';
import CreateEventModal from '@appointments/components/CreateEventModal';
import SocialShareModal from '@appointments/components/SocialShareModal';
import React, { useCallback, useMemo, useState } from 'react';
import { Icon } from '../assets/icons';
import { useSocialShare } from '../hooks/useSocialShare';
import type { AppointmentActionHandlers } from '../features/appointments/components/types';

/**
 * Composant de test pour valider la responsivité mobile
 */
const MobileResponsiveTest: React.FC = () => {
  const socialShare = useSocialShare();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Données de test
  const testAppointment = {
    id: 'test-1',
    title: 'Consultation médicale',
    start: new Date('2024-01-15T10:00:00'),
    end: new Date('2024-01-15T11:00:00'),
    status: 'scheduled' as const,
    customerName: 'Jean Dupont',
    clientEmail: 'jean.dupont@example.com',
    clientPhone: '+33 6 12 34 56 78',
    notes: {
      reason: 'Contrôle de routine',
      comment: 'Patient en bonne santé générale'
    }
  };

  const handleShare = useCallback(() => {
    socialShare.openShareModal(
      'Test de partage',
      'Ceci est un test de partage pour valider la responsivité mobile.',
      {
        enabledPlatforms: ['email', 'whatsapp', 'copy']
      }
    );
  }, [socialShare]);

  // Actions pour AppointmentCard (test)
  const testActions = useMemo<AppointmentActionHandlers>(() => ({
    viewDetails: () => {}, // No-op pour le test
    share: handleShare,
  }), [handleShare]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header de test */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Test de Responsivité Mobile
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Cette page teste tous les composants pour s'assurer qu'ils sont parfaitement responsive.
          </p>
        </div>

        {/* Test des cartes de rendez-vous */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Cartes de Rendez-vous
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AppointmentCard
              appointment={testAppointment}
              actions={testActions}
            />
            <AppointmentCard
              appointment={{
                ...testAppointment,
                id: 'test-2',
                title: 'Rendez-vous très long avec un titre qui peut déborder sur plusieurs lignes',
                status: 'in_progress' as const
              }}
              actions={testActions}
            />
            <AppointmentCard
              appointment={{
                ...testAppointment,
                id: 'test-3',
                title: 'RDV urgent',
                status: 'done' as const
              }}
              actions={testActions}
            />
          </div>
        </div>

        {/* Test des boutons d'action */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Boutons d'Action
          </h2>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Icon name="plus" size="sm" />
                Créer un RDV
              </button>
              <button
                onClick={handleShare}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Icon name="share" size="sm" />
                Partager
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Icon name="search" size="sm" />
                Rechercher
              </button>
            </div>
          </div>
        </div>

        {/* Test des formulaires */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Formulaires
          </h2>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="votre@email.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Votre message..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test des breakpoints */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Breakpoints Tailwind
          </h2>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {['Mobile', 'Tablet', 'Desktop', 'Large'].map((size, index) => (
                <div
                  key={size}
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 text-center"
                >
                  <div className="text-sm font-medium text-gray-700">{size}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {index === 0 && '< 640px'}
                    {index === 1 && '640px - 1024px'}
                    {index === 2 && '1024px - 1280px'}
                    {index === 3 && '> 1280px'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Instructions de Test
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Redimensionnez votre navigateur pour tester différents breakpoints</li>
            <li>• Testez sur un appareil mobile réel si possible</li>
            <li>• Vérifiez que tous les éléments sont lisibles et accessibles</li>
            <li>• Testez les interactions tactiles (boutons, formulaires)</li>
            <li>• Vérifiez que les modals s'ouvrent correctement sur mobile</li>
          </ul>
        </div>
      </div>

      {/* Modals de test */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={() => {}}
      />

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
  );
};

export default MobileResponsiveTest;
