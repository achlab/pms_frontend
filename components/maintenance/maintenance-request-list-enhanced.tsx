/**
 * Enhanced Maintenance Request List Component
 * Includes bulk operations, advanced filtering, sorting, and pagination
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { MaintenanceRequestCard } from "./maintenance-request-card";
import { AdvancedFilters, type AdvancedFilters as AdvancedFiltersType } from "./advanced-filters";
import { BulkOperations } from "./bulk-operations";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  CheckSquare,
  Square,
  X,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from "@/lib/api-types";
import { calculateSLADeadlines, getEscalationStatus } from "@/lib/utils/sla-tracking";

interface MaintenanceRequestListEnhancedProps {
  requests: MaintenanceRequest[];
  onViewDetails?: (requestId: string) => void;
  onAddNote?: (requestId: string) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  onBulkAssign?: (requestIds: string[], assigneeId: string, assigneeType: string, note?: string) => Promise<void>;
  onBulkStatusUpdate?: (requestIds: string[], status: MaintenanceStatus, note?: string) => Promise<void>;
  onBulkPriorityUpdate?: (requestIds: string[], priority: MaintenancePriority) => Promise<void>;
  properties?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  assignees?: Array<{ id: string; name: string; type: "caretaker" | "artisan" | "landlord" }>;
  // Backend filtering support
  filters?: AdvancedFiltersType;
  onFiltersChange?: (filters: AdvancedFiltersType) => void;
  sortField?: SortField;
  onSortFieldChange?: (field: SortField) => void;
  sortDirection?: SortDirection;
  onSortDirectionChange?: (direction: SortDirection) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
}

type SortField = "created_at" | "updated_at" | "priority" | "status" | "title" | "cost";
type SortDirection = "asc" | "desc";

export function MaintenanceRequestListEnhanced({
  requests,
  onViewDetails,
  onAddNote,
  onCreateNew,
  onRefresh,
  onBulkAssign,
  onBulkStatusUpdate,
  onBulkPriorityUpdate,
  properties = [],
  categories = [],
  assignees = [],
  // Backend filtering props
  filters: externalFilters,
  onFiltersChange: externalOnFiltersChange,
  sortField: externalSortField,
  onSortFieldChange: externalOnSortFieldChange,
  sortDirection: externalSortDirection,
  onSortDirectionChange: externalOnSortDirectionChange,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  totalPages: externalTotalPages,
  totalItems: externalTotalItems,
}: MaintenanceRequestListEnhancedProps) {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord" || user?.role === "super_admin";

  // State - use external if provided, otherwise use internal state
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  
  // Use external state if provided (backend filtering), otherwise use internal (client-side filtering)
  const useBackendFiltering = !!externalFilters && !!externalOnFiltersChange;
  const [internalFilters, setInternalFilters] = useState<AdvancedFiltersType>({});
  const [internalSortField, setInternalSortField] = useState<SortField>("created_at");
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>("desc");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  
  const filters = useBackendFiltering ? externalFilters! : internalFilters;
  const setFilters = useBackendFiltering ? externalOnFiltersChange! : setInternalFilters;
  const sortField = useBackendFiltering ? (externalSortField || "created_at") : internalSortField;
  const setSortField = useBackendFiltering ? (externalOnSortFieldChange || (() => {})) : setInternalSortField;
  const sortDirection = useBackendFiltering ? (externalSortDirection || "desc") : internalSortDirection;
  const setSortDirection = useBackendFiltering ? (externalOnSortDirectionChange || (() => {})) : setInternalSortDirection;
  const currentPage = useBackendFiltering ? (externalCurrentPage || 1) : internalCurrentPage;
  const setCurrentPage = useBackendFiltering ? (externalOnPageChange || (() => {})) : setInternalCurrentPage;
  const totalPages = useBackendFiltering ? (externalTotalPages || 1) : Math.ceil(requests.length / 12);
  const totalItems = useBackendFiltering ? (externalTotalItems || requests.length) : requests.length;
  const itemsPerPage = 12;

  // Toggle selection
  const toggleSelection = useCallback((requestId: string) => {
    setSelectedRequests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(requests.map((r) => r.id)));
    }
  }, [selectedRequests.size, requests]);

  // If using backend filtering, requests are already filtered and sorted
  // Otherwise, apply client-side filtering and sorting
  const filteredAndSortedRequests = useMemo(() => {
    if (useBackendFiltering) {
      // Backend has already filtered and sorted, just return requests
      return requests;
    }

    // Client-side filtering (fallback)
    let filtered = [...requests];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.request_number.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower) ||
          r.category.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((r) => filters.status!.includes(r.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((r) => filters.priority!.includes(r.priority));
    }

    if (filters.propertyId) {
      filtered = filtered.filter((r) => r.property.id === filters.propertyId);
    }

    if (filters.categoryId) {
      filtered = filtered.filter((r) => r.category.id === filters.categoryId);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(
        (r) => r.assigned_to_id === filters.assignedTo || r.assigned_to?.id === filters.assignedTo
      );
    }

    if (filters.escalated) {
      filtered = filtered.filter((r) => getEscalationStatus(r).isEscalated);
    }

    if (filters.dateRange?.start) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= new Date(filters.dateRange!.start!)
      );
    }

    if (filters.dateRange?.end) {
      filtered = filtered.filter(
        (r) => new Date(r.created_at) <= new Date(filters.dateRange!.end!)
      );
    }

    if (filters.costRange?.min !== undefined) {
      filtered = filtered.filter(
        (r) => (r.actual_cost || r.estimated_cost || 0) >= filters.costRange!.min!
      );
    }

    if (filters.costRange?.max !== undefined) {
      filtered = filtered.filter(
        (r) => (r.actual_cost || r.estimated_cost || 0) <= filters.costRange!.max!
      );
    }

    if (filters.slaStatus) {
      filtered = filtered.filter((r) => {
        const slas = calculateSLADeadlines(r);
        const criticalSLA = [slas.response, slas.assignment, slas.acceptance, slas.completion].find(
          (sla) => sla.status === filters.slaStatus
        );
        return !!criticalSLA;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "created_at":
        case "updated_at":
          aValue = new Date(a[sortField]).getTime();
          bValue = new Date(b[sortField]).getTime();
          break;
        case "priority":
          const priorityOrder = { emergency: 4, urgent: 3, normal: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "cost":
          aValue = a.actual_cost || a.estimated_cost || 0;
          bValue = b.actual_cost || b.estimated_cost || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [requests, filters, sortField, sortDirection, useBackendFiltering]);

  // Pagination - if backend filtering, use backend pagination, otherwise client-side
  const paginatedRequests = useMemo(() => {
    if (useBackendFiltering) {
      // Backend has already paginated
      return requests;
    }
    // Client-side pagination
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRequests.slice(start, start + itemsPerPage);
  }, [requests, filteredAndSortedRequests, currentPage, itemsPerPage, useBackendFiltering]);

  // Reset selection when filters change
  useMemo(() => {
    setSelectedRequests(new Set());
    setCurrentPage(1);
  }, [filters, sortField, sortDirection]);

  const handleBulkOperationSuccess = () => {
    setSelectedRequests(new Set());
    setShowBulkOperations(false);
    onRefresh?.();
  };

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters({})}
        properties={properties}
        categories={categories}
        assignees={assignees}
      />

      {/* Bulk Operations Bar */}
      {isLandlord && selectedRequests.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedRequests.size} request(s) selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRequests(new Set())}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
          <Button
            onClick={() => setShowBulkOperations(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      )}

      {/* Sort and Select All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isLandlord && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  paginatedRequests.length > 0 &&
                  paginatedRequests.every((r) => selectedRequests.has(r.id))
                }
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select
              value={sortField}
              onValueChange={(v: SortField) => setSortField(v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="updated_at">Last Updated</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {paginatedRequests.length} of {totalItems} requests
        </div>
      </div>

      {/* Request List */}
      {paginatedRequests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border">
          <p className="text-muted-foreground">No maintenance requests found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedRequests.map((request) => (
            <div key={request.id} className="relative">
              {isLandlord && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedRequests.has(request.id)}
                    onCheckedChange={() => toggleSelection(request.id)}
                    className="bg-white dark:bg-gray-800 border-2"
                  />
                </div>
              )}
              <MaintenanceRequestCard
                request={request}
                onViewDetails={onViewDetails}
                onAddNote={onAddNote}
                onRefresh={onRefresh}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkOperations && (
        <BulkOperations
          selectedRequests={Array.from(selectedRequests)}
          onClose={() => setShowBulkOperations(false)}
          onBulkAssign={async (requestIds, assigneeId, assigneeType, note) => {
            await onBulkAssign?.(requestIds, assigneeId, assigneeType, note);
            handleBulkOperationSuccess();
          }}
          onBulkStatusUpdate={async (requestIds, status, note) => {
            await onBulkStatusUpdate?.(requestIds, status, note);
            handleBulkOperationSuccess();
          }}
          onBulkPriorityUpdate={async (requestIds, priority) => {
            await onBulkPriorityUpdate?.(requestIds, priority);
            handleBulkOperationSuccess();
          }}
          assignees={assignees}
        />
      )}
    </div>
  );
}

