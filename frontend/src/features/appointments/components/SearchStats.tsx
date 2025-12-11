import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SearchStatsProps {
  hasActiveFilters: boolean;
  searchStats: {
    totalResults: number;
    filteredByStatus: number;
    filteredByDate: number;
    filteredByClient: number;
  };
}

const SearchStats: React.FC<SearchStatsProps> = ({
  hasActiveFilters,
  searchStats
}) => {
  const { t } = useTranslation();

  if (!hasActiveFilters) return null;

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-blue-700">
        <Icon name="chart-bar" className="w-4 h-4" size="sm" />
        <span>
          {t('search.filteredResults', { 
            total: searchStats.totalResults,
            status: searchStats.filteredByStatus,
            date: searchStats.filteredByDate,
            client: searchStats.filteredByClient
          })}
        </span>
      </div>
    </div>
  );
};

export default SearchStats;
