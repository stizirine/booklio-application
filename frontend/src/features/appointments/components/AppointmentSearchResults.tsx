import { Icon } from '@assets/icons';
import { Badge, Card } from '@components/ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../hooks/useAppointmentSearch';
import AppointmentCard from './AppointmentCard';
import type { AppointmentActionHandlers } from './types';

interface AppointmentSearchResultsProps {
  searchResults: SearchResult[];
  /**
   * Actions optionnelles pour override le store
   * Si non fournies, AppointmentCard utilise le store automatiquement
   */
  actions?: AppointmentActionHandlers;
  className?: string;
}

// Fonctions utilitaires
const getRelevanceLevel = (score: number): 'veryRelevant' | 'relevant' | 'moderate' | 'low' => {
  if (score >= 20) return 'veryRelevant';
  if (score >= 15) return 'relevant';
  if (score >= 10) return 'moderate';
  return 'low';
};

const getRelevanceColor = (score: number): string => {
  if (score >= 20) return 'bg-green-500';
  if (score >= 15) return 'bg-yellow-500';
  if (score >= 10) return 'bg-orange-500';
  return 'bg-red-500';
};

// Composant pour le header d'un résultat de recherche
interface SearchResultHeaderProps {
  result: SearchResult;
}

const SearchResultHeader: React.FC<SearchResultHeaderProps> = ({ result }) => {
  const { t } = useTranslation();
  const relevanceLevel = getRelevanceLevel(result.score);
  const relevanceColor = getRelevanceColor(result.score);

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {/* Badge de score de pertinence */}
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {Math.round(result.score)}
          </div>
          <span className="text-xs text-gray-600 font-medium">{t('search.score')}</span>
        </div>
        
        {/* Champs correspondants */}
        {result.matchedFields.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{t('search.foundIn')}:</span>
            <div className="flex flex-wrap gap-1">
              {result.matchedFields.map((field) => (
                <Badge key={field} variant="info" size="sm">
                  {t(`search.matchedFields.${field}`)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Indicateur de pertinence visuel */}
      <div className="flex items-center gap-1">
        <div className={`w-3 h-3 rounded-full ${relevanceColor}`}></div>
        <span className="text-xs text-gray-500">{t(`search.${relevanceLevel}`)}</span>
      </div>
    </div>
  );
};

// Composant pour les highlights
interface SearchHighlightsProps {
  highlights: Record<string, string[]>;
}

const SearchHighlights: React.FC<SearchHighlightsProps> = ({ highlights }) => {
  const { t } = useTranslation();

  if (Object.keys(highlights).length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-yellow-800 text-xs">🔍</span>
        </div>
        <span className="text-sm font-semibold text-yellow-800">{t('search.highlights')}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(highlights).map(([field, words]) => (
          <div key={field} className="bg-white rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                {t(`search.highlightFields.${field}`)}
              </span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="flex flex-wrap gap-1">
              {words.map((word, wordIndex) => (
                <Badge 
                  key={wordIndex} 
                  variant="warning" 
                  size="sm"
                  className="border border-yellow-300"
                >
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant pour un résultat de recherche individuel
interface SearchResultItemProps {
  result: SearchResult;
  actions?: AppointmentActionHandlers;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, actions }) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm">
      <SearchResultHeader result={result} />
      <SearchHighlights highlights={result.highlights} />
      <AppointmentCard
        appointment={result.appointment}
        actions={actions}
      />
    </div>
  );
};

// Composant pour les statistiques de recherche
interface SearchStatisticsProps {
  searchResults: SearchResult[];
}

const SearchStatistics: React.FC<SearchStatisticsProps> = ({ searchResults }) => {
  const { t } = useTranslation();

  const statistics = useMemo(() => {
    const totalResults = searchResults.length;
    const averageScore = totalResults > 0
      ? Math.round(searchResults.reduce((acc, result) => acc + result.score, 0) / totalResults)
      : 0;
    const uniqueStatuses = new Set(searchResults.map(r => r.appointment.status)).size;

    return { totalResults, averageScore, uniqueStatuses };
  }, [searchResults]);

  return (
    <Card className="mt-8 bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{statistics.totalResults}</div>
          <div className="text-gray-500">{t('search.totalResults')}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{statistics.averageScore}</div>
          <div className="text-gray-500">{t('search.averageScore')}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{statistics.uniqueStatuses}</div>
          <div className="text-gray-500">{t('search.uniqueStatuses')}</div>
        </div>
      </div>
    </Card>
  );
};

// Composant Empty State
const EmptySearchResults: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon name="search" className="w-8 h-8 text-gray-400" size="lg" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('search.noResults')}</h3>
      <p className="text-gray-500">{t('search.tryDifferentKeywords')}</p>
    </div>
  );
};

// Composant principal
const AppointmentSearchResults: React.FC<AppointmentSearchResultsProps> = ({
  searchResults,
  actions,
  className = '',
}) => {
  const { t } = useTranslation();

  if (searchResults.length === 0) {
    return <div className={className}><EmptySearchResults /></div>;
  }

  return (
    <div className={className}>
      {/* En-tête des résultats */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('search.searchResults')} ({searchResults.length})
          </h2>
          <div className="text-sm text-gray-500">
            {t('search.sortedByRelevance')}
          </div>
        </div>
      </div>

      {/* Liste des résultats */}
      <div className="space-y-4">
        {searchResults.map((result) => (
          <SearchResultItem
            key={result.appointment.id}
            result={result}
            actions={actions}
          />
        ))}
      </div>

      {/* Statistiques de recherche */}
      <SearchStatistics searchResults={searchResults} />
    </div>
  );
};

export default AppointmentSearchResults;
