/**
 * Super Admin Properties Hooks
 * React hooks for property management across all landlords
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminPropertiesService } from "../services/super-admin-properties.service";
import type { 
  SuperAdminPropertiesQueryParams,
  CreatePropertyRequest,
  CreateUnitRequest
} from "../services/super-admin-properties.service";
import { toast } from "sonner";

/**
 * Hook to fetch all properties
 */
export function useSuperAdminProperties(params?: SuperAdminPropertiesQueryParams) {
  return useQuery({
    queryKey: ['super-admin-properties', params],
    queryFn: async () => {
      const response = await superAdminPropertiesService.getAllProperties(params);
      return response;
    },
  });
}

/**
 * Hook to fetch a single property
 */
export function useSuperAdminProperty(propertyId: string) {
  return useQuery({
    queryKey: ['super-admin-property', propertyId],
    queryFn: async () => {
      const response = await superAdminPropertiesService.getProperty(propertyId);
      return response.data;
    },
    enabled: !!propertyId,
  });
}

/**
 * Hook to fetch property statistics
 */
export function useSuperAdminPropertyStatistics() {
  return useQuery({
    queryKey: ['super-admin-property-statistics'],
    queryFn: async () => {
      const response = await superAdminPropertiesService.getStatistics();
      return response.data;
    },
  });
}

/**
 * Hook to fetch all landlords
 */
export function useSuperAdminLandlords() {
  return useQuery({
    queryKey: ['super-admin-landlords'],
    queryFn: async () => {
      const response = await superAdminPropertiesService.getLandlords();
      return response.data;
    },
  });
}

/**
 * Hook to toggle property status
 */
export function useTogglePropertyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => 
      superAdminPropertiesService.togglePropertyStatus(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property-statistics'] });
      toast.success('Property status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update property status');
    },
  });
}

/**
 * Hook to toggle unit status
 */
export function useToggleUnitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unitId: string) => 
      superAdminPropertiesService.toggleUnitStatus(unitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property-statistics'] });
      toast.success('Unit status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update unit status');
    },
  });
}

/**
 * Hook to create a new property
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => 
      superAdminPropertiesService.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property-statistics'] });
      toast.success('Property created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create property');
    },
  });
}

/**
 * Hook to create a new unit
 */
export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUnitRequest) => 
      superAdminPropertiesService.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property-statistics'] });
      toast.success('Unit created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create unit');
    },
  });
}

/**
 * Hook to fetch properties list (for unit creation)
 */
export function useSuperAdminPropertiesList() {
  return useQuery({
    queryKey: ['super-admin-properties-list'],
    queryFn: async () => {
      const response = await superAdminPropertiesService.getPropertiesList();
      return response.data;
    },
  });
}

/**
 * Hook to fetch caretakers (for assignment)
 */
export function useSuperAdminCaretakers() {
  return useQuery({
    queryKey: ['super-admin-caretakers'],
    queryFn: async () => {
      const response = await superAdminPropertiesService.getCaretakers();
      return response.data;
    },
  });
}

/**
 * Hook to assign caretaker to a property
 */
export function useAssignCaretaker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, caretakerId }: { propertyId: string; caretakerId: string }) => 
      superAdminPropertiesService.assignCaretaker(propertyId, caretakerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property'] });
      toast.success('Caretaker assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign caretaker');
    },
  });
}

/**
 * Hook to remove caretaker from a property
 */
export function useRemoveCaretaker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => 
      superAdminPropertiesService.removeCaretaker(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-property'] });
      toast.success('Caretaker removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove caretaker');
    },
  });
}
