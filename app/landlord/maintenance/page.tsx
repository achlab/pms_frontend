"use client";

import { useState } from "react";
import { MaintenanceRequestList } from "@/components/maintenance/maintenance-request-list";
import { MaintenanceRequestDetails } from "@/components/maintenance/maintenance-request-details";
import {
  useMaintenanceRequests,
  useMaintenanceRequest,
  useMaintenanceStatistics,
} from "@/lib/hooks/use-maintenance";
import type { MaintenanceQueryParams } from "@/lib/api-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, RefreshCw, Wrench } from "lucide-react";

const INITIAL_QUERY: MaintenanceQueryParams = {
  per_page: 24,
  page: 1,
};

export default function LandlordMaintenancePage() {
  const [query, setQuery] = useState<MaintenanceQueryParams>(INITIAL_QUERY);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useMaintenanceRequests(query);
  const requests = data?.data ?? [];

  const { data: statsData, isLoading: statsLoading } = useMaintenanceStatistics();
  const stats = statsData?.data;

  const { data: selectedData, isLoading: loadingSelected } = useMaintenanceRequest(
    selectedRequestId || "",
    !!selectedRequestId
  );
  const selectedRequest = selectedData?.data;

  const handleFilterChange = (filters: {
    status?: MaintenanceQueryParams["status"];
    priority?: MaintenanceQueryParams["priority"];
    search?: string;
  }) => {
    setQuery((prev) => ({
      ...prev,
      page: 1,
      status: filters.status,
      priority: filters.priority,
      search: filters.search,
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review tenant submissions, approve work, and keep everyone aligned.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open_requests ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending or in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved_requests ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Closed out successfully</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            We couldn\'t load maintenance requests. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        </div>
      ) : (
        <MaintenanceRequestList
          requests={requests}
          onViewDetails={(id) => setSelectedRequestId(id)}
          onFilterChange={handleFilterChange}
          onRefresh={refetch}
        />
      )}

      <Dialog open={!!selectedRequestId} onOpenChange={(open) => !open && setSelectedRequestId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {loadingSelected && !selectedRequest ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : selectedRequest ? (
            <MaintenanceRequestDetails
              request={selectedRequest}
              onUpdate={() => {
                refetch();
                setSelectedRequestId(null);
              }}
            />
          ) : selectedRequestId ? (
            <p className="text-sm text-muted-foreground">
              This request could not be loaded. It may have been removed.
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
