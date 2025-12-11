import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentsHeaderProps {
  viewMode: 'day' | 'week' | 'month';
  loading: boolean;
  appointmentsCount: number;
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
  onCreateClick: () => void;
  onSearchToggle: () => void;
  showSearch: boolean;
}

const AppointmentsHeader: React.FC<AppointmentsHeaderProps> = ({
  viewMode,
  loading,
  appointmentsCount,
  onViewModeChange,
  onCreateClick,
  onSearchToggle,
  showSearch
}) => {
  const { t } = useTranslation();

  // Title is inferred directly from buttons; helper removed to avoid unused var warning

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 sm:p-5 shadow-card sticky top-0 z-20">
      <div className="flex flex-col gap-4">
        {/* Tabs de vue - style moderne */}
        <div className="flex bg-[var(--color-surface)] p-1 rounded-[var(--radius-md)] border border-[var(--color-border)] gap-1">
          {(['day', 'week', 'month'] as const).map((mode) => {
            const isActive = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-[var(--radius-sm)] transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-sm'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
                }`}
              >
                {t(`calendar.${mode}`)}
              </button>
            );
          })}
        </div>

        {/* Actions et compteur */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--color-muted)] bg-[var(--color-surface)] px-3 py-1.5 rounded-full">
              {loading ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('calendar.loadingAppointments')}
                </>
              ) : (
                <>
                  <Icon name="calendar" className="w-4 h-4" size="sm" />
                  {t('calendar.appointmentsCount', { count: appointmentsCount })}
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {viewMode !== 'month' && (
              <Button
                onClick={onSearchToggle}
                aria-label={t('search.showSearch')}
                size="sm"
                variant={showSearch ? 'primary' : 'secondary'}
                className="w-10 h-10 p-0"
                leftIcon={<Icon name="search" className="w-4 h-4" size="sm" />}
              />
            )}
            <Button 
              onClick={onCreateClick} 
              size="sm" 
              variant="gradient"
              className="shadow-card"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              <span className="hidden sm:inline">{t('appointment.createShort')}</span>
              <span className="sm:hidden">{t('appointment.create')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsHeader;
