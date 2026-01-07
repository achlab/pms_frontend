/**
 * Filter Converter Utility
 * Converts frontend AdvancedFilters to backend MaintenanceQueryParams
 */

import type { AdvancedFilters } from "@/components/maintenance/advanced-filters";
import type { MaintenanceQueryParams } from "@/lib/api-types";

/**
 * Convert AdvancedFilters to MaintenanceQueryParams for backend API
 */
export function convertFiltersToQueryParams(
  filters: AdvancedFilters,
  sortField?: string,
  sortDirection?: "asc" | "desc",
  page?: number,
  perPage?: number
): MaintenanceQueryParams {
  const params: MaintenanceQueryParams = {
    page: page || 1,
    per_page: perPage || 12,
  };

  // Search
  if (filters.search) {
    params.search = filters.search;
  }

  // Status - convert array to status[] format
  if (filters.status && filters.status.length > 0) {
    params["status[]"] = filters.status;
  }

  // Priority - convert array to priority[] format
  if (filters.priority && filters.priority.length > 0) {
    params["priority[]"] = filters.priority;
  }

  // Property ID - convert to property_id[] array format
  if (filters.propertyId) {
    params["property_id[]"] = [filters.propertyId];
  }

  // Category ID - convert to category_id[] array format
  if (filters.categoryId) {
    params["category_id[]"] = [filters.categoryId];
  }

  // Assigned To - convert to assignee[] array format
  if (filters.assignedTo) {
    params["assignee[]"] = [filters.assignedTo];
  }

  // Escalated (boolean)
  if (filters.escalated !== undefined) {
    params.escalated = filters.escalated;
  }

  // Date range filters
  if (filters.dateRange?.start) {
    params.created_from = filters.dateRange.start;
  }
  if (filters.dateRange?.end) {
    params.created_to = filters.dateRange.end;
  }

  // Cost range filters
  if (filters.costRange?.min !== undefined) {
    // Use estimated_cost_min as default, or actual_cost_min if specified
    params.estimated_cost_min = filters.costRange.min;
  }
  if (filters.costRange?.max !== undefined) {
    params.estimated_cost_max = filters.costRange.max;
  }

  // SLA status
  if (filters.slaStatus) {
    params.sla_status = filters.slaStatus;
  }

  // Sorting
  if (sortField) {
    params.sort_by = sortField as any;
  }
  if (sortDirection) {
    params.sort_direction = sortDirection;
  }

  return params;
}

