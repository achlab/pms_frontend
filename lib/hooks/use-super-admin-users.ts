/**
 * Super Admin User Management Hooks
 * React hooks for user CRUD operations
 */

import { useState, useEffect, useCallback } from "react";
import { superAdminUserService } from "../services";
import type {
  SuperAdminUser,
  SuperAdminCreateUserRequest,
  SuperAdminUserQueryParams,
  UserRole,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

// ============================================
// USER QUERIES
// ============================================

/**
 * Hook to fetch all users with filtering
 */
export function useSuperAdminUsers(params?: SuperAdminUserQueryParams) {
  const [data, setData] = useState<PaginatedResponse<SuperAdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUserService.getAllUsers(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, refetch: fetchUsers };
}

/**
 * Hook to fetch a single user by ID
 */
export function useSuperAdminUser(userId: string | null) {
  const [data, setData] = useState<SuperAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminUserService.getUserDetails(userId);
        setData(response.data!);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { data, loading, error };
}

/**
 * Hook to fetch users by role
 */
export function useSuperAdminUsersByRole(role: UserRole) {
  const [data, setData] = useState<PaginatedResponse<SuperAdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsersByRole = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUserService.getUsersByRole(role);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users by role");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchUsersByRole();
  }, [fetchUsersByRole]);

  return { data, loading, error, refetch: fetchUsersByRole };
}

/**
 * Hook to fetch all landlords
 */
export function useSuperAdminLandlords() {
  const [data, setData] = useState<PaginatedResponse<SuperAdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLandlords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUserService.getAllLandlords();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch landlords");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLandlords();
  }, [fetchLandlords]);

  return { data, loading, error, refetch: fetchLandlords };
}

/**
 * Hook to fetch all caretakers
 */
export function useSuperAdminCaretakers(landlordId?: string) {
  const [data, setData] = useState<PaginatedResponse<SuperAdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaretakers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = landlordId
        ? await superAdminUserService.getCaretakersByLandlord(landlordId)
        : await superAdminUserService.getAllCaretakers();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch caretakers");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchCaretakers();
  }, [fetchCaretakers]);

  return { data, loading, error, refetch: fetchCaretakers };
}

/**
 * Hook to fetch all tenants
 */
export function useSuperAdminTenants(landlordId?: string) {
  const [data, setData] = useState<PaginatedResponse<SuperAdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = landlordId
        ? await superAdminUserService.getTenantsByLandlord(landlordId)
        : await superAdminUserService.getAllTenants();
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tenants");
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return { data, loading, error, refetch: fetchTenants };
}

// ============================================
// USER MUTATIONS
// ============================================

/**
 * Hook to create a new user
 */
export function useCreateSuperAdminUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: SuperAdminCreateUserRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUserService.createUser(userData);
      return response.data!;
    } catch (err: any) {
      setError(err.message || "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
}

/**
 * Hook to update a user
 */
export function useUpdateSuperAdminUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (userId: string, updates: Partial<SuperAdminUser>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminUserService.updateUser(userId, updates);
      return response.data!;
    } catch (err: any) {
      setError(err.message || "Failed to update user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
}

/**
 * Hook to delete a user
 */
export function useDeleteSuperAdminUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await superAdminUserService.deleteUser(userId);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error };
}

/**
 * Hook to disable a user
 */
export function useDisableSuperAdminUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await superAdminUserService.disableUser(userId);
    } catch (err: any) {
      setError(err.message || "Failed to disable user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { disableUser, loading, error };
}

/**
 * Hook to enable a user
 */
export function useEnableSuperAdminUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await superAdminUserService.enableUser(userId);
    } catch (err: any) {
      setError(err.message || "Failed to enable user");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { enableUser, loading, error };
}

// ============================================
// USER STATISTICS
// ============================================

/**
 * Hook to fetch user statistics
 */
export function useSuperAdminUserStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await superAdminUserService.getUserStatistics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return { data, loading, error };
}

