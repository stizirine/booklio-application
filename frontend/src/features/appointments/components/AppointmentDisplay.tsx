import { Icon } from '@assets/icons';
import { getStatusClasses, isCompletedStatus, normalizeStatus } from '@src/features/appointments/utils/statusUtils';
import { AppointmentStatus } from '@src/types';
import { AppointmentItem } from '@stores/appointmentStore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentActions from './AppointmentActions';

interface AppointmentDisplayProps {
  appointment: AppointmentItem;
  onEdit: (appointment: AppointmentItem) => void;
  onDelete: (appointment: AppointmentItem) => void;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void;
  onReschedule?: (appointment: AppointmentItem) => void;
  loading?: boolean;
}

const AppointmentDisplay: React.FC<AppointmentDisplayProps> = ({
  appointment,
  onEdit,
  onDelete,
  onUpdateStatus,
  onReschedule,
  loading = false
}) => {
  const { t } = useTranslation();


  const isCompleted = isCompletedStatus(normalizeStatus(appointment.status));

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${getStatusClasses(normalizeStatus(appointment.status)).dot}`}></div>
          <h5 className="text-sm font-semibold text-gray-900 truncate">
            {appointment.title || t('appointment.noTitle')}
          </h5>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <Icon name="clock" className="w-3 h-3" size="xs" />
            <span>{new Date(appointment.startAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="clock" className="w-3 h-3" size="xs" />
            <span>{new Date(appointment.endAt).toLocaleString()}</span>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(normalizeStatus(appointment.status)).badge}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${getStatusClasses(normalizeStatus(appointment.status)).badgeDot}`}></div>
          {t(`statuses.${String(normalizeStatus(appointment.status))}`)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Actions principales avec AppointmentActions */}
        {onUpdateStatus && (
          <AppointmentActions
            appointment={{
              id: appointment._id,
              title: appointment.title || '',
              start: new Date(appointment.startAt),
              end: new Date(appointment.endAt),
              status: appointment.status
            }}
            loading={loading}
            size="sm"
            onRequestStart={() => onUpdateStatus(appointment._id, AppointmentStatus.InProgress)}
            onRequestMarkDone={() => onUpdateStatus(appointment._id, AppointmentStatus.Done)}
            onRequestCancel={() => onUpdateStatus(appointment._id, AppointmentStatus.Canceled)}
            onRequestReschedule={() => onReschedule && onReschedule(appointment)}
          />
        )}
        
        {/* Actions secondaires */}
        <button
          className={`p-2 rounded-lg transition-all duration-200 shadow-sm border ${
            isCompleted
              ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-md border-gray-200 hover:border-indigo-200'
          }`}
          onClick={() => onEdit(appointment)}
          disabled={isCompleted}
          title={
            isCompleted
              ? t('appointment.cannotEditCompleted')
              : t('common.edit')
          }
        >
          <Icon name="edit" className="w-4 h-4" size="sm" />
        </button>
        <button
          className={`p-2 rounded-lg transition-all duration-200 shadow-sm border ${
            isCompleted
              ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50 hover:shadow-md border-gray-200 hover:border-red-200'
          }`}
          onClick={() => onDelete(appointment)}
          disabled={isCompleted}
          title={
            isCompleted
              ? t('appointment.cannotDeleteCompleted')
              : t('common.delete')
          }
        >
          <Icon name="trash" className="w-4 h-4" size="sm" />
        </button>
      </div>
    </div>
  );
};

export default AppointmentDisplay;
