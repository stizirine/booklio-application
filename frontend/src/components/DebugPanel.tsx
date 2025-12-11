import { AppointmentStatus } from '@src/types';
import { useAppointmentStore } from '@stores/appointmentStore';
import React, { useState } from 'react';

const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [testAppointmentId, setTestAppointmentId] = useState('');
  const apptStore = useAppointmentStore();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testUpdateStatus = async () => {
    if (!testAppointmentId) {
      addLog('❌ Veuillez entrer un ID de rendez-vous');
      return;
    }

    try {
      addLog(`🔄 Test de mise à jour du statut pour l'ID: ${testAppointmentId}`);
      await apptStore.updateAppointmentStatus(testAppointmentId, AppointmentStatus.InProgress as any);
      addLog(`✅ Succès: statut mis à jour (optimistic)`);
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  const testReschedule = async () => {
    if (!testAppointmentId) {
      addLog('❌ Veuillez entrer un ID de rendez-vous');
      return;
    }

    try {
      addLog(`🔄 Test de report pour l'ID: ${testAppointmentId}`);
      const now = new Date();
      const startAt = new Date(now.getTime() + 60 * 60 * 1000);
      const endAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      await apptStore.rescheduleAppointment(testAppointmentId, startAt.toISOString(), endAt.toISOString());
      addLog(`✅ Succès: rendez-vous reporté (optimistic)`);
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  const testGetAppointments = async () => {
    try {
      addLog('🔄 Test de récupération des rendez-vous (store)');
      const now = new Date();
      const _from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const _to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await apptStore.fetchAppointments({ mode: 'week' });
      addLog(`✅ Succès: ${apptStore.appointments.length} rendez-vous chargés`);
      if (apptStore.appointments.length > 0) {
        setTestAppointmentId(apptStore.appointments[0]._id);
        addLog(`   Premier ID: ${apptStore.appointments[0]._id}`);
      }
    } catch (error: any) {
      addLog(`❌ Erreur: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">🔧 Panel de Debug - Endpoints</h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={testGetAppointments}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tester GET /appointments (store)
          </button>
          
          <button
            onClick={testUpdateStatus}
            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Tester PATCH status (store)
          </button>
          
          <button
            onClick={testReschedule}
            className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Tester PATCH reschedule (store)
          </button>
          
          <button
            onClick={clearLogs}
            className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Effacer logs
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID de rendez-vous pour les tests:
          </label>
          <input
            type="text"
            value={testAppointmentId}
            onChange={(e) => setTestAppointmentId(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Entrez un ID de rendez-vous"
          />
        </div>
        
        <div className="bg-gray-900 text-green-400 p-2 sm:p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Aucun log pour le moment...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
