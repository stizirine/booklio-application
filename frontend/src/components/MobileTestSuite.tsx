import CreateEventModal from '@appointments/components/CreateEventModal';
import RescheduleModal from '@appointments/components/RescheduleModal';
import SocialShareDemo from '@appointments/components/SocialShareDemo';
import React, { useState } from 'react';
import { Icon } from '../assets/icons';
import { AppointmentStatus } from '../types';
import DevicePreview from './DevicePreview';

/**
 * Suite de tests mobile complète pour tester tous les composants
 */
const MobileTestSuite: React.FC = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  const mockAppointment = {
    id: 'test-1',
    title: 'Consultation de test',
    start: new Date(),
    end: new Date(Date.now() + 30 * 60 * 1000),
    status: AppointmentStatus.Scheduled,
    client: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '0123456789'
    }
  };

  const tests = [
    {
      id: 'social-share',
      name: 'Partage Social',
      description: 'Tester le système de partage social',
      icon: 'share',
      color: 'bg-blue-500'
    },
    {
      id: 'create-modal',
      name: 'Création RDV',
      description: 'Tester la modal de création de rendez-vous',
      icon: 'plus',
      color: 'bg-green-500'
    },
    {
      id: 'reschedule-modal',
      name: 'Reprogrammation',
      description: 'Tester la modal de reprogrammation',
      icon: 'calendar',
      color: 'bg-orange-500'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Tester la vue dashboard complète',
      icon: 'cog',
      color: 'bg-purple-500'
    }
  ];

  const renderTestContent = () => {
    switch (activeTest) {
      case 'social-share':
        return <SocialShareDemo />;
      
      case 'create-modal':
        return (
          <div className="p-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Modal de Création</h3>
              <p className="text-sm text-gray-600">Cliquez sur le bouton pour ouvrir la modal</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Icon name="plus" className="w-5 h-5" size="sm" />
              Créer un rendez-vous
            </button>
          </div>
        );
      
      case 'reschedule-modal':
        return (
          <div className="p-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Modal de Reprogrammation</h3>
              <p className="text-sm text-gray-600">Cliquez sur le bouton pour ouvrir la modal</p>
            </div>
            <button
              onClick={() => setRescheduleModalOpen(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Icon name="calendar" className="w-5 h-5" size="sm" />
              Reprogrammer le RDV
            </button>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dashboard Mobile</h3>
            
            {/* Header simulé */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg">
              <h2 className="text-xl font-bold">Booklio</h2>
              <p className="text-sm opacity-90">Gestion des rendez-vous</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg shadow border">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-xs text-gray-600">RDV aujourd'hui</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow border">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-xs text-gray-600">En cours</div>
              </div>
            </div>

            {/* Liste des RDV simulée */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Rendez-vous du jour</h4>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">RDV {i}</div>
                      <div className="text-sm text-gray-600">09:00 - 09:30</div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Planifié
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6 text-center">
            <Icon name="cog" className="w-16 h-16 text-gray-400 mx-auto mb-4" size="xl" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Suite de Tests Mobile</h3>
            <p className="text-gray-600 mb-6">Sélectionnez un test pour commencer</p>
            
            <div className="grid grid-cols-2 gap-3">
              {tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => setActiveTest(test.id)}
                  className={`${test.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <Icon name={test.icon} className="w-6 h-6 mx-auto mb-2" size="lg" />
                  <div className="text-sm font-medium">{test.name}</div>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <DevicePreview>
      <div className="h-full flex flex-col">
        {/* Navigation */}
        {activeTest && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTest(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="arrow-left" className="w-4 h-4" size="sm" />
              Retour
            </button>
            <h3 className="font-semibold text-gray-900">
              {tests.find(t => t.id === activeTest)?.name}
            </h3>
            <div className="w-8"></div> {/* Spacer */}
          </div>
        )}

        {/* Contenu du test */}
        <div className="flex-1 overflow-auto">
          {renderTestContent()}
        </div>
      </div>

      {/* Modals de test */}
      <CreateEventModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={() => {
          console.log('RDV créé !');
          setCreateModalOpen(false);
        }}
        clients={[]}
      />

      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onConfirm={() => {
          console.log('RDV reprogrammé !');
          setRescheduleModalOpen(false);
        }}
        appointment={mockAppointment}
        loading={false}
      />
    </DevicePreview>
  );
};

export default MobileTestSuite;
