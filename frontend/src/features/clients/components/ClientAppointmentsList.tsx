import AppointmentDisplay from '@appointments/components/AppointmentDisplay';
import { Icon } from '@assets/icons';
import React from 'react';

interface ClientAppointmentsListProps {
  appointments: any[];
  onEdit: (appointment: any) => void;
  onDelete: (appointment: any) => void;
}

const ClientAppointmentsList: React.FC<ClientAppointmentsListProps> = ({ appointments, onEdit, onDelete }) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 border border-gray-200 flex flex-col min-h-0">
      <div className="mb-3 flex items-center gap-2 text-gray-900 font-semibold">
        <Icon name="calendar" className="w-4 h-4 text-gray-600" size="sm" />
        {appointments.length}
      </div>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <AppointmentDisplay appointment={appointment} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientAppointmentsList;
