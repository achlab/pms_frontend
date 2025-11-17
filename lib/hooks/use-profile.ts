/**
 * useProfile Hook
 * Custom hook for profile management operations
 */

import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import profileService from "../services/profile.service";
import { authService } from "../services/auth.service";
import type { Profile, UpdateProfileRequest, ApiResponse } from "../api-types";

/**
 * Hook to fetch user profile
 */
export function useProfile(enabled: boolean = true) {
  return useApiQuery<ApiResponse<Profile>>(
    ["profile"],
    () => profileService.getProfile(),
    {
      enabled,
      onSuccess: (response) => {
        // Update stored user data when profile is fetched
        if (response.success && response.data) {
          authService.updateUserData(response.data);
        }
      },
    }
  );
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  return useApiMutation<ApiResponse<Profile>, UpdateProfileRequest>(
    async (data) => {
      return profileService.updateProfile(data);
    }
  );
}

/**
 * Hook to upload profile picture
 */
export function useUploadProfilePicture() {
  return useApiMutation<ApiResponse<{ profile_picture: string }>, File>(
    async (file) => {
      return profileService.uploadProfilePicture(file);
    }
  );
}

/**
 * Hook to delete profile picture
 */
export function useDeleteProfilePicture() {
  return useApiMutation<ApiResponse<null>, void>(async () => {
    return profileService.deleteProfilePicture();
  });
}

export default useProfile;

