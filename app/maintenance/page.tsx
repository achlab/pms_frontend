/**
 * Maintenance Requests Page
 * Main page for viewing and managing maintenance requests
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { MaintenanceRequestList } from "@/components/maintenance/maintenance-request-list";
import { MaintenanceRequestDetails } from "@/components/maintenance/maintenance-request-details";
import { AddNoteModal } from "@/components/maintenance/add-note-modal";
import {
  useMaintenanceRequests,
  useMaintenanceRequest,
  useMaintenanceStatistics,
} from "@/lib/hooks/use-maintenance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react";
import type { MaintenanceStatus, MaintenancePriority } from "@/lib/api-types";

export default function MaintenancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<{
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
  }>({});
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteRequestId, setNoteRequestId] = useState<string | null>(null);

  // Fetch data
  const { data: requestsData, isLoading, error, refetch } = useMaintenanceRequests(filters);
  const { data: statsData, isLoading: loadingStats } = useMaintenanceStatistics();
  const {
    data: selectedRequestData,
    isLoading: loadingRequest,
    refetch: refetchRequest,
  } = useMaintenanceRequest(selectedRequestId || "", {
    enabled: !!selectedRequestId,
  });

  const requests = requestsData?.data || [];
  const stats = statsData?.data || null;
  const selectedRequest = selectedRequestData?.data || null;

  const handleCreateNew = () => {
    router.push("/maintenance/create");
  };

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
  };

  const handleCloseDetails = () => {
    setSelectedRequestId(null);
  };

  const handleAddNote = (requestId: string) => {
    setNoteRequestId(requestId);
    setNoteModalOpen(true);
  };

  const handleNoteSuccess = () => {
    refetchRequest();
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Requests</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === "tenant" 
              ? "Submit new maintenance requests and track existing ones"
              : "View and manage maintenance requests"
            }
          </p>
        </div>
        {user?.role === "tenant" && (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      {loadingStats ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          {/* Total Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          {/* Open Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open_requests}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>

          {/* Resolved Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved_requests}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
            </CardContent>
          </Card>

          {/* Average Resolution Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Resolution</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.average_resolution_time
                  ? `${stats.average_resolution_time} days`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Time to resolve</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load maintenance requests. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      ) : (
        /* Request List */
        <MaintenanceRequestList
          requests={requests}
          onViewDetails={handleViewDetails}
          onAddNote={handleAddNote}
          onCreateNew={handleCreateNew}
          onRefresh={() => refetch()}
          onFilterChange={setFilters}
        />
      )}

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequestId} onOpenChange={handleCloseDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {loadingRequest ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : selectedRequest ? (
            <MaintenanceRequestDetails
              request={selectedRequest}
              onAddNote={() => {
                if (selectedRequest.id) {
                  handleAddNote(selectedRequest.id);
                }
              }}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Request not found</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      {noteRequestId && (
        <AddNoteModal
          requestId={noteRequestId}
          requestNumber={
            requests.find((r) => r.id === noteRequestId)?.request_number || ""
          }
          open={noteModalOpen}
          onClose={() => {
            setNoteModalOpen(false);
            setNoteRequestId(null);
          }}
          onSuccess={handleNoteSuccess}
        />
      )}
      </div>
    </MainLayout>
  );
}
