import { Icon } from '@assets/icons';
import { Button, Card } from '@components/ui';
import { SimpleEvent } from '@src/types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createStatisticsConfig } from '../utils/statisticsConfig';
import AppointmentsList from './AppointmentsList';
import EmptyState from './EmptyState';
import StatisticsGrid from './StatisticsGrid';
import type { AppointmentActionHandlers } from './types';

interface DailyAppointmentsSummaryProps {
  appointments: SimpleEvent[];
  onViewDetails?: (appointment: SimpleEvent) => void;
  onShare?: (appointment: SimpleEvent) => void;
}

const DailyAppointmentsSummary: React.FC<DailyAppointmentsSummaryProps> = ({
  appointments,
  onViewDetails,
  onShare
}) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(true);

  // Configuration des statistiques
  const statisticsConfig = createStatisticsConfig(appointments);
  
  const todayDate = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
    <Card className="h-full flex flex-col border-0 sm:border shadow-none sm:shadow">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-sm">
            <Icon name="chart-bar" className="text-white w-4 h-4 sm:w-5 sm:h-5" size="sm" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-[var(--color-fg)]">
              {t('calendar.dailySummary')}
            </h3>
            <p className="text-[10px] sm:text-xs text-[var(--color-muted)]">
              {todayDate}
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

      <div className="mb-2 sm:mb-3 px-3 sm:px-4 lg:px-6">
        <StatisticsGrid statisticsConfig={statisticsConfig} />
      </div>

      {appointments.length === 0 ? (
        <div className="px-3 sm:px-4 lg:px-6">
          <EmptyState subMessageKey="summary.noAppointmentsToday" />
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
    </Card>
  );
};

export default DailyAppointmentsSummary;
