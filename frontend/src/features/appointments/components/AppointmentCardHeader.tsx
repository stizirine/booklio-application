import { Icon } from '@assets/icons';
import { getStatusClasses, normalizeStatus } from '@src/features/appointments/utils/statusUtils';
import { AppointmentStatus } from '@src/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentCardHeaderProps {
  appointment: {
    title: string;
    status?: AppointmentStatus | string;
  };
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const AppointmentCardHeader: React.FC<AppointmentCardHeaderProps> = ({
  appointment,
  isExpanded,
  onToggleExpanded
}) => {
  const { t } = useTranslation();

  const getStatusIcon = (status?: AppointmentStatus | string) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case AppointmentStatus.Created: return 'edit';
      case AppointmentStatus.Scheduled: return 'clock';
      case AppointmentStatus.InProgress: return 'cog';
      case AppointmentStatus.Done: return 'check-circle';
      case AppointmentStatus.Canceled: return 'x-circle';
      case AppointmentStatus.Rescheduled: return 'calendar';
      default: return 'calendar';
    }
  };

  const getStatusBadgeClass = (status?: AppointmentStatus | string) => {
    if (status && typeof status === 'string' && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      return getStatusClasses(normalizeStatus(status as AppointmentStatus)).badge;
    }
    return getStatusClasses(normalizeStatus(undefined)).badge;
  };

  const getStatusColorClasses = (status?: AppointmentStatus | string) => {
    const statusStr = String(status).toLowerCase();
    switch (statusStr) {
      case AppointmentStatus.InProgress: return 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]';
      case AppointmentStatus.Scheduled: return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
      case AppointmentStatus.Done: return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
      case AppointmentStatus.Canceled: return 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]';
      default: return 'bg-[var(--color-surface)] text-[var(--color-muted)]';
    }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Icône de statut */}
        <div className={`w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shadow-sm bg-gradient-to-br ${getStatusColorClasses(appointment.status)}`}>
          <Icon 
            name={getStatusIcon(appointment.status)} 
            className="w-5 h-5" 
            size="md" 
          />
        </div>
        
        {/* Titre et statut */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
          <h3
            className="text-base sm:text-lg font-bold text-[var(--color-fg)]"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {appointment.title}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusBadgeClass(appointment.status)}`}>
            {t(`statuses.${String(appointment.status)}`)}
          </span>
        </div>
      </div>
      
      {/* Bouton d'expansion - style moderne */}
      <button
        onClick={onToggleExpanded}
        className="w-9 h-9 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center shadow-sm hover:shadow-card transition-all duration-200 flex-shrink-0"
        aria-label={isExpanded ? t('common.collapse') : t('common.expand')}
      >
        <Icon 
          name="chevron-down" 
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          size="sm" 
        />
      </button>
    </div>
  );
};

export default AppointmentCardHeader;
