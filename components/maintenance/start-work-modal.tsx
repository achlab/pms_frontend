/**
 * Start Work Modal Component
 * Allows caretakers/artisans to start working on an assigned request
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { useUpdateMaintenanceStatus } from "@/lib/hooks/use-caretaker-maintenance";
import { toast } from "sonner";
import type { MaintenanceRequest } from "@/lib/api-types";

interface StartWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest | null;
  onSuccess?: () => void;
}

export function StartWorkModal({
  isOpen,
  onClose,
  maintenanceRequest,
  onSuccess,
}: StartWorkModalProps) {
  const [note, setNote] = useState("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");

  const updateStatusMutation = useUpdateMaintenanceStatus({
    onSuccess: (data) => {
      toast.success("Work started successfully", {
        description: "The request status has been updated to 'In Progress'.",
      });
      setNote("");
      setEstimatedCompletionDate("");
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error("Failed to start work", {
        description: error.message || "An error occurred while updating the request status.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!maintenanceRequest) return;

    updateStatusMutation.mutate({
      requestId: maintenanceRequest.id,
      data: {
        status: "in_progress",
        note: note || "Started working on this request",
        estimated_completion_date: estimatedCompletionDate || undefined,
      },
    });
  };

  if (!maintenanceRequest) return null;

  const isLoading = updateStatusMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start Work on Request</DialogTitle>
          <DialogDescription>
            Mark this request as "In Progress" to indicate you've started working on it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {maintenanceRequest.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Request #{maintenanceRequest.request_number || maintenanceRequest.id}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {maintenanceRequest.property?.name}
              {maintenanceRequest.unit && ` - Unit ${maintenanceRequest.unit.unit_number}`}
            </p>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">
              Work Note <span className="text-gray-500">(optional)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Add any notes about starting this work..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              This note will be visible to the tenant and landlord.
            </p>
          </div>

          {/* Estimated Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCompletionDate">
              Estimated Completion Date <span className="text-gray-500">(optional)</span>
            </Label>
            <Input
              id="estimatedCompletionDate"
              type="date"
              value={estimatedCompletionDate}
              onChange={(e) => setEstimatedCompletionDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              When do you expect to complete this work?
            </p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium">What happens next?</p>
                <p className="mt-1">
                  The request status will change to "In Progress". You can update the status to "Completed" once the work is finished.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Work"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

