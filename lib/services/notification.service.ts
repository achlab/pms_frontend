/**
 * General Notification Service
 * Handles all types of notifications for all user roles (landlord, tenant, caretaker)
 */

import apiClient from "../api-client";
import { buildUrl } from "../api-utils";
import type { Notification, NotificationStats, PaginatedResponse } from "../api-types";

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Get notifications for current user
   */
  async getNotifications(params?: {
    per_page?: number;
    page?: number;
    type?: string;
  }): Promise<PaginatedResponse<Notification>> {
    const url = buildUrl("/notifications", params);
    return apiClient.get<PaginatedResponse<Notification>>(url);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ data: NotificationStats }> {
    return apiClient.get<{ data: NotificationStats }>("/notifications/unread-count");
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean }> {
    return apiClient.patch<{ success: boolean }>("/notifications/mark-all-read");
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/notifications/${notificationId}`);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
export default notificationService;