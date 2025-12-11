import VirtualizedList from '@components/VirtualizedList';
import { SimpleEvent } from '@src/types';
import React from 'react';
import AppointmentCard from './AppointmentCard';
import type { AppointmentActionHandlers } from './types';

interface AppointmentsListProps {
  appointments: SimpleEvent[];
  /**
   * Actions optionnelles pour override le store
   * Si non fournies, AppointmentCard utilise le store automatiquement
   */
  actions?: AppointmentActionHandlers;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  actions
}) => {
  // Le tri est géré côté backend, pas besoin de re-trier ici
  // Si actions est fourni, on le passe tel quel (override)
  // Sinon, AppointmentCard utilisera le store directement

  return (
    <VirtualizedList
      items={appointments}
      rowHeight={224}
      overscan={10}
      className="flex-1 min-h-0 max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-300px)]"
      renderRow={(appointment) => (
        <div className="px-0 sm:px-0 mb-2 sm:mb-3">
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            actions={actions}
          />
        </div>
      )}
    />
  );
};

export default AppointmentsList;
