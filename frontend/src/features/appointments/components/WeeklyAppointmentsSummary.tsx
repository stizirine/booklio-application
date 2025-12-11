import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import { createStatisticsConfig } from '@src/features/appointments/utils/statisticsConfig';
import { SimpleEvent } from '@src/types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentsList from './AppointmentsList';
import EmptyState from './EmptyState';
import StatisticsGrid from './StatisticsGrid';
import type { AppointmentActionHandlers } from './types';

interface WeeklyAppointmentsSummaryProps {
  appointments: SimpleEvent[];
  onViewDetails?: (appointment: SimpleEvent) => void;
  onShare?: (appointment: SimpleEvent) => void;
}

const WeeklyAppointmentsSummary: React.FC<WeeklyAppointmentsSummaryProps> = ({
  appointments,
  onViewDetails,
  onShare
}) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState<boolean>(true);

  // Configuration des statistiques
  const statisticsConfig = createStatisticsConfig(appointments);

  // Calculer la semaine actuelle
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
  endOfWeek.setHours(23, 59, 59, 999);
  
  const weekDateRange = `${startOfWeek.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })} - ${endOfWeek.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })}`;

  // Actions uniquement si on a besoin d'override (viewDetails/share)
  // Sinon, AppointmentsList utilisera le store automatiquement
  const actions = useMemo<AppointmentActionHandlers | undefined>(() => {
    if (!onViewDetails && !onShare) return undefined;
    return {
      viewDetails: onViewDetails,
      share: onShare,
    };
  }, [onViewDetails, onShare]);

  return (
    <div className="bg-[var(--color-card)] border-x-0 sm:border border-[var(--color-border)] rounded-none sm:rounded-[var(--radius-md)] p-0 sm:p-4 shadow-none sm:shadow-card h-full flex flex-col">
      {/* Header compact pour mobile */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-sm">
            <Icon name="calendar" className="text-white w-4 h-4 sm:w-5 sm:h-5" size="sm" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[var(--color-fg)]">
              {t('calendar.weeklySummary')}
            </h3>
            <p className="text-[10px] sm:text-xs text-[var(--color-muted)]">
              {weekDateRange}
            </p>
          </div>
        </div>

        {appointments.length > 0 && (
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="gradient"
            size="sm"
            className="w-7 h-7 sm:w-8 sm:h-8 !p-0 rounded-full justify-center"
            leftIcon={<Icon name="chevron-down" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} size="sm" />}
            aria-label={t('common.toggle') as string}
          />
        )}
      </div>

      {/* Statistiques compactes */}
      <div className="mb-2 sm:mb-3 px-3 sm:px-4 lg:px-6">
        <StatisticsGrid statisticsConfig={statisticsConfig} />
      </div>

      {appointments.length === 0 ? (
        <div className="px-3 sm:px-4 lg:px-6">
          <EmptyState
            subMessageKey="summary.noAppointmentsThisWeek"
          />
        </div>
      ) : (
        showDetails && (
          <div className="px-0 sm:px-4 lg:px-6">
            <AppointmentsList
              appointments={appointments}
              actions={actions}
            />
          </div>
        )
      )}
    </div>
  );
};

export default WeeklyAppointmentsSummary;
