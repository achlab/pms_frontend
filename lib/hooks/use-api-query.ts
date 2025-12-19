/**
 * useApiQuery Hook
 * Custom hook for API queries with loading and error states
 * Following React hooks best practices
 */

import { useState, useEffect, useCallback } from "react";

// Simple in-memory cache
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const STALE_TIME = 30 * 1000; // 30 seconds - data considered stale after this

interface UseQueryOptions<TData> {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
  cacheTime?: number; // How long to keep data in cache
  staleTime?: number; // How long until data is considered stale
}

interface UseQueryResult<TData> {
  data: TData | null;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  isStale: boolean; // New: indicates if data is from cache and may be outdated
  refetch: () => Promise<void>;
}

/**
 * Hook for handling API queries (GET requests)
 */
export function useApiQuery<TData = any>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData>
): UseQueryResult<TData> {
  const cacheKey = JSON.stringify(queryKey);
  const cacheTime = options?.cacheTime ?? CACHE_TIME;
  const staleTime = options?.staleTime ?? STALE_TIME;

  const [data, setData] = useState<TData | null>(() => {
    // Try to get cached data on mount
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  });
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(() => {
    // If we have cached data, don't show loading state
    const cached = queryCache.get(cacheKey);
    return !(cached && Date.now() - cached.timestamp < cacheTime);
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isStale, setIsStale] = useState(() => {
    // Check if cached data is stale
    const cached = queryCache.get(cacheKey);
    if (cached) {
      return Date.now() - cached.timestamp > staleTime;
    }
    return false;
  });

  const enabled = options?.enabled ?? true;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    // Check if we have cached data that's still fresh
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < staleTime && !isFetching) {
      // Data is fresh, no need to refetch
      setData(cached.data);
      setIsSuccess(true);
      setIsStale(false);
      setIsLoading(false);
      return;
    }

    // If we have cached data but it's stale, mark it as stale
    if (cached) {
      setIsStale(true);
    }

    setIsFetching(true);

    try {
      const result = await queryFn();
      
      // Cache the fresh data
      queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      setData(result);
      setIsSuccess(true);
      setIsError(false);
      setError(null);
      setIsStale(false);

      if (options?.onSuccess) {
        options.onSuccess(result);
      }
    } catch (err) {
      setError(err);
      setIsError(true);
      setIsSuccess(false);

      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [queryFn, enabled, options, cacheKey, staleTime, isFetching]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, ...queryKey]);

  // Refetch on window focus
  useEffect(() => {
    if (!options?.refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (enabled && !isFetching) {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, isFetching, fetchData, options?.refetchOnWindowFocus]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isStale,
    refetch: fetchData,
  };
}

export default useApiQuery;

