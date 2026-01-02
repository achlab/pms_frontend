/**
 * Profile Management Hooks
 * React hooks for profile operations
 * Following SOLID principles and React best practices
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services";
import type {
  User,
  UpdateProfileRequest,
  ProfilePictureResponse,
} from "../api-types";

/**
 * Hook for fetching and managing user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: UpdateProfileRequest) => 
      profileService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Hook for uploading profile picture
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => profileService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Hook for deleting profile picture
 */
export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => profileService.deleteProfilePicture(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Hook for getting current user from storage (no API call)
 */
export function useCurrentUser() {
  const user = profileService.getCurrentUser();
  return user;
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => profileService.changePassword(data),
  });
}

export default useProfile;
