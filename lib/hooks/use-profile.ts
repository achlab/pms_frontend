/**
 * Profile Management Hooks
 * React hooks for profile operations
 * Following SOLID principles and React best practices
 */

import { useState, useCallback } from "react";
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
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await profileService.getProfile();
      setData(profile);
      return profile;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to fetch profile";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await profileService.updateProfile(updates);
      setData(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchProfile,
    updateProfile,
    refetch: fetchProfile,
  };
}

/**
 * Hook for profile picture operations
 */
export function useProfilePicture() {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPicture = useCallback(async (file: File): Promise<ProfilePictureResponse> => {
    setUploading(true);
    setError(null);
    try {
      const result = await profileService.uploadProfilePicture(file);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to upload profile picture";
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const deletePicture = useCallback(async () => {
    setDeleting(true);
    setError(null);
    try {
      await profileService.deleteProfilePicture();
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to delete profile picture";
      setError(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    uploading,
    deleting,
    error,
    uploadPicture,
    deletePicture,
  };
}

/**
 * Hook for getting current user from storage (no API call)
 */
export function useCurrentUser() {
  const user = profileService.getCurrentUser();
  return user;
}

// Export aliases for backwards compatibility
export const useUploadProfilePicture = useProfilePicture;
export const useDeleteProfilePicture = useProfilePicture;

export default useProfile;
