import React, { useEffect, useState } from 'react';
import { SearchFilters, useAppointmentSearch } from '../hooks/useAppointmentSearch';
import AdvancedFilters from './AdvancedFilters';
import SearchHeader from './SearchHeader';
import SearchInput from './SearchInput';
import SearchStats from './SearchStats';

interface AppointmentSearchInterfaceProps {
  appointments: any[];
  onResultsChange: (results: any[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  className?: string;
}

const AppointmentSearchInterface: React.FC<AppointmentSearchInterfaceProps> = ({
  appointments,
  onResultsChange,
  onFiltersChange,
  className = '',
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const {
    searchFilters,
    setSearchFilters,
    searchResults,
    isSearching,
    clearSearch,
    getSearchSuggestions,
    searchStats,
  } = useAppointmentSearch(appointments);

  // Notifier les changements de résultats seulement s'il y a une recherche active
  useEffect(() => {
    const hasActiveSearch = searchFilters.query || 
                           searchFilters.status !== 'all' || 
                           searchFilters.dateRange.from || 
                           searchFilters.dateRange.to || 
                           searchFilters.clientName;
    
    if (hasActiveSearch) {
      onResultsChange(searchResults.map(result => result.appointment));
    } else {
      // Si pas de recherche active, envoyer un tableau vide pour revenir à l'affichage normal
      onResultsChange([]);
    }
  }, [searchResults, searchFilters]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: onResultsChange est intentionnellement exclu des dépendances pour éviter une boucle infinie

  // Notifier les changements de filtres
  useEffect(() => {
    onFiltersChange?.(searchFilters);
  }, [searchFilters, onFiltersChange]);

  const handleQueryChange = (query: string) => {
    setSearchFilters({ query });
    
    if (query.length >= 2) {
      const newSuggestions = getSearchSuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchFilters({ query: suggestion });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const hasActiveFilters = Boolean(
    searchFilters.query || 
    searchFilters.status !== 'all' || 
    searchFilters.dateRange.from || 
    searchFilters.dateRange.to || 
    searchFilters.clientName
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      <SearchHeader
        totalResults={searchStats.totalResults}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearSearch}
        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        showAdvancedFilters={showAdvancedFilters}
      />

      <SearchInput
        query={searchFilters.query}
        isSearching={isSearching}
        onQueryChange={handleQueryChange}
        onSuggestionClick={handleSuggestionClick}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onShowSuggestions={setShowSuggestions}
        onSelectedIndexChange={setSelectedSuggestionIndex}
        selectedSuggestionIndex={selectedSuggestionIndex}
      />

      {showAdvancedFilters && (
        <AdvancedFilters
          searchFilters={searchFilters}
          onFiltersChange={setSearchFilters}
        />
      )}

      <SearchStats
        hasActiveFilters={hasActiveFilters}
        searchStats={searchStats}
      />
    </div>
  );
};

export default AppointmentSearchInterface;
