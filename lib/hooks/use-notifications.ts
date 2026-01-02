/**
 * General Notification Hooks
 * React Query hooks for all types of notifications (maintenance, invoices, payments, etc.)
 * Works for all user roles (landlord, tenant, caretaker)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/lib/services/notification.service";
import type { Notification, NotificationStats } from "@/lib/api-types";
import { toast } from "sonner";

/**
 * Hook to fetch notifications for current user
 */
export function useNotifications(params?: {
  per_page?: number;
  page?: number;
  type?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
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
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
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
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
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
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    },
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    },
  });
}