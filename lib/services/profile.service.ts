/**
 * Profile Service
 * Handles all profile management operations
 * Following Single Responsibility Principle - separated from AuthenticationService
 */

import apiClient, { tokenManager } from "../api-client";
import type {
  User,
  UpdateProfileRequest,
  ProfilePictureResponse,
  ApiResponse,
} from "../api-types";

export interface LandlordProfile {
  id?: number;
  email?: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  photo_url?: string;
}

export interface CaretakerProfile {
  id?: number;
  email?: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  emergency_contact?: string;
  working_hours?: string;
  photo_url?: string;
}

export interface TenantProfile {
  id?: number;
  email?: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  photo_url?: string;
}

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
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/profile");
    
    if (response.success && response.data) {
      // Update stored user data
      tokenManager.setUserData(response.data);
      return response.data;
    }

    throw new Error("Failed to fetch profile");
  }

  /**
   * Update current user's profile
   * Only updates provided fields (partial update)
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>("/profile", data);
    
    if (response.success && response.data) {
      // Update stored user data
      tokenManager.setUserData(response.data);
      return response.data;
    }

    throw new Error(response.message || "Failed to update profile");
  }

  /**
   * Upload profile picture
   * Accepts File object and uploads as multipart/form-data
   */
  async uploadProfilePicture(file: File): Promise<ProfilePictureResponse> {
    const formData = new FormData();
    formData.append("profile_picture", file);

    const response = await apiClient.post<ApiResponse<ProfilePictureResponse>>(
      "/profile/picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.success && response.data) {
      // Update user data with new profile picture
      const currentUser = tokenManager.getUserData();
      if (currentUser) {
        tokenManager.setUserData({
          ...currentUser,
          profile_picture: response.data.profile_picture,
          profile_picture_url: response.data.profile_picture_url,
        });
      }
      return response.data;
    }

    throw new Error(response.message || "Failed to upload profile picture");
  }

  /**
   * Delete profile picture
   * Removes the current profile picture
   */
  async deleteProfilePicture(): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>("/profile/picture");

    if (response.success) {
      // Update user data to remove profile picture
      const currentUser = tokenManager.getUserData();
      if (currentUser) {
        tokenManager.setUserData({
          ...currentUser,
          profile_picture: null,
          profile_picture_url: null,
        });
      }
      return;
    }

    throw new Error(response.message || "Failed to delete profile picture");
  }

  /**
   * Get current user from storage (no API call)
   */
  getCurrentUser(): User | null {
    return tokenManager.getUserData();
  }

  /**
   * Update stored user data (useful after external updates)
   */
  updateStoredUser(user: User): void {
    tokenManager.setUserData(user);
  }

  /**
   * Get landlord profile
   */
  async getLandlordProfile(): Promise<ApiResponse<LandlordProfile>> {
    return apiClient.get<ApiResponse<LandlordProfile>>("/landlord/profile");
  }

  /**
   * Update landlord profile
   */
  async updateLandlordProfile(data: Partial<LandlordProfile>): Promise<ApiResponse<LandlordProfile>> {
    return apiClient.put<ApiResponse<LandlordProfile>>("/landlord/profile", data);
  }

  /**
   * Get caretaker profile
   */
  async getCaretakerProfile(): Promise<ApiResponse<CaretakerProfile>> {
    return apiClient.get<ApiResponse<CaretakerProfile>>("/caretaker/profile");
  }

  /**
   * Update caretaker profile
   */
  async updateCaretakerProfile(data: Partial<CaretakerProfile>): Promise<ApiResponse<CaretakerProfile>> {
    return apiClient.put<ApiResponse<CaretakerProfile>>("/caretaker/profile", data);
  }

  /**
   * Get tenant profile
   */
  async getTenantProfile(): Promise<ApiResponse<TenantProfile>> {
    return apiClient.get<ApiResponse<TenantProfile>>("/tenant/profile");
  }

  /**
   * Update tenant profile
   */
  async updateTenantProfile(data: Partial<TenantProfile>): Promise<ApiResponse<TenantProfile>> {
    return apiClient.put<ApiResponse<TenantProfile>>("/tenant/profile", data);
  }

  /**
   * Upload profile photo (for landlord/caretaker profiles)
   */
  async uploadProfilePhoto(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append("photo", file);

    return apiClient.post<ApiResponse<{ url: string }>>(
      "/profile/upload-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  /**
   * Change user password
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> {
    const response = await apiClient.put<ApiResponse<null>>("/profile/password", data);

    if (!response.success) {
      throw new Error(response.message || "Failed to change password");
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(password: string): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<{ verified: boolean }>>(
      "/profile/password/verify",
      { password }
    );

    if (response.success && response.data) {
      return response.data.verified;
    }

    return false;
  }
}

// Export singleton instance
export const profileService = ProfileService.getInstance();
export default profileService;
