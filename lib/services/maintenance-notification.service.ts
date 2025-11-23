/**
 * Maintenance Notification Service
 * Handles API calls for maintenance-related notifications
 * Based on Laravel notification system with Resend integration
 */

import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Notification, NotificationStats } from "@/lib/api-types";

class MaintenanceNotificationService {
  /**
   * Get all notifications for the current user (paginated)
   */
  async getNotifications(params?: {
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse<Notification[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    return apiClient.get(`/notifications?${searchParams.toString()}`);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<NotificationStats>> {
    return apiClient.get('/notifications/unread-count');
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return apiClient.patch(`/notifications/${notificationId}/mark-as-read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch('/notifications/mark-all-as-read');
  }

  /**
   * Delete a notification (if supported)
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/notifications/${notificationId}`);
  }
}

export const maintenanceNotificationService = new MaintenanceNotificationService();
