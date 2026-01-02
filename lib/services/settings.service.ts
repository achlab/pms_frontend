/**
 * Settings Service
 * Handles application settings management
 */

import apiClient from "../api-client";
import type { ApiResponse } from "../api-types";

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  maintenance_alerts: boolean;
  payment_reminders: boolean;
  lease_expiry_alerts: boolean;
  system_announcements: boolean;
}

export interface PreferenceSettings {
  language: string;
  timezone: string;
  date_format: string;
  currency: string;
  items_per_page: number;
}

export interface PrivacySettings {
  profile_visibility: string;
  show_email: boolean;
  show_phone: boolean;
}

export interface SystemSettings {
  maintenance_mode: boolean;
  allow_registration: boolean;
  require_email_verification: boolean;
  session_timeout: number;
  max_file_size: number;
  allowed_file_types: string[];
}

export interface SystemStatistics {
  total_users: number;
  total_properties: number;
  total_invoices: number;
  cache_size: string;
  database_size: string;
}

export interface Settings {
  notifications: NotificationSettings;
  preferences: PreferenceSettings;
  privacy: PrivacySettings;
  system?: SystemSettings;
  statistics?: SystemStatistics;
}

export interface UpdateSettingsRequest {
  notifications?: Partial<NotificationSettings>;
  preferences?: Partial<PreferenceSettings>;
  privacy?: Partial<PrivacySettings>;
  system?: Partial<SystemSettings>;
}

class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get current user settings
   */
  async getSettings(): Promise<Settings> {
    const response = await apiClient.get<ApiResponse<Settings>>("/settings");

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to fetch settings");
  }

  /**
   * Update settings
   */
  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const response = await apiClient.put<ApiResponse<Settings>>(
      "/settings",
      updates
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to update settings");
  }

  /**
   * Clear application cache (Super Admin only)
   */
  async clearCache(): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      "/settings/cache/clear"
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to clear cache");
    }
  }

  /**
   * Get system logs (Super Admin only)
   */
  async getLogs(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      "/settings/logs"
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || "Failed to fetch logs");
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance();
export default settingsService;

