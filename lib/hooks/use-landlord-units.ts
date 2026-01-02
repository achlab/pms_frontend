/**
 * Landlord Unit Hooks
 * React hooks for unit management with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import { landlordUnitService } from "../services";
import type {
  LandlordUnit,
  CreateUnitRequest,
  UpdateUnitRequest,
  AssignUnitRequest,
  UnitQueryParams,
  UnitStatistics,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch all units with loading state
 * 
 * @param params - Query parameters for filtering
 * @returns Units data, loading state, and error
 */
export function useLandlordUnits(params?: UnitQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordUnit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUnitService.getUnits(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch units");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return { data, loading, error, refetch: fetchUnits };
}

/**
 * Hook to fetch a single unit by ID
 * 
 * @param unitId - UUID of the unit
 * @returns Unit data, loading state, and error
 */
export function useLandlordUnit(unitId: string) {
  const [data, setData] = useState<LandlordUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUnitService.getUnitDetails(unitId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch unit");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    if (unitId) {
      fetchUnit();
    }
  }, [fetchUnit, unitId]);

  return { data, loading, error, refetch: fetchUnit };
}

/**
 * Hook to fetch available units
 * 
 * @param params - Additional query parameters
 * @returns Available units data
 */
export function useAvailableUnits(params?: UnitQueryParams) {
  return useLandlordUnits({ ...params, is_occupied: false });
}

/**
 * Hook to fetch occupied units
 * 
 * @param params - Additional query parameters
 * @returns Occupied units data
 */
export function useOccupiedUnits(params?: UnitQueryParams) {
  return useLandlordUnits({ ...params, is_occupied: true });
}

/**
 * Hook to fetch unit statistics
 * 
 * @returns Unit statistics
 */
export function useUnitStatistics() {
  const [data, setData] = useState<UnitStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUnitService.getUnitStatistics();
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch unit statistics");
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
 * Hook to create a new unit
 * 
 * @returns Create function, loading state, and error
 */
export function useCreateUnit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUnit = useCallback(
    async (data: CreateUnitRequest): Promise<LandlordUnit | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUnitService.createUnit(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to create unit");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createUnit, loading, error };
}

/**
 * Hook to update a unit
 * 
 * @returns Update function, loading state, and error
 */
export function useUpdateUnit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUnit = useCallback(
    async (
      unitId: string,
      data: UpdateUnitRequest
    ): Promise<LandlordUnit | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUnitService.updateUnit(unitId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to update unit");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateUnit, loading, error };
}

/**
 * Hook to disable a unit
 * 
 * @returns Disable function, loading state, and error
 */
export function useDisableUnit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableUnit = useCallback(async (unitId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordUnitService.disableUnit(unitId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to disable unit");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { disableUnit, loading, error };
}

/**
 * Hook to enable a unit
 * 
 * @returns Enable function, loading state, and error
 */
export function useEnableUnit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableUnit = useCallback(async (unitId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordUnitService.enableUnit(unitId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to enable unit");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { enableUnit, loading, error };
}

/**
 * Hook to toggle unit occupancy
 * 
 * @returns Toggle function, loading state, and error
 */
export function useToggleUnitOccupancy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOccupancy = useCallback(
    async (unitId: string, occupied: boolean): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await landlordUnitService.toggleUnitOccupancy(unitId, occupied);
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to toggle occupancy");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { toggleOccupancy, loading, error };
}

/**
 * Hook to assign a unit to a tenant
 * 
 * @returns Assign function, loading state, and error
 */
export function useAssignUnit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignUnit = useCallback(
    async (
      unitId: string,
      data: AssignUnitRequest
    ): Promise<LandlordUnit | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordUnitService.assignUnit(unitId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to assign unit");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { assignUnit, loading, error };
}

/**
 * Hook for removing tenant from unit
 */
export function useRemoveTenant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeTenant = useCallback(async (propertyId: string, unitId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUnitService.removeTenant(propertyId, unitId);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Failed to remove tenant");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { removeTenant, loading, error };
}

/**
 * Hook for disabling/enabling units
 */
export function useUnitStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableUnit = useCallback(async (propertyId: string, unitId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUnitService.disableUnit(propertyId, unitId, reason);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Failed to disable unit");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enableUnit = useCallback(async (propertyId: string, unitId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUnitService.enableUnit(propertyId, unitId);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Failed to enable unit");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { disableUnit, enableUnit, loading, error };
}

/**
 * Hook for getting single unit with full details
 */
export function useUnit(propertyId: string, unitId: string) {
  const [data, setData] = useState<LandlordUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnit = useCallback(async () => {
    if (!propertyId || !unitId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await landlordUnitService.getUnit(propertyId, unitId);
      setData(response.data || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch unit");
    } finally {
      setLoading(false);
    }
  }, [propertyId, unitId]);

  useEffect(() => {
    fetchUnit();
  }, [fetchUnit]);

  return { data, loading, error, refetch: fetchUnit };
}

// ============================================
// AVAILABILITY HOOKS
// ============================================

/**
 * Hook to check unit availability
 * 
 * @param unitId - UUID of the unit
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Availability status
 */
export function useUnitAvailability(
  unitId: string,
  startDate: string,
  endDate: string
) {
  const [available, setAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!unitId || !startDate || !endDate) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await landlordUnitService.checkUnitAvailability(
          unitId,
          startDate,
          endDate
        );
        setAvailable(response.data?.available || false);
      } catch (err: any) {
        setError(err.message || "Failed to check availability");
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [unitId, startDate, endDate]);

  return { available, loading, error };
}

/**
 * Hook to bulk check availability for multiple units
 * 
 * @param unitIds - Array of unit UUIDs
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Availability map
 */
export function useBulkUnitAvailability(
  unitIds: string[],
  startDate: string,
  endDate: string
) {
  const [data, setData] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (unitIds.length === 0 || !startDate || !endDate) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await landlordUnitService.bulkCheckAvailability(
          unitIds,
          startDate,
          endDate
        );
        setData(response.data || {});
      } catch (err: any) {
        setError(err.message || "Failed to check availability");
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [unitIds, startDate, endDate]);

  return { data, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get unit summary
 * 
 * @param unitId - UUID of the unit
 * @returns Unit summary
 */
export function useUnitSummary(unitId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await landlordUnitService.getUnitSummary(unitId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to fetch unit summary");
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchSummary();
    }
  }, [unitId]);

  return { data, loading, error };
}

/**
 * Hook to check if unit is available now
 * 
 * @param unitId - UUID of the unit
 * @returns Availability status
 */
export function useIsUnitAvailableNow(unitId: string) {
  const [available, setAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        const isAvailable = await landlordUnitService.isUnitAvailable(unitId);
        setAvailable(isAvailable);
      } catch (err: any) {
        setError(err.message || "Failed to check availability");
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      checkAvailability();
    }
  }, [unitId]);

  return { available, loading, error };
}

/**
 * Hook to get current unit tenant
 * 
 * @param unitId - UUID of the unit
 * @returns Current tenant
 */
export function useCurrentUnitTenant(unitId: string) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentTenant = await landlordUnitService.getCurrentTenant(unitId);
        setTenant(currentTenant);
      } catch (err: any) {
        setError(err.message || "Failed to fetch current tenant");
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchTenant();
    }
  }, [unitId]);

  return { tenant, loading, error };
}

