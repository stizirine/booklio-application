import { AppointmentStatus } from '@src/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedSearch } from '../../../hooks/useDebouncedSearch';

export interface SearchFilters {
  query: string;
  status: AppointmentStatus | 'all';
  dateRange: {
    from: string | null;
    to: string | null;
  };
  clientName: string;
  tags: string[];
}

export interface SearchResult {
  appointment: any;
  score: number;
  matchedFields: string[];
  highlights: {
    [key: string]: string[];
  };
}

export interface UseAppointmentSearchReturn {
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  clearSearch: () => void;
  getSearchSuggestions: (query: string) => string[];
  searchStats: {
    totalResults: number;
    filteredByStatus: number;
    filteredByDate: number;
    filteredByClient: number;
  };
}

const defaultFilters: SearchFilters = {
  query: '',
  status: 'all',
  dateRange: {
    from: null,
    to: null,
  },
  clientName: '',
  tags: [],
};

// Fonction utilitaire pour normaliser les dates (enlever l'heure pour comparer seulement les dates)
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export function useAppointmentSearch(appointments: any[]): UseAppointmentSearchReturn {
  const [searchFilters, setSearchFiltersState] = useState<SearchFilters>(defaultFilters);
  const [isSearching, setIsSearching] = useState(false);

  const setSearchFilters = useCallback((filters: Partial<SearchFilters>) => {
    console.log('[useAppointmentSearch] setSearchFilters appelé avec:', filters);
    setSearchFiltersState(prev => {
      const newFilters = { ...prev, ...filters };
      console.log('[useAppointmentSearch] Nouveaux filtres:', newFilters);
      return newFilters;
    });
  }, []);

  // Gérer isSearching avec useEffect pour éviter les boucles
  useEffect(() => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setIsSearching(false);
    }, 150);
    
    return () => clearTimeout(timeoutId);
  }, [searchFilters]);

  // Debounced search pour optimiser les performances
  const debouncedSetQuery = useCallback((query: string) => {
    setSearchFiltersState(prev => ({ ...prev, query }));
  }, []);
  
  useDebouncedSearch(searchFilters.query, debouncedSetQuery, 300);

  const clearSearch = useCallback(() => {
    setSearchFiltersState(defaultFilters);
    setIsSearching(false);
  }, []);

  // Fonction de recherche intelligente avec scoring (memoized)
  const searchAppointments = useCallback((appointments: any[], filters: SearchFilters): SearchResult[] => {
    if (!filters.query && filters.status === 'all' && !filters.dateRange.from && !filters.dateRange.to && !filters.clientName) {
      return appointments.map(appointment => ({
        appointment,
        score: 1,
        matchedFields: [],
        highlights: {}
      }));
    }

    const results: SearchResult[] = [];

    for (const appointment of appointments) {
      let score = 0;
      const matchedFields: string[] = [];
      const highlights: { [key: string]: string[] } = {};

      // Recherche par texte (titre, description, notes)
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchableText = [
          appointment.summary || appointment.title || '',
          appointment.description || '',
          appointment.customerName || '',
          appointment.clientEmail || '',
          appointment.clientPhone || '',
          appointment.location || '',
          appointment.notes?.reason || '',
          appointment.notes?.comment || '',
        ].join(' ').toLowerCase();

        if (searchableText.includes(query)) {
          score += 10;
          matchedFields.push('text');
          
          // Créer des highlights
          const words = query.split(' ').filter(w => w.length > 2);
          words.forEach(word => {
            if ((appointment.summary || appointment.title)?.toLowerCase().includes(word)) {
              highlights.title = highlights.title || [];
              highlights.title.push(word);
            }
            if (appointment.customerName?.toLowerCase().includes(word)) {
              highlights.client = highlights.client || [];
              highlights.client.push(word);
            }
            if (appointment.notes?.reason?.toLowerCase().includes(word)) {
              highlights.notes = highlights.notes || [];
              highlights.notes.push(word);
            }
          });
        }

        // Bonus pour correspondance exacte
        if ((appointment.summary || appointment.title)?.toLowerCase() === query) {
          score += 20;
        }
      }

      // Filtrage par statut
      if (filters.status !== 'all') {
        if (appointment.status === filters.status) {
          score += 5;
          matchedFields.push('status');
        } else {
          continue; // Exclure si le statut ne correspond pas
        }
      }

      // Filtrage par nom de client
      if (filters.clientName) {
        const clientName = filters.clientName.toLowerCase();
        if (appointment.customerName?.toLowerCase().includes(clientName)) {
          score += 8;
          matchedFields.push('client');
        } else {
          continue; // Exclure si le client ne correspond pas
        }
      }

      // Filtrage par plage de dates
      if (filters.dateRange.from || filters.dateRange.to) {
        // Vérifier la structure des données
        console.log('[useAppointmentSearch] Structure appointment:', {
          id: appointment.id,
          summary: appointment.summary || appointment.title,
          title: appointment.title,
          start: appointment.start,
          startDateTime: appointment.start?.dateTime,
          startDate: appointment.start?.date,
          rawAppointment: appointment
        });

        // Gérer les deux formats : SimpleEvent (start: Date) et Event (start: {dateTime, date})
        let startDateTime;
        if (appointment.start instanceof Date) {
          // Format SimpleEvent
          startDateTime = appointment.start.toISOString();
        } else {
          // Format Event avec start.dateTime ou start.date
          startDateTime = appointment.start?.dateTime || appointment.start?.date;
        }

        if (!startDateTime) {
          console.log('[useAppointmentSearch] Pas de date de début, exclusion');
          continue;
        }

        const appointmentDate = normalizeDate(new Date(startDateTime));
        const fromDate = filters.dateRange.from ? normalizeDate(new Date(filters.dateRange.from)) : null;
        const toDate = filters.dateRange.to ? normalizeDate(new Date(filters.dateRange.to)) : null;

        console.log('[useAppointmentSearch] Filtrage par date:', {
          appointmentTitle: appointment.summary || appointment.title,
          appointmentDate: appointmentDate,
          fromDate: fromDate,
          toDate: toDate,
          dateRange: filters.dateRange
        });

        let dateMatches = true;
        if (fromDate && appointmentDate < fromDate) {
          console.log('[useAppointmentSearch] Date trop ancienne:', appointmentDate, '<', fromDate);
          dateMatches = false;
        }
        if (toDate && appointmentDate > toDate) {
          console.log('[useAppointmentSearch] Date trop récente:', appointmentDate, '>', toDate);
          dateMatches = false;
        }

        if (dateMatches) {
          console.log('[useAppointmentSearch] Date correspond:', appointmentDate);
          score += 3;
          matchedFields.push('date');
        } else {
          console.log('[useAppointmentSearch] Date ne correspond pas, exclusion');
          continue; // Exclure si la date ne correspond pas
        }
      }

      // Filtrage par tags (si implémenté plus tard)
      if (filters.tags.length > 0) {
        // Logique pour les tags à implémenter
        score += 2;
        matchedFields.push('tags');
      }

      if (score > 0) {
        results.push({
          appointment,
          score,
          matchedFields,
          highlights
        });
      }
    }

    // Trier par score décroissant
    return results.sort((a, b) => b.score - a.score);
  }, []);

  // Calcul des résultats de recherche (memoized)
  const searchResults = useMemo(() => {
    return searchAppointments(appointments, searchFilters);
  }, [appointments, searchFilters, searchAppointments]);

  // Statistiques de recherche
  const searchStats = useMemo(() => {
    const totalResults = searchResults.length;
    const filteredByStatus = searchFilters.status !== 'all' ? searchResults.length : 0;
    const filteredByDate = (searchFilters.dateRange.from || searchFilters.dateRange.to) ? searchResults.length : 0;
    const filteredByClient = searchFilters.clientName ? searchResults.length : 0;

    return {
      totalResults,
      filteredByStatus,
      filteredByDate,
      filteredByClient,
    };
  }, [searchResults, searchFilters]);

  // Suggestions de recherche (memoized)
  const getSearchSuggestions = useCallback((query: string): string[] => {
    if (query.length < 2) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    appointments.forEach(appointment => {
      // Suggestions basées sur le titre
      if ((appointment.summary || appointment.title)?.toLowerCase().includes(queryLower)) {
        suggestions.add(appointment.summary || appointment.title);
      }

      // Suggestions basées sur le nom du client
      if (appointment.customerName?.toLowerCase().includes(queryLower)) {
        suggestions.add(appointment.customerName);
      }

      // Suggestions basées sur l'email
      if (appointment.clientEmail?.toLowerCase().includes(queryLower)) {
        suggestions.add(appointment.clientEmail);
      }

      // Suggestions basées sur les notes
      if (appointment.notes?.reason?.toLowerCase().includes(queryLower)) {
        suggestions.add(appointment.notes.reason);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }, [appointments]);


  return {
    searchFilters,
    setSearchFilters,
    searchResults,
    isSearching,
    clearSearch,
    getSearchSuggestions,
    searchStats,
  };
}
