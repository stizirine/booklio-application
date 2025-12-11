import { AppointmentStatus, SimpleEvent } from '@src/types';
import React from 'react';
import CalendarView from './CalendarView';

interface AppointmentsSectionProps {
  viewMode: 'day' | 'week' | 'month';
  events: SimpleEvent[];
  loading: boolean;
  onCreateClick: () => void;
  onEventClick?: (event: SimpleEvent) => void;
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  onDateChange: (date: Date) => void;
  onDateClick?: (date: Date) => void;
  onShareEvent?: (event: SimpleEvent) => void;
  onUpdateStatus?: (eventId: string, status: AppointmentStatus) => Promise<void>;
  onReschedule?: (event: SimpleEvent) => void;
  onViewDetails?: (event: SimpleEvent) => void;
  showSearch?: boolean;
  currentDate?: Date;
}

const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({
  viewMode,
  events,
  loading,
  onCreateClick,
  onEventClick,
  onViewModeChange,
  onDateChange,
  onDateClick,
  onShareEvent,
  onUpdateStatus,
  onReschedule,
  onViewDetails,
  showSearch = false,
  currentDate = new Date()
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <CalendarView
        mode={viewMode}
        events={events}
        loading={loading}
        onSelectEvent={onEventClick}
        onUpdateStatus={onUpdateStatus}
        onReschedule={onReschedule}
        onViewDetails={onViewDetails}
        onShare={onShareEvent}
        onDateChange={onDateChange}
        onDateClick={onDateClick}
        onViewModeChange={onViewModeChange}
        onCreateClick={onCreateClick}
        showSearch={showSearch}
        currentDate={currentDate}
      />
    </div>
  );
};

export default AppointmentsSection;