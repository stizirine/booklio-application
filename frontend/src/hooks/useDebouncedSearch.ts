import { useEffect, useRef } from 'react';

export function useDebouncedSearch(query: string, onSearch?: (q: string) => void, delayMs: number = 300) {
  const onSearchRef = useRef(onSearch);
  useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);
  useEffect(() => {
    if (!onSearchRef.current) return;
    const trimmed = (query || '').trim();
    const handler = setTimeout(() => {
      if (trimmed.length >= 2) {
        onSearchRef.current && onSearchRef.current(trimmed);
      }
      // Ne pas appeler onSearch('') pour éviter les boucles infinies
    }, delayMs);
    return () => clearTimeout(handler);
  }, [query, delayMs]);
}


