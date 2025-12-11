import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import { AppointmentStatus } from '@src/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentActions from './AppointmentActions';
import type { AppointmentActionHandlers } from './types';

interface AppointmentCardActionsProps {
  appointment: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status?: AppointmentStatus | string;
  };
  loading: boolean;
  actions: AppointmentActionHandlers;
  onActionClick: (action: 'start' | 'cancel' | 'markDone', status?: AppointmentStatus) => void;
  onRescheduleClick: () => void;
}

const AppointmentCardActions: React.FC<AppointmentCardActionsProps> = ({
  appointment,
  loading,
  actions,
  onActionClick,
  onRescheduleClick
}) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const statusStr = String(appointment.status || '').toLowerCase();
  const isScheduled = statusStr === 'scheduled';
  const isRescheduled = statusStr === 'rescheduled';
  const isInProgress = statusStr === 'in_progress' || statusStr === 'in-progress' || statusStr === 'in progress';
  const isDone = statusStr === 'done';
  const isCanceled = statusStr === 'canceled' || statusStr === 'cancelled';
  const canReschedule = isScheduled || isRescheduled || isInProgress;
  const canStart = isScheduled || isRescheduled;

  return (
      <div className="flex flex-row flex-wrap gap-1.5 w-full justify-end items-start">
      {/* Actions principales - toujours visibles */}
            <div className="flex flex-row gap-1.5 flex-1 md:flex-initial justify-start md:justify-end md:flex">
        <AppointmentActions
          appointment={appointment}
          loading={loading}
          size="sm"
          onRequestStart={() => actions.updateStatus && onActionClick('start', AppointmentStatus.InProgress)}
          onRequestMarkDone={() => actions.updateStatus && onActionClick('markDone', AppointmentStatus.Done)}
          onRequestCancel={() => actions.updateStatus && onActionClick('cancel', AppointmentStatus.Canceled)}
          onRequestReschedule={() => onRescheduleClick()}
        />
      </div>
      
      {/* Actions secondaires - responsive */}
            <div className="flex flex-row gap-1.5 md:flex">
        <Button
          onClick={() => actions.viewDetails && actions.viewDetails(appointment)}
          className="flex-1 md:flex-none"
          size="sm"
          variant="secondary"
          disabled={loading || !actions.viewDetails}
          title={t('appointment.details')}
          leftIcon={<Icon name="eye" className="w-4 h-4" size="sm" />}
        >
          <span className="hidden lg:inline">{t('appointment.details')}</span>
        </Button>

        <Button
          onClick={() => actions.share && actions.share(appointment)}
          className="flex-1 md:flex-none"
          size="sm"
          variant="gradient"
          disabled={loading || !actions.share}
          title={t('appointment.share')}
          leftIcon={<Icon name="share" className="w-4 h-4" size="sm" />}
        >
          <span className="hidden lg:inline">{t('appointment.share')}</span>
        </Button>
      </div>

        {/* Menu burger – visible sur tablette (md), caché en mobile et desktop */}
        <div className="hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white hover:bg-indigo-50 hover:text-indigo-600"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="Menu"
          >
            <Icon name="menu" className="w-4 h-4" size="sm" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] shadow-sm z-10">
              <div className="py-1">
                {actions.viewDetails && (
                  <button
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                    onClick={() => { setMenuOpen(false); actions.viewDetails && actions.viewDetails(appointment); }}
                  >
                    <Icon name="eye" className="w-4 h-4" size="sm" />
                    {t('appointment.details')}
                  </button>
                )}
                {actions.share && (
                  <button
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                    onClick={() => { setMenuOpen(false); actions.share && actions.share(appointment); }}
                  >
                    <Icon name="share" className="w-4 h-4" size="sm" />
                    {t('appointment.share')}
                  </button>
                )}
                {/* Actions principales */}
                {canStart && (
                  <button
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                    onClick={() => { setMenuOpen(false); onActionClick('start', AppointmentStatus.InProgress); }}
                  >
                    <Icon name="play" className="w-4 h-4" size="sm" />
                    {t('common.start')}
                  </button>
                )}
                {isInProgress && (
                  <button
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-green-700 flex items-center gap-2"
                    onClick={() => { setMenuOpen(false); onActionClick('markDone', AppointmentStatus.Done); }}
                  >
                    <Icon name="check-circle" className="w-4 h-4" size="sm" />
                    {t('common.finish')}
                  </button>
                )}
                {!isCanceled && !isDone && (
                  <button
                    className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => { setMenuOpen(false); onActionClick('cancel', AppointmentStatus.Canceled); }}
                  >
                    <Icon name="x" className="w-4 h-4" size="sm" />
                    {t('common.cancel')}
                  </button>
                )}
                {canReschedule && (
                  <button
                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                    onClick={() => { setMenuOpen(false); onRescheduleClick(); }}
                  >
                    <Icon name="calendar" className="w-4 h-4" size="sm" />
                    {t('common.reschedule')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default AppointmentCardActions;
