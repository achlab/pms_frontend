/**
 * Profile Service
 * Handles user profile management
 * Following Single Responsibility Principle
 */

import apiClient from "../api-client";
import type { Profile, UpdateProfileRequest, ApiResponse } from "../api-types";

class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Get current user's profile
   */
  async getProfile(): Promise<ApiResponse<Profile>> {
    return apiClient.get<ApiResponse<Profile>>("/profile");
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<Profile>> {
    return apiClient.put<ApiResponse<Profile>>("/profile", data);
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ profile_picture: string }>> {
    const formData = new FormData();
    formData.append("picture", file);

    return apiClient.postFormData<ApiResponse<{ profile_picture: string }>>(
      "/profile/picture",
      formData
    );
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>("/profile/picture");
  }
}

// Export singleton instance
export const profileService = ProfileService.getInstance();
export default profileService;

