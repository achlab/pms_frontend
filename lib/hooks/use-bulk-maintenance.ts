/**
 * Bulk Maintenance Operations Hooks
 * Handles bulk actions on maintenance requests
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MaintenanceStatus, MaintenancePriority } from "@/lib/api-types";
import apiClient from "../api-client";

/**
 * Bulk assign maintenance requests
 */
export function useBulkAssignMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestIds,
      assigneeId,
      assigneeType,
      note,
    }: {
      requestIds: string[];
      assigneeId: string;
      assigneeType: "caretaker" | "artisan" | "landlord";
      note?: string;
    }) => {
      // Call bulk assign endpoint
      return apiClient.post("/maintenance/requests/bulk/assign", {
        request_ids: requestIds,
        assignee_id: assigneeId,
        assignee_type: assigneeType,
        note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-statistics"] });
    },
    onError: (error: any) => {
      toast.error("Failed to assign requests", {
        description: error.message || "An error occurred during bulk assignment.",
      });
    },
  });
}

/**
 * Bulk update maintenance request status
 */
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestIds,
      status,
      note,
    }: {
      requestIds: string[];
      status: MaintenanceStatus;
      note?: string;
    }) => {
      return apiClient.post("/maintenance/requests/bulk/status", {
        request_ids: requestIds,
        status,
        note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-statistics"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update status", {
        description: error.message || "An error occurred during bulk status update.",
      });
    },
  });
}

/**
 * Bulk update maintenance request priority
 */
export function useBulkUpdatePriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestIds,
      priority,
    }: {
      requestIds: string[];
      priority: MaintenancePriority;
    }) => {
      return apiClient.post("/maintenance/requests/bulk/priority", {
        request_ids: requestIds,
        priority,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-statistics"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update priority", {
        description: error.message || "An error occurred during bulk priority update.",
      });
    },
  });
}

