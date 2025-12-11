import { Icon } from '@assets/icons';
import { AppointmentStatus, SimpleEvent } from '@src/types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentDetailsModal from './AppointmentDetailsModal';

interface MonthCalendarViewProps {
  events: SimpleEvent[];
  currentDate?: Date;
  onSelectEvent?: (event: SimpleEvent) => void;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void;
  onReschedule?: (appointment: SimpleEvent) => void;
  onShare?: (appointment: SimpleEvent) => void;
  loading?: boolean;
  onDateChange?: (date: Date) => void;
  onDateClick?: (date: Date) => void;
}

const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  events,
  currentDate = new Date(),
  onSelectEvent,
  onUpdateStatus,
  onReschedule,
  onShare,
  loading = false,
  onDateChange,
  onDateClick,
}) => {
  const { t } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<SimpleEvent | null>(null);
  const [displayDate, setDisplayDate] = useState<Date>(() => new Date(currentDate));
  const [isMobile, setIsMobile] = useState(false);

  // Synchroniser displayDate avec currentDate
  useEffect(() => {
    setDisplayDate(new Date(currentDate));
  }, [currentDate]);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Générer la grille du calendrier
  const calendarGrid = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    
    // Premier jour du mois et jour de la semaine (0 = dimanche, 1 = lundi, etc.)
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Convertir dimanche=0 en lundi=0
    
    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    
    const grid = [];
    
    // Jours du mois précédent
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPreviousMonth - i;
      const date = new Date(year, month - 1, day);
      grid.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0))
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.setHours(0, 0, 0, 0));
      
      grid.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        isPast
      });
    }
    
    // Jours du mois suivant pour compléter la grille (5 semaines = 35 jours maximum)
    const remainingDays = 35 - grid.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      grid.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0))
      });
    }
    
    return grid;
  }, [displayDate]);

  // Grouper les événements par date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: SimpleEvent[] } = {};
    
    events.forEach(event => {
      const eventDate = new Date(event.start);
      const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    // Trier les événements par statut puis par heure
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        const statusOrder: Record<string, number> = {
          [AppointmentStatus.InProgress]: 0,
          [AppointmentStatus.Scheduled]: 1,
          [AppointmentStatus.Rescheduled]: 1,
          [AppointmentStatus.Created]: 1,
          [AppointmentStatus.Done]: 2,
          [AppointmentStatus.Canceled]: 3,
        };
        
        const aStatus = String(a.status || '').toLowerCase();
        const bStatus = String(b.status || '').toLowerCase();
        const statusDiff = (statusOrder[aStatus] ?? 99) - (statusOrder[bStatus] ?? 99);
        
        if (statusDiff !== 0) return statusDiff;
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
    });
    
    return grouped;
  }, [events]);

  // Obtenir les événements pour une date donnée
  const getEventsForDate = (date: Date): SimpleEvent[] => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDate[dateKey] || [];
  };

  // Obtenir le nom du mois
  const monthName = displayDate.toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setDisplayDate(newDate);
    onDateChange?.(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setDisplayDate(newDate);
    onDateChange?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setDisplayDate(today);
    onDateChange?.(today);
  };

  const handleEventClick = (event: SimpleEvent) => {
    setSelectedEvent(event);
    onSelectEvent?.(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 shadow-card">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <div className="text-sm text-[var(--color-muted)]">{t('calendar.loadingAppointments')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 sm:p-6 overflow-x-auto shadow-card">
      {/* En-tête avec navigation responsive */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4">
        {/* Navigation mobile - boutons en haut */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1">
          {/* Bouton mois précédent */}
          <button
            onClick={goToPreviousMonth}
            className="p-2.5 sm:p-3 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] rounded-[var(--radius-md)] transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-card border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            disabled={loading}
            title="Mois précédent"
            aria-label="Mois précédent"
          >
            <Icon name="chevron-left" className="w-5 h-5" size="sm" />
          </button>
          
          {/* Mois et année centrés */}
          <div className="text-center flex-1 px-3 sm:px-4">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
              {monthName}
            </h3>
            <span className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">
              {t('calendar.appointmentsCount', { count: events.length })}
            </span>
          </div>
          
          {/* Bouton mois suivant */}
          <button
            onClick={goToNextMonth}
            className="p-2.5 sm:p-3 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] rounded-[var(--radius-md)] transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-card border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            disabled={loading}
            title="Mois suivant"
            aria-label="Mois suivant"
          >
            <Icon name="chevron-right" className="w-5 h-5" size="sm" />
          </button>
        </div>
        
        {/* Bouton Aujourd'hui - responsive */}
        <button
          onClick={goToToday}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:shadow-card rounded-[var(--radius-md)] transition-all duration-200 flex-shrink-0 w-full sm:w-auto shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          disabled={loading}
          title="Aujourd'hui"
        >
          <Icon name="calendar" className="w-4 h-4" size="sm" />
          Aujourd'hui
        </button>
      </div>

      {/* En-têtes des jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
        {[
          t('calendar.monday'),
          t('calendar.tuesday'),
          t('calendar.wednesday'),
          t('calendar.thursday'),
          t('calendar.friday'),
          t('calendar.saturday'),
          t('calendar.sunday')
        ].map((day, index) => (
          <div key={index} className="p-2 text-center text-xs sm:text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-[calc(var(--space)/2)]" style={{ gridTemplateRows: `repeat(${Math.ceil(calendarGrid.length / 7)}, minmax(80px, auto))` }}>
        {calendarGrid.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const maxVisibleEvents = isMobile ? 2 : 3; // Moins d'événements visibles sur mobile
          const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
          const remainingCount = dayEvents.length - maxVisibleEvents;

          const handleCellClick = (e: React.MouseEvent) => {
            // Ne pas déclencher si on clique sur un événement
            if ((e.target as HTMLElement).closest('[data-event]')) {
              return;
            }
            // Déclencher onDateClick avec la date de la cellule
            if (onDateClick && day.isCurrentMonth) {
              onDateClick(day.date);
            }
          };

          return (
            <div
              key={index}
              onClick={handleCellClick}
              className={`
                min-h-[70px] sm:min-h-[100px] lg:min-h-[120px] p-1.5 sm:p-2 border border-[var(--color-border)] rounded-[var(--radius-sm)]
                ${day.isCurrentMonth ? 'bg-[var(--color-card)]' : 'bg-[var(--color-bg)]'}
                ${day.isToday ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-surface)]' : ''}
                ${day.isPast && day.isCurrentMonth ? 'opacity-60' : ''}
                ${onDateClick && day.isCurrentMonth ? 'cursor-pointer hover:bg-[var(--color-surface)] transition-colors' : ''}
              `}
            >
              {/* Numéro du jour */}
              <div className={`
                text-xs sm:text-sm font-semibold mb-1
                ${day.isCurrentMonth ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)]'}
                ${day.isToday ? 'text-[var(--color-primary)] font-bold' : ''}
              `}>
                {day.day}
              </div>

              {/* Événements */}
              <div className="space-y-0.5 sm:space-y-1">
                {visibleEvents.map((event, eventIndex) => {
                  const statusStr = String(event.status || '').toLowerCase();
                  let statusBg = 'bg-[var(--color-surface)]';
                  let statusText = 'text-[var(--color-fg)]';
                  let statusBorder = 'border-[var(--color-border)]';
                  
                  if (statusStr === AppointmentStatus.InProgress?.toLowerCase()) {
                    statusBg = 'bg-[var(--color-primary)]/10';
                    statusText = 'text-[var(--color-primary)]';
                    statusBorder = 'border-[var(--color-primary)]/30';
                  } else if (statusStr === AppointmentStatus.Scheduled?.toLowerCase() || statusStr === AppointmentStatus.Created?.toLowerCase()) {
                    statusBg = 'bg-[var(--color-warning)]/10';
                    statusText = 'text-[var(--color-warning)]';
                    statusBorder = 'border-[var(--color-warning)]/30';
                  } else if (statusStr === AppointmentStatus.Done?.toLowerCase()) {
                    statusBg = 'bg-[var(--color-success)]/10';
                    statusText = 'text-[var(--color-success)]';
                    statusBorder = 'border-[var(--color-success)]/30';
                  } else if (statusStr === AppointmentStatus.Canceled?.toLowerCase()) {
                    statusBg = 'bg-[var(--color-danger)]/10';
                    statusText = 'text-[var(--color-danger)]';
                    statusBorder = 'border-[var(--color-danger)]/30';
                  }
                  
                  return (
                    <div
                      key={eventIndex}
                      data-event
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                      className={`
                        text-xs p-1 sm:p-1.5 rounded-[var(--radius-sm)] border cursor-pointer hover:shadow-sm transition-all
                        ${statusBg} ${statusText} ${statusBorder}
                      `}
                      title={`${event.title} - ${new Date(event.start).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}`}
                    >
                      <div className="truncate font-semibold text-xs">{event.title}</div>
                      <div className="text-xs opacity-75 hidden sm:block mt-0.5">
                        {new Date(event.start).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Indicateur pour les événements supplémentaires */}
                {remainingCount > 0 && (
                  <div className="text-xs text-[var(--color-muted)] font-semibold text-center py-0.5 sm:py-1 bg-[var(--color-surface)] rounded-[var(--radius-sm)]">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal des détails du rendez-vous */}
      {selectedEvent && (
        <AppointmentDetailsModal
          appointment={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={handleCloseModal}
          onUpdateStatus={onUpdateStatus}
          onReschedule={onReschedule}
          onShare={onShare}
        />
      )}
    </div>
  );
};

export default MonthCalendarView;