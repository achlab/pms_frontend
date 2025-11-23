/**
 * Maintenance Notifications Hooks
 * React Query hooks for maintenance notifications
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceNotificationService } from "@/lib/services/maintenance-notification.service";
import type { Notification, NotificationStats } from "@/lib/api-types";
import { toast } from "sonner";

/**
 * Hook to fetch maintenance notifications
 */
export function useMaintenanceNotifications(params?: {
  per_page?: number;
  page?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['maintenance-notifications', params],
    queryFn: () => maintenanceNotificationService.getNotifications(params),
    enabled: params?.enabled ?? true,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: ['maintenance-notifications-unread-count'],
    queryFn: () => maintenanceNotificationService.getUnreadCount(),
    enabled,
    refetchInterval: 15000, // More frequent updates for the bell badge
    staleTime: 5000,
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => 
      maintenanceNotificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['maintenance-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-notification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-notifications-unread-count'] });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => maintenanceNotificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['maintenance-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-notification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-notifications-unread-count'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => 
      maintenanceNotificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['maintenance-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-notification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-notifications-unread-count'] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    },
  });
}
