"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Building2, User, Calendar, Tag, UserCheck, XCircle, Image as ImageIcon } from "lucide-react";
import { MaintenanceRequest } from "@/lib/api-types";
import { useApproveRejectMaintenanceRequest } from "@/lib/hooks/use-maintenance-approval";
import { formatDate } from "@/lib/utils";

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest;
  onSuccess?: () => void;
}

export function ApproveRejectModal({
  isOpen,
  onClose,
  maintenanceRequest,
  onSuccess,
}: ApproveRejectModalProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const approveRejectMutation = useApproveRejectMaintenanceRequest();

  const handleClose = () => {
    setAction(null);
    setRejectionReason("");
    onClose();
  };

  const handleActionSelect = (selectedAction: "approve" | "reject") => {
    setAction(selectedAction);
  };

  const handleSubmit = async () => {
    if (!action) return;

    try {
      await approveRejectMutation.mutateAsync({
        requestId: maintenanceRequest.id,
        action,
        rejection_reason: action === "reject" ? rejectionReason : undefined,
      });
      onSuccess?.();
      handleClose();
    } catch (error) {
      // handled by mutation hook
    }
  };

  const canSubmit =
    action === "approve" ||
    (action === "reject" && rejectionReason.trim().length >= 10);

  const isSubmitting = approveRejectMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {maintenanceRequest.status === "pending"
              ? "Review Maintenance Request"
              : maintenanceRequest.status === "under_review"
              ? "Review & Decide"
              : "Review Maintenance Request"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{maintenanceRequest.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{maintenanceRequest.description}</p>
              </div>
              <Badge
                variant={
                  maintenanceRequest.priority === "emergency"
                    ? "destructive"
                    : maintenanceRequest.priority === "urgent"
                    ? "destructive"
                    : maintenanceRequest.priority === "high"
                    ? "default"
                    : "secondary"
                }
              >
                {maintenanceRequest.priority}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>
                  {maintenanceRequest.property.name}
                  {maintenanceRequest.unit ? ` - Unit ${maintenanceRequest.unit.unit_number}` : " (Property-wide)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{maintenanceRequest.tenant.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Submitted: {formatDate(maintenanceRequest.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span>{maintenanceRequest.category.name}</span>
              </div>
            </div>
          </div>

          {/* Display attached images */}
          {maintenanceRequest.media && Array.isArray(maintenanceRequest.media) && maintenanceRequest.media.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <Label className="text-sm font-medium text-gray-700">Attached Images</Label>
              </div>
              <div className="space-y-3">
                {maintenanceRequest.media
                  .filter(media => media.IsImage === true || media.FileType === 'image')
                  .map((media, index) => {
                    const fileUrl = media.FileURL || media.file_url;
                    return (
                      <div key={media.MediaID || media.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                        {fileUrl ? (
                          <div>
                            <img
                              src={fileUrl}
                              alt={media.FileName || `Attachment ${index + 1}`}
                              className="w-full max-h-64 object-contain bg-gray-50"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-24 bg-gray-100 items-center justify-center text-gray-500 text-sm hidden">
                              Image failed to load
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                            Image URL not available
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              {maintenanceRequest.media.filter(media => media.IsImage !== true && media.FileType !== 'image').length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Documents & Other Files</Label>
                  {maintenanceRequest.media
                    .filter(media => media.IsImage !== true && media.FileType !== 'image')
                    .map((media, index) => {
                      const fileUrl = media.FileURL || media.file_url;
                      return (
                        <div key={media.MediaID || media.id || index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex-shrink-0">
                            <ImageIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {media.FileName || `Document ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {media.FileType || 'Document'} • {media.FormattedFileSize || (media.FileSize ? (media.FileSize / 1024).toFixed(1) + ' KB' : 'Size unknown')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                            onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                            disabled={!fileUrl}
                          >
                            View
                          </Button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Decision</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={action === "approve" ? "default" : "outline"}
                className={`h-24 flex-col gap-2 ${action === "approve" ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-200 hover:bg-green-50"}`}
                onClick={() => handleActionSelect("approve")}
              >
                <UserCheck className="h-7 w-7" />
                <span className="text-sm font-medium">Approve Request</span>
                <span className="text-xs opacity-90">Approve so work can begin</span>
              </Button>
              <Button
                type="button"
                variant={action === "reject" ? "destructive" : "outline"}
                className={`h-24 flex-col gap-2 ${action === "reject" ? "" : "border-red-200 hover:bg-red-50"}`}
                onClick={() => handleActionSelect("reject")}
              >
                <XCircle className="h-7 w-7" />
                <span className="text-sm font-medium">Reject Request</span>
                <span className="text-xs opacity-90">Reject with a reason</span>
              </Button>
            </div>
          </div>

          {action && (
            <div
              className={`p-3 rounded-lg ${
                action === "approve" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <p className={`text-sm font-medium ${action === "approve" ? "text-green-800" : "text-red-800"}`}>
                 {action === "approve" ? "Approve request" : "Rejection"} selected -
                {" "}
                {canSubmit ? "Click \"Confirm\" below to proceed" : "Complete required fields to proceed"}
              </p>
            </div>
          )}

          {action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a clear reason for rejecting this maintenance request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Minimum 10 characters required</span>
                <span className={rejectionReason.length >= 10 ? "text-green-600 font-medium" : ""}>
                  {rejectionReason.length}/500
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={!canSubmit || isSubmitting}
              className={action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {isSubmitting ? "Processing..." : action === "approve" ? "Approve Request" : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
