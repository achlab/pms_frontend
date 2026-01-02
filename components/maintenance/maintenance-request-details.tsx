/**
 * Maintenance Request Details Component
 * Displays detailed information about a maintenance request including timeline
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useMarkMaintenanceResolution } from "@/lib/hooks/use-maintenance";
import { formatDate } from "@/lib/utils";
import {
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import type { MaintenanceRequest } from "@/lib/api-types";
import { toast } from "@/hooks/use-toast";

interface MaintenanceRequestDetailsProps {
  request: MaintenanceRequest;
  onUpdate?: () => void;
  onClose?: () => void;
}

export function MaintenanceRequestDetails({
  request,
  onUpdate,
  onClose,
}: MaintenanceRequestDetailsProps) {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const markResolutionMutation = useMarkMaintenanceResolution();
  const statusColors: Record<string, string> = {
    received: "bg-blue-500",
    assigned: "bg-purple-500",
    in_progress: "bg-yellow-500",
    pending_approval: "bg-orange-500",
    approved: "bg-green-500",
    resolved: "bg-green-600",
    closed: "bg-gray-500",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-500",
    normal: "bg-blue-500",
    urgent: "bg-orange-500",
    emergency: "bg-red-500",
  };

  const getStatusColor = (status: string) => statusColors[status] || "bg-gray-500";
  const getPriorityColor = (priority: string) => priorityColors[priority] || "bg-gray-500";

  // Handler for adding photos
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...filesArray]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handler for marking as resolved/unresolved
  const handleMarkResolution = async (isResolved: boolean) => {
    // Validate: If marking as unresolved, reason is required
    if (!isResolved && !note.trim()) {
      toast({
        title: "⚠️ Reason Required",
        description: "Please provide a reason for marking the work as unresolved.",
        variant: "destructive",
      });
      return;
    }

    try {
      await markResolutionMutation.mutateAsync({
        requestId: request.id,
        isResolved,
        resolutionNote: note.trim() || undefined,
        photos: photos.length > 0 ? photos : undefined,
      });

      toast({
        title: isResolved ? "✅ Marked as Resolved" : "❌ Marked as Unresolved",
        description: isResolved 
          ? "Thank you! The work has been completed successfully."
          : "The caretaker and landlord have been notified to review and fix the issues.",
      });

      // Reset form
      setNote("");
      setPhotos([]);

      // Trigger parent refresh
      onUpdate?.();

      // Close modal after successful resolution
      setTimeout(() => {
        onClose?.();
      }, 1000); // Small delay to show success message

    } catch (error: any) {
      toast({
        title: "❌ Failed",
        description: error.message || "Failed to update resolution status",
        variant: "destructive",
      });
    }
  };

  // Check if user is the tenant who submitted the request
  const canMarkResolution = user?.role === 'tenant' && request.tenant?.id === user.id;

  // Check if request can be marked as resolved (must be approved or in_progress)
  const canResolve = canMarkResolution && ['approved', 'in_progress', 'assigned'].includes(request.status);

  // Check if request can be reopened (must be resolved)
  const canReopen = canMarkResolution && request.status === 'resolved';

  // Find the latest rejection event if status is rejected
  const rejectionEvent = request.status === 'rejected' 
    ? request.events?.filter(e => e.event_type === 'rejected').sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    : null;

  // Find the latest approval event if status is approved
  const approvalEvent = request.status === 'approved' 
    ? request.events?.filter(e => e.event_type === 'approved').sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
    : null;

  return (
    <div className="space-y-4">
      {/* Rejection Alert - Show prominently at the top */}
      {request.status === 'rejected' && rejectionEvent && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  ❌ Request Rejected
                </h3>
                <p className="text-sm text-red-800 mb-2">
                  Your maintenance request was rejected by the landlord.
                </p>
                {rejectionEvent.rejection_reason && (
                  <div className="mt-3 p-3 bg-white/50 rounded border border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-1">Reason:</p>
                    <p className="text-sm text-red-800">{rejectionEvent.rejection_reason}</p>
                  </div>
                )}
                <p className="text-xs text-red-700 mt-2">
                  Rejected on {formatDate(rejectionEvent.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Success Banner */}
      {request.status === 'approved' && approvalEvent && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  ✅ Request Approved
                </h3>
                <p className="text-sm text-green-800">
                  Your maintenance request has been approved and will be scheduled soon.
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Approved on {formatDate(approvalEvent.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tenant Action Buttons */}
      {canResolve && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Work Completed?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Has the maintenance work been completed to your satisfaction?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unified Form */}
            <div className="space-y-4 p-4 bg-white rounded-lg border">
              {/* Note/Reason Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Comments / Feedback
                  <span className="text-xs text-muted-foreground ml-2">
                    (Required if marking as unresolved)
                  </span>
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Optional: Add comments about the completed work, or explain what issues remain if marking as unresolved..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Add Photos
                  <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="resolution-photos"
                />
                <label
                  htmlFor="resolution-photos"
                  className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Upload photos</span>
                </label>
                
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {photos.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="w-20 h-20 rounded border overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => handleMarkResolution(true)}
                  disabled={markResolutionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {markResolutionMutation.isPending ? "Submitting..." : "✅ Resolved"}
                </Button>
                
                <Button
                  onClick={() => handleMarkResolution(false)}
                  disabled={markResolutionMutation.isPending}
                  variant="destructive"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {markResolutionMutation.isPending ? "Submitting..." : "❌ Unresolved"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reopen Option for Already Resolved Requests */}
      {canReopen && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">
                    Issue Not Actually Resolved?
                  </h3>
                  <p className="text-sm text-orange-800">
                    If the problem has returned or was not properly fixed, you can reopen this request.
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => handleMarkResolution(false)}
                disabled={markResolutionMutation.isPending}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {markResolutionMutation.isPending ? "Reopening..." : "🔄 Reopen Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

