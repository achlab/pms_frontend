/**
 * Bulk Operations Component
 * Allows landlords to perform bulk actions on multiple maintenance requests
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  X,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { MaintenanceStatus, MaintenancePriority } from "@/lib/api-types";
import { toast } from "sonner";

interface BulkOperationsProps {
  selectedRequests: string[];
  onClose: () => void;
  onBulkAssign?: (requestIds: string[], assigneeId: string, assigneeType: string, note?: string) => Promise<void>;
  onBulkStatusUpdate?: (requestIds: string[], status: MaintenanceStatus, note?: string) => Promise<void>;
  onBulkPriorityUpdate?: (requestIds: string[], priority: MaintenancePriority) => Promise<void>;
  assignees?: Array<{ id: string; name: string; type: "caretaker" | "artisan" | "landlord" }>;
}

export function BulkOperations({
  selectedRequests,
  onClose,
  onBulkAssign,
  onBulkStatusUpdate,
  onBulkPriorityUpdate,
  assignees = [],
}: BulkOperationsProps) {
  const [action, setAction] = useState<"assign" | "status" | "priority" | null>(null);
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [assigneeType, setAssigneeType] = useState<"caretaker" | "artisan" | "landlord">("caretaker");
  const [status, setStatus] = useState<MaintenanceStatus | "">("");
  const [priority, setPriority] = useState<MaintenancePriority | "">("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedRequests.length === 0) {
      toast.error("No requests selected");
      return;
    }

    setIsLoading(true);
    try {
      if (action === "assign" && onBulkAssign) {
        if (!assigneeId) {
          toast.error("Please select an assignee");
          setIsLoading(false);
          return;
        }
        await onBulkAssign(selectedRequests, assigneeId, assigneeType, note || undefined);
        toast.success(`Assigned ${selectedRequests.length} request(s) successfully`);
      } else if (action === "status" && onBulkStatusUpdate) {
        if (!status) {
          toast.error("Please select a status");
          setIsLoading(false);
          return;
        }
        await onBulkStatusUpdate(selectedRequests, status, note || undefined);
        toast.success(`Updated status for ${selectedRequests.length} request(s)`);
      } else if (action === "priority" && onBulkPriorityUpdate) {
        if (!priority) {
          toast.error("Please select a priority");
          setIsLoading(false);
          return;
        }
        await onBulkPriorityUpdate(selectedRequests, priority);
        toast.success(`Updated priority for ${selectedRequests.length} request(s)`);
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to perform bulk operation");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit =
    action &&
    ((action === "assign" && assigneeId) ||
      (action === "status" && status) ||
      (action === "priority" && priority));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Operations</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedRequests.length} selected request(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Select Action</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={action === "assign" ? "default" : "outline"}
                size="sm"
                onClick={() => setAction("assign")}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Assign
              </Button>
              <Button
                variant={action === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => setAction("status")}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Status
              </Button>
              <Button
                variant={action === "priority" ? "default" : "outline"}
                size="sm"
                onClick={() => setAction("priority")}
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Priority
              </Button>
            </div>
          </div>

          {/* Assign Action */}
          {action === "assign" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assignee Type</Label>
                <Select value={assigneeType} onValueChange={(v: any) => setAssigneeType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caretaker">Caretaker</SelectItem>
                    <SelectItem value="artisan">Artisan</SelectItem>
                    <SelectItem value="landlord">Landlord</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Assignee</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees
                      .filter((a) => a.type === assigneeType)
                      .map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Status Action */}
          {action === "status" && (
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rework_required">Rework Required</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority Action */}
          {action === "priority" && (
            <div className="space-y-2">
              <Label>New Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Note (for assign and status) */}
          {(action === "assign" || action === "status") && (
            <div className="space-y-2">
              <Label htmlFor="note">
                Note <span className="text-gray-500">(optional)</span>
              </Label>
              <Textarea
                id="note"
                placeholder="Add a note for this bulk action..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-900 dark:text-yellow-100">
                <p className="font-medium">Bulk Action Warning</p>
                <p className="mt-1">
                  This action will be applied to all {selectedRequests.length} selected request(s).
                  This cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Apply to {selectedRequests.length} Request(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

