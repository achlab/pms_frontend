/**
 * Super Admin User Management Hooks
 * React hooks for creating users of all types
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminUsersService } from "../services/super-admin-users.service";
import type { CreateUserRequest } from "../services/super-admin-users.service";
import { toast } from "sonner";

/**
 * Hook to create a new tenant
 */
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => 
      superAdminUsersService.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-tenants'] });
      toast.success('Tenant created successfully. They will need to change their password on first login.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create tenant');
    },
  });
}

/**
 * Hook to create a new landlord
 */
export function useCreateLandlord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => 
      superAdminUsersService.createLandlord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-landlords'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-properties'] });
      toast.success('Landlord created successfully. They will need to change their password on first login.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create landlord');
    },
  });
}

/**
 * Hook to create a new caretaker
 */
export function useCreateCaretaker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => 
      superAdminUsersService.createCaretaker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-caretakers'] });
      toast.success('Caretaker created successfully. They will need to change their password on first login.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create caretaker');
    },
  });
}
