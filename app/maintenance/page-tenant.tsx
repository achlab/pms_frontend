/**
 * Tenant Maintenance Requests Page
 * Shows list of tenant's maintenance requests with ability to create new ones via modal
 */

"use client";

import { useState } from "react";
import { MainLayout } from "@/components/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { MaintenanceRequestList } from "@/components/maintenance/maintenance-request-list";
import { CreateRequestModal } from "@/components/maintenance/create-request-modal";
import { MaintenanceRequestDetails } from "@/components/maintenance/maintenance-request-details";
import { useMaintenanceRequests, useMaintenanceRequest } from "@/lib/hooks/use-maintenance";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TenantMaintenancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Fetch tenant's maintenance requests
  const { data: requestsData, isLoading, error, refetch } = useMaintenanceRequests();
  const {
    data: selectedRequestData,
    isLoading: loadingRequest,
  } = useMaintenanceRequest(selectedRequestId || "", {
    enabled: !!selectedRequestId,
  });

  const requests = requestsData?.data || [];
  const selectedRequest = selectedRequestData?.data || null;

  const handleCreateSuccess = (requestId: string) => {
    setShowCreateModal(false);
    refetch();
    // Optionally show the newly created request
    setSelectedRequestId(requestId);
  };

  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
  };

  const handleCloseDetails = () => {
    setSelectedRequestId(null);
  };

  // Redirect non-tenants
  if (user && user.role !== "tenant") {
    router.push("/maintenance");
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Requests</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your maintenance requests
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Request List */}
        <MaintenanceRequestList
          requests={requests}
          onViewDetails={handleViewDetails}
          onCreateNew={() => setShowCreateModal(true)}
          onRefresh={refetch}
        />

        {/* Create Request Modal */}
        <CreateRequestModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Request Details Dialog */}
        <Dialog open={!!selectedRequestId} onOpenChange={(open) => !open && handleCloseDetails()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Maintenance Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <MaintenanceRequestDetails
                request={selectedRequest}
                onUpdate={refetch}
                onClose={handleCloseDetails}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

