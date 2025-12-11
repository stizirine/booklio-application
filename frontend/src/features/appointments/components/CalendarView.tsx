import { AppointmentStatus, CalendarViewModeEnum, SimpleEvent } from '@src/types';
import React, { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointmentSearch } from '../hooks/useAppointmentSearch';
import AppointmentSearchInterface from './AppointmentSearchInterface';
import AppointmentSearchResults from './AppointmentSearchResults';
import MonthCalendarView from './MonthCalendarView';
import type { AppointmentActionHandlers } from './types';

// Imports dynamiques pour éviter les dépendances circulaires
const DailyAppointmentsSummary = lazy(() => import('./DailyAppointmentsSummary'));
const WeeklyAppointmentsSummary = lazy(() => import('./WeeklyAppointmentsSummary'));

export type CalendarViewMode = 'day' | 'week' | 'month';

// SimpleEvent déplacé dans src/types/appointments.ts pour éviter les cycles d'import

interface CalendarViewProps {
  mode: 'day' | 'week' | 'month';
  events: SimpleEvent[];
  loading?: boolean;
  onSelectEvent?: (event: SimpleEvent) => void;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void;
  onReschedule?: (appointment: SimpleEvent) => void;
  onViewDetails?: (appointment: SimpleEvent) => void;
  onShare?: (appointment: SimpleEvent) => void;
  onDateChange?: (date: Date) => void;
  onDateClick?: (date: Date) => void;
  onViewModeChange?: (mode: 'day' | 'week' | 'month') => void; // accepted (forward compatibility)
  onCreateClick?: () => void; // accepted (forward compatibility)
  showSearch?: boolean;
  currentDate?: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  mode, 
  events, 
  loading = false,
  onSelectEvent, 
  onUpdateStatus, 
  onReschedule, 
  onViewDetails, 
  onShare,
  onDateChange,
  onDateClick,
  showSearch = false,
  currentDate = new Date()
}) => {
  const { t } = useTranslation();
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Utiliser useAppointmentSearch directement
  const {
    searchResults,
    searchFilters,
    setSearchFilters
  } = useAppointmentSearch(events);

  // Gérer le mode recherche
  React.useEffect(() => {
    const hasActiveSearch = Boolean(searchFilters.query || 
                           searchFilters.status !== 'all' || 
                           searchFilters.dateRange.from || 
                           searchFilters.dateRange.to || 
                           searchFilters.clientName);
    
    setIsSearchMode(showSearch && hasActiveSearch);
  }, [showSearch, searchFilters]);

  const handleSearchResults = useCallback((_results: SimpleEvent[]) => {
    // Cette fonction n'est plus utilisée car on utilise useAppointmentSearch directement
  }, []);

  const handleFiltersChange = useCallback((filters: any) => {
    setSearchFilters(filters);
  }, [setSearchFilters]);

  // Filtrer les événements selon le mode de vue
  const filteredEvents = React.useMemo(() => {
    if (mode === CalendarViewModeEnum.Day) {
      const today = new Date(currentDate);
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      return events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= startOfDay && eventDate <= endOfDay;
      });
    }
    return events;
  }, [events, mode, currentDate]);

  // Actions pour AppointmentSearchResults (si handlers personnalisés fournis)
  const searchActions = useMemo<AppointmentActionHandlers | undefined>(() => {
    if (!onUpdateStatus && !onReschedule && !onViewDetails && !onShare) {
      return undefined; // Utilise le store automatiquement
    }
    return {
      updateStatus: onUpdateStatus,
      reschedule: onReschedule,
      viewDetails: onViewDetails,
      share: onShare,
    };
  }, [onUpdateStatus, onReschedule, onViewDetails, onShare]);

  // Si c'est la vue mois, utiliser le composant MonthCalendarView
  if (mode === CalendarViewModeEnum.Month) {
    return (
      <MonthCalendarView
        events={events}
        currentDate={currentDate}
        loading={loading}
        onSelectEvent={onSelectEvent}
        onUpdateStatus={onUpdateStatus}
        onReschedule={onReschedule}
        onShare={onShare}
        onDateChange={onDateChange}
        onDateClick={onDateClick}
      />
    );
  }




  const LoadingFallback = () => (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
      <div className="text-sm text-[var(--color-muted)]">{t('calendar.loadingAppointments')}</div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Interface de recherche */}
      {showSearch && (
        <div className="mb-4 sm:mb-6">
          <AppointmentSearchInterface
            appointments={events}
            onResultsChange={handleSearchResults}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      )}

      {/* Contenu principal */}
      <div className="bg-[var(--color-card)] border-x-0 sm:border border-[var(--color-border)] rounded-none sm:rounded-[var(--radius-md)] p-0 sm:p-4 lg:p-6 shadow-none sm:shadow-card">
        {loading ? (
          <LoadingFallback />
        ) : isSearchMode ? (
          <AppointmentSearchResults
            searchResults={searchResults}
            actions={searchActions}
          />
        ) : mode === CalendarViewModeEnum.Week ? (
          <Suspense fallback={<LoadingFallback />}>
            <WeeklyAppointmentsSummary
              appointments={events}
              onViewDetails={onViewDetails}
              onShare={onShare}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            <DailyAppointmentsSummary
              appointments={filteredEvents}
              onViewDetails={onViewDetails}
              onShare={onShare}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default CalendarView;


