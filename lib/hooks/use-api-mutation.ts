/**
 * useApiMutation Hook
 * Custom hook for API mutations with loading and error states
 * Following React hooks best practices
 */

import { useState, useCallback } from "react";
import { getErrorMessage } from "../api-utils";

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: unknown;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

/**
 * Hook for handling API mutations (POST, PUT, DELETE)
 */
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsError(false);
    setIsSuccess(false);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        setIsSuccess(true);
        setIsLoading(false);

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);
        setIsError(true);
        setIsLoading(false);

        if (options?.onError) {
          options.onError(err);
        }

        throw err;
      } finally {
        if (options?.onSettled) {
          options.onSettled();
        }
      }
    },
    [mutationFn, options]
  );

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | undefined> => {
      try {
        return await mutateAsync(variables);
      } catch (err) {
        // Error is already handled in mutateAsync
        return undefined;
      }
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isLoading,
    isPending: isLoading, // Alias for isLoading
    isError,
    isSuccess,
    reset,
  };
}

export default useApiMutation;

