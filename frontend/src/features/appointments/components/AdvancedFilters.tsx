import { Button, Field, Input } from '@components/ui';
import { AppointmentStatus } from '@src/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AdvancedFiltersProps {
  searchFilters: {
    status: string;
    clientName: string;
    dateRange: {
      from: string | null;
      to: string | null;
    };
  };
  onFiltersChange: (filters: any) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  searchFilters,
  onFiltersChange
}) => {
  const { t } = useTranslation();

  const statusOptions = [
    { value: 'all', label: t('search.allStatuses'), color: 'gray' },
    { value: AppointmentStatus.Created, label: t('statuses.created'), color: 'blue' },
    { value: AppointmentStatus.Scheduled, label: t('statuses.scheduled'), color: 'yellow' },
    { value: AppointmentStatus.InProgress, label: t('statuses.in_progress'), color: 'blue' },
    { value: AppointmentStatus.Done, label: t('statuses.done'), color: 'green' },
    { value: AppointmentStatus.Canceled, label: t('statuses.canceled'), color: 'red' },
    { value: AppointmentStatus.Rescheduled, label: t('statuses.rescheduled'), color: 'orange' },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
      {/* Filtres par statut - mobile optimisé */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('search.filterByStatus')}
        </label>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => onFiltersChange({ status: option.value })}
              size="sm"
              variant={searchFilters.status === option.value ? 'gradient' : 'secondary'}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filtre par nom de client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('search.filterByClient')}
        </label>
        <Field label="" htmlFor="adv-client">
          <Input
            id="adv-client"
            type="text"
            placeholder={t('search.clientNamePlaceholder') as string}
            value={searchFilters.clientName}
            onChange={(e) => onFiltersChange({ clientName: e.target.value })}
          />
        </Field>
      </div>

      {/* Filtres par date - mobile optimisé */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('search.fromDate')}
          </label>
          <Input
            type="date"
            value={searchFilters.dateRange.from || ''}
            onChange={(e) => onFiltersChange({ dateRange: { ...searchFilters.dateRange, from: (e.target as HTMLInputElement).value || null } })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('search.toDate')}
          </label>
          <Input
            type="date"
            value={searchFilters.dateRange.to || ''}
            onChange={(e) => onFiltersChange({ dateRange: { ...searchFilters.dateRange, to: (e.target as HTMLInputElement).value || null } })}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
