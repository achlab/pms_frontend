/**
 * Accept/Reject Assignment Modal
 * Allows caretakers and artisans to accept or reject maintenance request assignments
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Building2, 
  Calendar,
  Tag,
  Loader2,
  Clock
} from "lucide-react";
import type { MaintenanceRequest, AcceptRejectAssignmentRequest } from "@/lib/api-types";
import { formatDate } from "@/lib/utils";
import { canAcceptAssignment } from "@/lib/utils/maintenance-workflow";
import { useUpdateMaintenanceStatus } from "@/lib/hooks/use-caretaker-maintenance";

interface AcceptAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest;
  onSuccess?: () => void;
}

export function AcceptAssignmentModal({
  isOpen,
  onClose,
  maintenanceRequest,
  onSuccess,
}: AcceptAssignmentModalProps) {
  const { user } = useAuth();
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateStatusMutation = useUpdateMaintenanceStatus({
    onSuccess: () => {
      toast.success(`Assignment ${action === "accept" ? "accepted" : "rejected"} successfully`);
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to ${action} assignment`);
      setIsSubmitting(false);
    },
  });

  const handleClose = () => {
    setAction(null);
    setRejectionReason("");
    setNote("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!action) {
      toast.error("Please select an action");
      return;
    }

    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting the assignment");
      return;
    }

    if (action === "reject" && rejectionReason.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Accept: Move from "assigned" to "in_progress"
      if (action === "accept") {
        await updateStatusMutation.mutateAsync({
          requestId: maintenanceRequest.id,
          data: {
            status: "in_progress",
            note: note.trim() || undefined,
          },
        });
      } else {
        // Reject: Keep as "assigned" but mark as rejected
        // The backend should handle this - for now we'll use a note
        await updateStatusMutation.mutateAsync({
          requestId: maintenanceRequest.id,
          data: {
            status: "assigned", // Keep as assigned so landlord can reassign
            note: `Assignment rejected: ${rejectionReason.trim()}`,
          },
        });
      }
    } catch (error) {
      // Error handled by mutation
      setIsSubmitting(false);
    }
  };

  const canAccept = canAcceptAssignment(maintenanceRequest.status);
  const isAssignedToMe = 
    maintenanceRequest.assigned_to_id === user?.id ||
    maintenanceRequest.assigned_to?.id === user?.id;

  if (!canAccept || !isAssignedToMe) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Accept Assignment</DialogTitle>
            <DialogDescription>
              {!canAccept && "This request is not in 'Assigned' status."}
              {!isAssignedToMe && "This request is not assigned to you."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const canSubmit = action && (action === "accept" || (action === "reject" && rejectionReason.trim().length >= 10));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assignment Decision
          </DialogTitle>
          <DialogDescription>
            You have been assigned to handle this maintenance request. Accept to start working, or reject with a reason.
          </DialogDescription>
        </DialogHeader>

        {/* Request Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{maintenanceRequest.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{maintenanceRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {maintenanceRequest.property.name}
                    {maintenanceRequest.unit && ` - Unit ${maintenanceRequest.unit.unit_number}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>{maintenanceRequest.category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned: {maintenanceRequest.assigned_at ? formatDate(maintenanceRequest.assigned_at) : "Recently"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Priority: <Badge variant="outline" className="ml-1 capitalize">{maintenanceRequest.priority}</Badge></span>
                </div>
              </div>

              {maintenanceRequest.scheduled_date && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Scheduled Date:</strong> {formatDate(maintenanceRequest.scheduled_date)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Selection */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Your Decision</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={action === "accept" ? "default" : "outline"}
              className={`h-24 flex-col gap-2 ${action === "accept" ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={() => setAction("accept")}
              disabled={isSubmitting}
            >
              <CheckCircle className="h-6 w-6" />
              Accept Assignment
            </Button>
            <Button
              type="button"
              variant={action === "reject" ? "destructive" : "outline"}
              className="h-24 flex-col gap-2"
              onClick={() => setAction("reject")}
              disabled={isSubmitting}
            >
              <XCircle className="h-6 w-6" />
              Reject Assignment
            </Button>
          </div>
        </div>

        {/* Status Indicator */}
        {action && (
          <div className={`p-3 rounded-lg ${
            action === "accept" 
              ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800" 
              : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}>
            <p className={`text-sm font-medium ${
              action === "accept" 
                ? "text-green-800 dark:text-green-200" 
                : "text-red-800 dark:text-red-200"
            }`}>
              ✓ {action === "accept" ? "Acceptance" : "Rejection"} selected - {canSubmit ? 'Click "Confirm" below to proceed' : 'Complete required fields to proceed'}
            </p>
          </div>
        )}

        {/* Rejection Reason */}
        {action === "reject" && (
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a clear reason for rejecting this assignment (minimum 10 characters)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Minimum 10 characters required</span>
              <span className={rejectionReason.length >= 10 ? "text-green-600 font-medium" : ""}>
                {rejectionReason.length}/500
              </span>
            </div>
          </div>
        )}

        {/* Optional Note (for acceptance) */}
        {action === "accept" && (
          <div className="space-y-2">
            <Label htmlFor="note">Additional Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any notes about accepting this assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={action === "accept" ? "bg-green-600 hover:bg-green-700" : ""}
            variant={action === "reject" ? "destructive" : "default"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {action === "accept" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Acceptance
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirm Rejection
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

