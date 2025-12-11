import { Icon } from '@assets/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SearchHeaderProps {
  totalResults: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
  showAdvancedFilters: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  totalResults,
  hasActiveFilters,
  onClearFilters,
  onToggleAdvancedFilters,
  showAdvancedFilters
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4">
      {/* Header principal - mobile first */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon name="search" className="w-4 h-4 text-white" size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{t('search.title')}</h3>
            <p className="text-sm text-gray-500">
              {totalResults} {t('search.resultsFound')}
            </p>
          </div>
        </div>
        
        {/* Bouton filtres - mobile optimisé */}
        <button
          onClick={onToggleAdvancedFilters}
          className="px-3 py-2 text-sm font-semibold bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg transition-all duration-200 border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow-md flex items-center gap-1.5 flex-shrink-0"
        >
          <Icon name="adjustments" className="w-4 h-4" size="sm" />
          <span className="hidden sm:inline">
            {showAdvancedFilters ? t('search.hideFilters') : t('search.advancedFilters')}
          </span>
          <span className="sm:hidden">
            {showAdvancedFilters ? t('search.hide') : t('search.filters')}
          </span>
        </button>
      </div>

      {/* Actions secondaires - mobile optimisé */}
      <div className="flex items-center justify-between">
        {hasActiveFilters ? (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md flex items-center gap-1.5"
          >
            <Icon name="x" className="w-4 h-4" size="sm" />
            {t('search.clearFilters')}
          </button>
        ) : (
          <span className="text-sm text-gray-500 italic">
            {t('search.noActiveFilters')}
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;
