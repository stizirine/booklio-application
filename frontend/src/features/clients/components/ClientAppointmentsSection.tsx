import AppointmentDisplay from '@appointments/components/AppointmentDisplay';
import Icon from '@assets/icons/Icon';
import { AppointmentItem } from '@stores/appointmentStore';
import React from 'react';

interface ClientAppointmentsSectionProps {
  appointments: AppointmentItem[];
  loading: boolean;
  onEdit: (appointment: AppointmentItem) => void;
  onDelete: (appointment: AppointmentItem) => void;
  onReschedule: (appointment: AppointmentItem) => void;
  t: (key: string, opts?: any) => string;
}

const ClientAppointmentsSection: React.FC<ClientAppointmentsSectionProps> = ({
  appointments,
  loading,
  onEdit,
  onDelete,
  onReschedule,
  t,
}) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      {appointments.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon name="calendar" className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
          <p className="text-sm sm:text-base text-gray-500">{t('calendar.noAppointments')}</p>
        </div>
      ) : (
        appointments.map((appointment: any) => (
          <div
            key={appointment._id}
            className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <AppointmentDisplay
              appointment={appointment}
              onEdit={onEdit}
              onDelete={onDelete}
              onReschedule={onReschedule}
              loading={loading}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default ClientAppointmentsSection;