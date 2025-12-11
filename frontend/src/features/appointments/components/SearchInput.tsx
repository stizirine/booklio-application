import { Icon } from '@assets/icons';
import { Button, Input } from '@components/ui';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  query: string;
  isSearching: boolean;
  onQueryChange: (query: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestions: (show: boolean) => void;
  onSelectedIndexChange: (index: number) => void;
  selectedSuggestionIndex: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  isSearching,
  onQueryChange,
  onSuggestionClick,
  suggestions,
  showSuggestions,
  onShowSuggestions,
  onSelectedIndexChange,
  selectedSuggestionIndex
}) => {
  const { t } = useTranslation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        onSelectedIndexChange(
          selectedSuggestionIndex < suggestions.length - 1 ? selectedSuggestionIndex + 1 : selectedSuggestionIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        onSelectedIndexChange(selectedSuggestionIndex > 0 ? selectedSuggestionIndex - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          onSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        onShowSuggestions(false);
        onSelectedIndexChange(-1);
        break;
    }
  };

  // Fermer les suggestions en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        onShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onShowSuggestions]);

  return (
    <div className="relative mb-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Icon name="search" className="h-4 w-4 text-gray-400" size="sm" />
          )}
        </div>
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && onShowSuggestions(true)}
        />
        {query && (
          <Button
            onClick={() => onQueryChange('')}
            variant="secondary"
            size="sm"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-0 shadow-none"
          >
            <Icon name="x" className="w-4 h-4 text-gray-400 hover:text-gray-600" size="sm" />
          </Button>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 ${
                index === selectedSuggestionIndex ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
