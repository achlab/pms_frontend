/**
 * Landlord Property Hooks
 * React hooks for property management with loading states
 * Following Hook Pattern & Separation of Concerns
 */

import { useState, useEffect, useCallback } from "react";
import { landlordPropertyService } from "../services";
import type {
  LandlordProperty,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyQueryParams,
  PropertyFinancials,
  ApiResponse,
  PaginatedResponse,
} from "../api-types";

// ============================================
// QUERY HOOKS (Data Fetching)
// ============================================

/**
 * Hook to fetch all properties with loading state
 * 
 * @param params - Query parameters for filtering
 * @returns Properties data, loading state, and error
 */
export function useLandlordProperties(params?: PropertyQueryParams) {
  const [data, setData] = useState<PaginatedResponse<LandlordProperty> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPropertyService.getProperties(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { data, loading, error, refetch: fetchProperties };
}

/**
 * Hook to fetch a single property by ID
 * 
 * @param propertyId - UUID of the property
 * @returns Property data, loading state, and error
 */
export function useLandlordProperty(propertyId: string) {
  const [data, setData] = useState<LandlordProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPropertyService.getPropertyDetails(propertyId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch property");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [fetchProperty, propertyId]);

  return { data, loading, error, refetch: fetchProperty };
}

/**
 * Hook to fetch active properties
 * 
 * @param params - Additional query parameters
 * @returns Active properties data
 */
export function useActiveProperties(params?: PropertyQueryParams) {
  return useLandlordProperties({ ...params, is_active: true });
}

/**
 * Hook to fetch property statistics
 * 
 * @param propertyId - UUID of the property
 * @returns Property statistics
 */
export function usePropertyStatistics(propertyId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPropertyService.getPropertyStatistics(propertyId);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchStats();
    }
  }, [propertyId]);

  return { data, loading, error };
}

/**
 * Hook to fetch available units in a property
 * 
 * @param propertyId - UUID of the property
 * @returns Available units
 */
export function useAvailableUnitsInProperty(propertyId: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPropertyService.getAvailableUnitsInProperty(propertyId);
        setData(response.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch available units");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchUnits();
    }
  }, [propertyId]);

  return { data, loading, error };
}

// ============================================
// MUTATION HOOKS (Data Modification)
// ============================================

/**
 * Hook to create a new property
 * 
 * @returns Create function, loading state, and error
 */
export function useCreateProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProperty = useCallback(
    async (data: CreatePropertyRequest): Promise<LandlordProperty | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPropertyService.createProperty(data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to create property");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createProperty, loading, error };
}

/**
 * Hook to update a property
 * 
 * @returns Update function, loading state, and error
 */
export function useUpdateProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProperty = useCallback(
    async (
      propertyId: string,
      data: UpdatePropertyRequest
    ): Promise<LandlordProperty | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await landlordPropertyService.updateProperty(propertyId, data);
        return response.data!;
      } catch (err: any) {
        setError(err.message || "Failed to update property");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateProperty, loading, error };
}

/**
 * Hook to disable a property
 * 
 * @returns Disable function, loading state, and error
 */
export function useDisableProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableProperty = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordPropertyService.disableProperty(propertyId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to disable property");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { disableProperty, loading, error };
}

/**
 * Hook to enable a property
 * 
 * @returns Enable function, loading state, and error
 */
export function useEnableProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enableProperty = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await landlordPropertyService.enableProperty(propertyId);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to enable property");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { enableProperty, loading, error };
}

/**
 * Hook to assign a caretaker to a property
 * 
 * @returns Assign function, loading state, and error
 */
export function useAssignCaretaker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignCaretaker = useCallback(
    async (propertyId: string, caretakerId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await landlordPropertyService.assignCaretakerToProperty(
          propertyId,
          caretakerId
        );
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to assign caretaker");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { assignCaretaker, loading, error };
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to get property summary
 * 
 * @param propertyId - UUID of the property
 * @returns Property summary
 */
export function usePropertySummary(propertyId: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await landlordPropertyService.getPropertySummary(propertyId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to fetch property summary");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchSummary();
    }
  }, [propertyId]);

  return { data, loading, error };
}

/**
 * Hook to calculate property occupancy rate
 * 
 * @param propertyId - UUID of the property
 * @returns Occupancy rate
 */
export function usePropertyOccupancyRate(propertyId: string) {
  const [rate, setRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        setError(null);
        const occupancyRate = await landlordPropertyService.calculateOccupancyRate(
          propertyId
        );
        setRate(occupancyRate);
      } catch (err: any) {
        setError(err.message || "Failed to calculate occupancy rate");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchRate();
    }
  }, [propertyId]);

  return { rate, loading, error };
}

/**
 * Hook for getting single property with full details
 */
export function useProperty(propertyId: string) {
  const [data, setData] = useState<LandlordProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPropertyService.getProperty(propertyId);
      setData(response.data || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch property");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return { data, loading, error, refetch: fetchProperty };
}

/**
 * Hook for disabling/enabling properties
 */
export function usePropertyStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableProperty = useCallback(async (propertyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPropertyService.disableProperty(propertyId);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Failed to disable property");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enableProperty = useCallback(async (propertyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPropertyService.enableProperty(propertyId);
      return response.data;
    } catch (err: any) {
      setError(err.message || "Failed to enable property");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { disableProperty, enableProperty, loading, error };
}

/**
 * Hook for getting property financial details
 */
export function usePropertyFinancials(propertyId: string) {
  const [data, setData] = useState<PropertyFinancials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancials = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await landlordPropertyService.getPropertyFinancials(propertyId);
      setData(response.data || null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch property financials");
      // Don't throw error for financials as it might not be implemented yet
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  return { data, loading, error, refetch: fetchFinancials };
}

