/**
 * Maintenance Request List Component
 * Displays a list of maintenance requests with filters
 */

"use client";

import { useState } from "react";
import { MaintenanceRequestCard } from "./maintenance-request-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import type { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from "@/lib/api-types";

interface MaintenanceRequestListProps {
  requests: MaintenanceRequest[];
  onViewDetails?: (requestId: string) => void;
  onAddNote?: (requestId: string) => void;
  onCreateNew?: () => void;
  onFilterChange?: (filters: {
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    search?: string;
  }) => void;
}

export function MaintenanceRequestList({
  requests,
  onViewDetails,
  onAddNote,
  onCreateNew,
  onFilterChange,
}: MaintenanceRequestListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (onFilterChange) {
      onFilterChange({
        status: value !== "all" ? (value as MaintenanceStatus) : undefined,
        priority: priorityFilter !== "all" ? (priorityFilter as MaintenancePriority) : undefined,
        search: searchQuery || undefined,
      });
    }
  };

  const handlePriorityChange = (value: string) => {
    setPriorityFilter(value);
    if (onFilterChange) {
      onFilterChange({
        status: statusFilter !== "all" ? (statusFilter as MaintenanceStatus) : undefined,
        priority: value !== "all" ? (value as MaintenancePriority) : undefined,
        search: searchQuery || undefined,
      });
    }
  };

  const handleSearch = () => {
    if (onFilterChange) {
      onFilterChange({
        status: statusFilter !== "all" ? (statusFilter as MaintenanceStatus) : undefined,
        priority: priorityFilter !== "all" ? (priorityFilter as MaintenancePriority) : undefined,
        search: searchQuery || undefined,
      });
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    const matchesSearch =
      !searchQuery ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.category.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters & Create Button */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={handlePriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Request List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border">
          <p className="text-muted-foreground">No maintenance requests found</p>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Request
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <MaintenanceRequestCard
              key={request.id}
              request={request}
              onViewDetails={onViewDetails}
              onAddNote={onAddNote}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredRequests.length} of {requests.length} requests
      </div>
    </div>
  );
}

