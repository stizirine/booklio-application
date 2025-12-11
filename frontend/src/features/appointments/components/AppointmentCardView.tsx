import { AppointmentStatus, SimpleEvent } from '@src/types';
import React from 'react';
import AppointmentCardActions from './AppointmentCardActions';
import AppointmentCardDetails from './AppointmentCardDetails';
import AppointmentCardHeader from './AppointmentCardHeader';
import AppointmentCardInfo from './AppointmentCardInfo';
import AppointmentCardStatusBar from './AppointmentCardStatusBar';
import type { AppointmentActionHandlers } from './types';

/**
 * Vue pure pour AppointmentCard (pattern container/view)
 * 
 * Cette vue reçoit `actions` qui provient de AppointmentCard (container).
 * Le container utilise le store (useAppointmentStore) comme source principale,
 * avec possibilité d'override via la prop `actions` optionnelle.
 * 
 * @see AppointmentCard pour la logique et l'intégration du store
 */
interface AppointmentCardViewProps {
  appointment: SimpleEvent;
  isExpanded: boolean;
  loading: boolean;
  onToggleExpanded: () => void;
  onCardClick: () => void;
  onCardKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onActionClick: (action: 'start' | 'cancel' | 'markDone', status?: AppointmentStatus) => void;
  onRescheduleClick: () => void;
  actions: AppointmentActionHandlers;
}

const AppointmentCardView: React.FC<AppointmentCardViewProps> = ({
  appointment,
  isExpanded,
  loading,
  onToggleExpanded,
  onCardClick,
  onCardKeyDown,
  onActionClick,
  onRescheduleClick,
  actions
}) => {
  return (
    <div
      className="bg-[var(--color-card)] border-x-0 sm:border border-[var(--color-border)] rounded-none sm:rounded-[var(--radius-md)] shadow-none sm:shadow-card hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer transform hover:-translate-y-0.5"
      onKeyDown={onCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <AppointmentCardStatusBar status={appointment.status} />
      <div className="p-4 sm:p-5">
        <AppointmentCardHeader
          appointment={appointment}
          isExpanded={isExpanded}
          onToggleExpanded={onToggleExpanded}
        />

        <div className="flex flex-col md:flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mt-3">
          <div className="flex-1 min-w-0" onClick={onCardClick}>
            <AppointmentCardInfo appointment={appointment} />
          </div>

          <div
            className="flex-shrink-0 md:border-t md:border-[var(--color-border)] md:pt-3 lg:border-0 lg:pt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-1.5 md:gap-2 lg:gap-3 justify-end">
              <AppointmentCardActions
                appointment={appointment}
                loading={loading}
                actions={actions}
                onActionClick={onActionClick}
                onRescheduleClick={onRescheduleClick}
              />
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <AppointmentCardDetails appointment={appointment} />
      )}
    </div>
  );
};

export default React.memo(AppointmentCardView);
