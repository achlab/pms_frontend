/**
 * Advanced Filters Component
 * Provides comprehensive filtering and search capabilities for maintenance requests
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  X,
  Calendar,
  Building2,
  User,
  DollarSign,
  Clock,
  Save,
  Trash2,
} from "lucide-react";
import type { MaintenanceStatus, MaintenancePriority } from "@/lib/api-types";
import { formatDate } from "@/lib/api-utils";
import { getSavedFilters, saveFilter, deleteFilter, type SavedFilter } from "@/lib/utils/saved-filters";
import { useEffect, useState as useStateHook } from "react";

export interface AdvancedFilters {
  search?: string;
  status?: MaintenanceStatus[];
  priority?: MaintenancePriority[];
  propertyId?: string;
  categoryId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  costRange?: {
    min?: number;
    max?: number;
  };
  assignedTo?: string;
  escalated?: boolean;
  slaStatus?: "on_time" | "approaching" | "overdue" | "met";
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onReset?: () => void;
  properties?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  assignees?: Array<{ id: string; name: string; type: string }>;
  savedFilters?: Array<{ id: string; name: string; filters: AdvancedFilters }>;
  onSaveFilter?: (name: string, filters: AdvancedFilters) => void;
  onDeleteFilter?: (id: string) => void;
  onLoadFilter?: (filters: AdvancedFilters) => void;
  useLocalStorage?: boolean; // If true, use localStorage for saved filters
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  properties = [],
  categories = [],
  assignees = [],
  savedFilters: externalSavedFilters,
  onSaveFilter: externalOnSaveFilter,
  onDeleteFilter: externalOnDeleteFilter,
  onLoadFilter,
  useLocalStorage = true,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [localSavedFilters, setLocalSavedFilters] = useStateHook<SavedFilter[]>([]);

  // Load saved filters from localStorage if enabled
  useEffect(() => {
    if (useLocalStorage) {
      setLocalSavedFilters(getSavedFilters());
    }
  }, [useLocalStorage]);

  // Use external or local saved filters
  const savedFilters = externalSavedFilters || localSavedFilters.map((f) => ({
    id: f.id,
    name: f.name,
    filters: f.filters,
  }));

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      if (useLocalStorage) {
        try {
          const saved = saveFilter(saveFilterName.trim(), filters);
          setLocalSavedFilters(getSavedFilters());
          setSaveFilterName("");
          setShowSaveDialog(false);
        } catch (error: any) {
          alert(error.message || "Failed to save filter");
        }
      } else if (externalOnSaveFilter) {
        externalOnSaveFilter(saveFilterName.trim(), filters);
        setSaveFilterName("");
        setShowSaveDialog(false);
      }
    }
  };

  const handleDeleteFilter = (id: string) => {
    if (useLocalStorage) {
      try {
        deleteFilter(id);
        setLocalSavedFilters(getSavedFilters());
      } catch (error: any) {
        alert(error.message || "Failed to delete filter");
      }
    } else if (externalOnDeleteFilter) {
      externalOnDeleteFilter(id);
    }
  };

  const handleLoadFilter = (filterFilters: AdvancedFilters) => {
    onLoadFilter?.(filterFilters);
    setIsOpen(false);
  };

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: keyof AdvancedFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => {
      const value = filters[key as keyof AdvancedFilters];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value !== undefined && value !== null && value !== "";
    }
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, request number, description..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value || undefined)}
          className="pl-10"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Multi-Select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {filters.status && filters.status.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.status.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <Label>Status</Label>
              {[
                "pending",
                "under_review",
                "approved",
                "rejected",
                "assigned",
                "in_progress",
                "completed",
                "rework_required",
                "closed",
                "escalated",
                "cancelled",
              ].map((status) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status as MaintenanceStatus) || false}
                    onChange={(e) => {
                      const current = filters.status || [];
                      if (e.target.checked) {
                        updateFilter("status", [...current, status as MaintenanceStatus]);
                      } else {
                        updateFilter(
                          "status",
                          current.filter((s) => s !== status)
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{status.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Priority Multi-Select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Priority
              {filters.priority && filters.priority.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.priority.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <Label>Priority</Label>
              {["low", "normal", "urgent", "emergency"].map((priority) => (
                <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.priority?.includes(priority as MaintenancePriority) || false}
                    onChange={(e) => {
                      const current = filters.priority || [];
                      if (e.target.checked) {
                        updateFilter("priority", [...current, priority as MaintenancePriority]);
                      } else {
                        updateFilter(
                          "priority",
                          current.filter((p) => p !== priority)
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Property Filter */}
        {properties.length > 0 && (
          <Select
            value={filters.propertyId || "all"}
            onValueChange={(value) =>
              updateFilter("propertyId", value !== "all" ? value : undefined)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(value) =>
              updateFilter("categoryId", value !== "all" ? value : undefined)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Advanced Filters Button */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Advanced Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onReset?.();
                      setIsOpen(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <Separator />

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={filters.dateRange?.start || ""}
                      onChange={(e) =>
                        updateFilter("dateRange", {
                          ...filters.dateRange,
                          start: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={filters.dateRange?.end || ""}
                      onChange={(e) =>
                        updateFilter("dateRange", {
                          ...filters.dateRange,
                          end: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Cost Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Min Cost</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.costRange?.min || ""}
                      onChange={(e) =>
                        updateFilter("costRange", {
                          ...filters.costRange,
                          min: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Cost</Label>
                    <Input
                      type="number"
                      placeholder="∞"
                      value={filters.costRange?.max || ""}
                      onChange={(e) =>
                        updateFilter("costRange", {
                          ...filters.costRange,
                          max: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Assigned To */}
              {assignees.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned To
                  </Label>
                  <Select
                    value={filters.assignedTo || "all"}
                    onValueChange={(value) =>
                      updateFilter("assignedTo", value !== "all" ? value : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {assignees.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name} ({assignee.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Escalated Filter */}
              <div className="space-y-2">
                <Label>Special Filters</Label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.escalated || false}
                    onChange={(e) => updateFilter("escalated", e.target.checked || undefined)}
                    className="rounded"
                  />
                  <span className="text-sm">Escalated Requests Only</span>
                </label>
              </div>

              {/* SLA Status */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  SLA Status
                </Label>
                <Select
                  value={filters.slaStatus || "all"}
                  onValueChange={(value) =>
                    updateFilter("slaStatus", value !== "all" ? (value as any) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All SLA Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All SLA Statuses</SelectItem>
                    <SelectItem value="on_time">On Time</SelectItem>
                    <SelectItem value="approaching">Approaching Deadline</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="met">SLA Met</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Saved Filters */}
              {savedFilters.length > 0 && (
                <div className="space-y-2">
                  <Label>Saved Filters</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {savedFilters.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      >
                        <button
                          onClick={() => handleLoadFilter(saved.filters)}
                          className="text-sm flex-1 text-left"
                        >
                          {saved.name}
                        </button>
                        {(useLocalStorage || externalOnDeleteFilter) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFilter(saved.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Filter */}
              {(useLocalStorage || externalOnSaveFilter) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    {showSaveDialog ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Filter name"
                          value={saveFilterName}
                          onChange={(e) => setSaveFilterName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveFilter();
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveFilter}
                            disabled={!saveFilterName.trim()}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowSaveDialog(false);
                              setSaveFilterName("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowSaveDialog(true)}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Current Filters
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.status && filters.status.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status.length}
                <button
                  onClick={() => removeFilter("status")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.priority && filters.priority.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                Priority: {filters.priority.length}
                <button
                  onClick={() => removeFilter("priority")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.propertyId && (
              <Badge variant="secondary" className="gap-1">
                Property
                <button
                  onClick={() => removeFilter("propertyId")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.escalated && (
              <Badge variant="secondary" className="gap-1">
                Escalated
                <button
                  onClick={() => removeFilter("escalated")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

