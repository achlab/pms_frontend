/**
 * Landlord User Hooks
 * React hooks for user management (caretakers & tenants) with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import { landlordUserService, type UserQueryParams } from "../services/landlord-user.service";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  AvailableTenant,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch all users with loading state
 * 
 * @param params - Query parameters for filtering
 * @returns Users data, loading state, and error
 */
export function useLandlordUsers(params?: UserQueryParams) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUserService.getUsers(params);
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
 * 
 * @param userId - UUID of the user
 * @returns User data, loading state, and error
 */
export function useLandlordUser(userId: string) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUserService.getUser(userId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [fetchUser, userId]);

  return { data, loading, error, refetch: fetchUser };
}

/**
 * Hook to fetch all caretakers
 * 
 * @param params - Additional query parameters
 * @returns Caretakers data
 */
export function useCaretakers(params?: UserQueryParams) {
  return useLandlordUsers({ ...params, role: "caretaker" });
}

/**
 * Hook to fetch active caretakers
 * 
 * @param params - Additional query parameters
 * @returns Active caretakers data
 */
export function useActiveCaretakers(params?: UserQueryParams) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.getActiveCaretakers(params);
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch caretakers");
      } finally {
        setLoading(false);
      }
    };

    fetchCaretakers();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch available caretakers
 * 
 * @returns Available caretakers
 */
export function useAvailableCaretakers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailable = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.getAvailableCaretakers();
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch available caretakers");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailable();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch all tenants
 * 
 * @param params - Additional query parameters
 * @returns Tenants data
 */
export function useTenants(params?: UserQueryParams) {
  return useLandlordUsers({ ...params, role: "tenant" });
}

/**
 * Hook to fetch active tenants
 * 
 * @param params - Additional query parameters
 * @returns Active tenants data
 */
export function useActiveTenants(params?: UserQueryParams) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.getActiveTenants(params);
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tenants");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [params]);

  return { data, loading, error };
}

/**
 * Hook to fetch unassigned tenants
 * 
 * @returns Unassigned tenants
 */
export function useUnassignedTenants() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnassigned = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.getUnassignedTenants();
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch unassigned tenants");
      } finally {
        setLoading(false);
      }
    };

    fetchUnassigned();
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch user statistics
 * 
 * @returns User statistics
 */
export function useUserStatistics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.getStatistics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { data, loading, error };
}

// ============================================
// MUTATION HOOKS (Data Modification)
// ============================================

/**
 * Hook to create a new user (generic)
 * 
 * @returns Create function, loading state, and error
 */
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(
    async (data: CreateUserRequest): Promise<{ user: User; token: string } | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.createUser(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to create user");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createUser, loading, error };
}

/**
 * Hook to create a caretaker
 * 
 * @returns Create function, loading state, and error
 */
export function useCreateCaretaker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCaretaker = useCallback(
    async (
      data: Omit<CreateUserRequest, "role">
    ): Promise<{ user: User; token: string } | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.createCaretaker(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to create caretaker");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createCaretaker, loading, error };
}

/**
 * Hook for getting available tenants for assignment
 */
export function useAvailableTenants() {
  const [data, setData] = useState<AvailableTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUserService.getAvailableTenants();
      setData(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch available tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableTenants();
  }, [fetchAvailableTenants]);

  return { data, loading, error, refetch: fetchAvailableTenants };
}

/**
 * Hook to create a tenant
 * 
 * @returns Create function, loading state, and error
 */
export function useCreateTenant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTenant = useCallback(
    async (
      data: Omit<CreateUserRequest, "role">
    ): Promise<{ user: User; token: string } | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.createTenant(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to create tenant");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createTenant, loading, error };
}

/**
 * Hook to update a user
 * 
 * @returns Update function, loading state, and error
 */
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(
    async (userId: string, data: UpdateUserRequest): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUserService.updateUser(userId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to update user");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateUser, loading, error };
}

/**
 * Hook to delete a user
 * 
 * @returns Delete function, loading state, and error
 */
export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordUserService.deleteUser(userId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteUser, loading, error };
}

/**
 * Hook to disable a user
 * 
 * @returns Disable function, loading state, and error
 */
export function useDisableUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableUser = useCallback(async (userId: string): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUserService.disableUser(userId);
      return response.data!;
    } catch (err: any) {
      setError(err.message || "Failed to disable user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { disableUser, loading, error };
}

/**
 * Hook to enable a user
 * 
 * @returns Enable function, loading state, and error
 */
export function useEnableUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableUser = useCallback(async (userId: string): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUserService.enableUser(userId);
      return response.data!;
    } catch (err: any) {
      setError(err.message || "Failed to enable user");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { enableUser, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get user summary
 * 
 * @param userId - UUID of the user
 * @returns User summary
 */
export function useUserSummary(userId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await landlordUserService.getUserSummary(userId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user summary");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSummary();
    }
  }, [userId]);

  return { data, loading, error };
}

/**
 * Hook to check if user is a caretaker
 * 
 * @param userId - UUID of the user
 * @returns Caretaker status
 */
export function useIsCaretaker(userId: string) {
  const [isCaretaker, setIsCaretaker] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        setLoading(true);
        setError(null);
        const caretaker = await landlordUserService.isCaretaker(userId);
        setIsCaretaker(caretaker);
      } catch (err: any) {
        setError(err.message || "Failed to check user role");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkRole();
    }
  }, [userId]);

  return { isCaretaker, loading, error };
}

/**
 * Hook to check if user is a tenant
 * 
 * @param userId - UUID of the user
 * @returns Tenant status
 */
export function useIsTenant(userId: string) {
  const [isTenant, setIsTenant] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        setLoading(true);
        setError(null);
        const tenant = await landlordUserService.isTenant(userId);
        setIsTenant(tenant);
      } catch (err: any) {
        setError(err.message || "Failed to check user role");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkRole();
    }
  }, [userId]);

  return { isTenant, loading, error };
}

