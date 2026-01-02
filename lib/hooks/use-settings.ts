/**
 * Settings Management Hooks
 * React hooks for application settings
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";
import type { UpdateSettingsRequest } from "../services/settings.service";

/**
 * Hook for fetching settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for updating settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateSettingsRequest) =>
      settingsService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

/**
 * Hook for clearing cache (Super Admin only)
 */
export function useClearCache() {
  return useMutation({
    mutationFn: () => settingsService.clearCache(),
  });
}

/**
 * Hook for fetching system logs (Super Admin only)
 */
export function useSystemLogs() {
  return useQuery({
    queryKey: ["system-logs"],
    queryFn: () => settingsService.getLogs(),
    enabled: false, // Only fetch when explicitly requested
    staleTime: 0, // Always fetch fresh logs
  });
}

export default useSettings;

