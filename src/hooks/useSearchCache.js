import { useState, useCallback, useRef, useEffect } from 'react';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const DEBOUNCE_DELAY = 300; // milliseconds

/**
 * Custom hook for search with caching and debouncing
 * @param {Function} searchFunction - Function to call for search
 * @returns {Object} Search state and functions
 */
export const useSearchCache = (searchFunction) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const cached = localStorage.getItem('recent_searches');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const cacheRef = useRef(new Map());
  const debounceTimerRef = useRef(null);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((query, results) => {
    setRecentSearches((prev) => {
      const updated = [
        { query, results, timestamp: Date.now() },
        ...prev.filter((item) => item.query !== query),
      ].slice(0, 10); // Keep only 10 recent searches

      try {
        localStorage.setItem('recent_searches', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }

      return updated;
    });
  }, []);

  // Get cached result if available and not expired
  const getCachedResult = useCallback((query) => {
    const cached = cacheRef.current.get(query);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > CACHE_TTL) {
      cacheRef.current.delete(query);
      return null;
    }

    return cached.data;
  }, []);

  // Set cached result
  const setCachedResult = useCallback((query, data) => {
    cacheRef.current.set(query, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  // Perform search
  const search = useCallback(
    async (query) => {
      if (!query || query.trim().length === 0) {
        setResults([]);
        setError(null);
        return;
      }

      // Check cache first
      const cached = getCachedResult(query);
      if (cached) {
        console.log('Using cached results for:', query);
        setResults(cached);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchFunction(query);
        setCachedResult(query, data);
        setResults(data);
        saveRecentSearch(query, data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchFunction, getCachedResult, setCachedResult, saveRecentSearch]
  );

  // Debounced search
  const debouncedSearch = useCallback(
    (query) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        search(query);
      }, DEBOUNCE_DELAY);
    },
    [search]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('recent_searches');
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    recentSearches,
    search,
    debouncedSearch,
    clearCache,
    clearRecentSearches,
  };
};

export default useSearchCache;
