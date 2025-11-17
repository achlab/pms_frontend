/**
 * useApiQuery Hook
 * Custom hook for API queries with loading and error states
 * Following React hooks best practices
 */

import { useState, useEffect, useCallback } from "react";

interface UseQueryOptions<TData> {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
}

interface UseQueryResult<TData> {
  data: TData | null;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
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
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const enabled = options?.enabled ?? true;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsFetching(true);

    try {
      const result = await queryFn();
      setData(result);
      setIsSuccess(true);
      setIsError(false);
      setError(null);

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
  }, [queryFn, enabled, options]);

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
    refetch: fetchData,
  };
}

export default useApiQuery;

