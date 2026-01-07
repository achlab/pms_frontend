/**
 * Review Completion Modal Component
 * Allows tenants and landlords to review completed maintenance work
 * - Approve/reject completion
 * - Rate quality (1-5 stars) - tenants only
 * - Provide feedback
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Star, CheckCircle, XCircle, Image as ImageIcon, DollarSign } from "lucide-react";
import { useReviewCompletion } from "@/lib/hooks/use-maintenance";
import { toast } from "sonner";
import type { MaintenanceRequest } from "@/lib/api-types";
import { formatCurrency, formatDate } from "@/lib/api-utils";
import { useAuth } from "@/contexts/auth-context";

interface ReviewCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest | null;
  onSuccess?: () => void;
}

export function ReviewCompletionModal({
  isOpen,
  onClose,
  maintenanceRequest,
  onSuccess,
}: ReviewCompletionModalProps) {
  // Always call hooks first, before any conditional returns
  const { user } = useAuth();
  const isTenant = user?.role === "tenant";
  const isLandlord = user?.role === "landlord" || user?.role === "super_admin";

  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const reviewMutation = useReviewCompletion();

  // Now we can do conditional logic after hooks

  const resetForm = () => {
    setAction(null);
    setRating(0);
    setHoveredRating(0);
    setFeedback("");
    setRejectionReason("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!maintenanceRequest || !action) return;

    // Validation
    if (action === "reject" && rejectionReason.trim().length < 10) {
      toast.error("Rejection reason required", {
        description: "Please provide a detailed reason for rejection (minimum 10 characters).",
      });
      return;
    }

    if (action === "approve" && isTenant && rating === 0) {
      toast.error("Rating required", {
        description: "Please provide a rating when approving completion.",
      });
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        requestId: maintenanceRequest.id,
        data: {
          approved: action === "approve",
          rating: action === "approve" && isTenant ? rating : undefined,
          feedback: feedback.trim() || undefined,
          rejection_reason: action === "reject" ? rejectionReason.trim() : undefined,
        },
      });

      toast.success(
        action === "approve" ? "Completion approved" : "Completion rejected",
        {
          description:
            action === "approve"
              ? "The work has been approved. The request will be closed once both parties approve."
              : "The work has been rejected. The caretaker/artisan will be notified to redo the work.",
        }
      );

      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error("Failed to review completion", {
        description: error.message || "An error occurred while submitting your review.",
      });
    }
  };

  const isLoading = reviewMutation.isPending;
  const canSubmit =
    action &&
    (action === "approve"
      ? (isTenant ? rating > 0 : true)
      : rejectionReason.trim().length >= 10);

  // Check if already reviewed by this user
  const alreadyReviewedByTenant =
    isTenant && maintenanceRequest.completion_approved_by_tenant !== null;
  const alreadyReviewedByLandlord =
    isLandlord && maintenanceRequest.completion_approved_by_landlord !== null;

  const alreadyReviewed = isTenant ? alreadyReviewedByTenant : alreadyReviewedByLandlord;

  // Render nothing if no maintenance request
  if (!maintenanceRequest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Completed Work</DialogTitle>
          <DialogDescription>
            {isTenant
              ? "Please review the completed work and provide your feedback."
              : "Review the completed maintenance work and approve or reject it."}
          </DialogDescription>
        </DialogHeader>

        {alreadyReviewed ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">Already Reviewed</p>
                  <p className="mt-1">
                    {isTenant
                      ? "You have already reviewed this completion."
                      : "You have already reviewed this completion."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {maintenanceRequest.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Request #{maintenanceRequest.request_number || maintenanceRequest.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Property</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {maintenanceRequest.property?.name}
                  </p>
                </div>
                {maintenanceRequest.unit && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Unit</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {maintenanceRequest.unit.unit_number}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Completion Details */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Completion Details</h3>

              {/* Completion Notes */}
              {maintenanceRequest.completion_notes && (
                <div>
                  <Label className="text-sm font-medium">Completion Notes</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {maintenanceRequest.completion_notes}
                  </p>
                </div>
              )}

              {/* Cost Breakdown */}
              {(maintenanceRequest.labor_cost ||
                maintenanceRequest.material_cost ||
                maintenanceRequest.artisan_fee ||
                maintenanceRequest.additional_expenses) && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4" />
                    Cost Breakdown
                  </Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2 text-sm">
                    {maintenanceRequest.labor_cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Labor Cost:</span>
                        <span className="font-medium">{formatCurrency(maintenanceRequest.labor_cost)}</span>
                      </div>
                    )}
                    {maintenanceRequest.material_cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Material Cost:</span>
                        <span className="font-medium">{formatCurrency(maintenanceRequest.material_cost)}</span>
                      </div>
                    )}
                    {maintenanceRequest.artisan_fee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Artisan Fee:</span>
                        <span className="font-medium">{formatCurrency(maintenanceRequest.artisan_fee)}</span>
                      </div>
                    )}
                    {maintenanceRequest.additional_expenses && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Additional Expenses:</span>
                        <span className="font-medium">
                          {formatCurrency(maintenanceRequest.additional_expenses)}
                        </span>
                      </div>
                    )}
                    {maintenanceRequest.actual_cost && (
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-900 dark:text-white">Total Cost:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(maintenanceRequest.actual_cost)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completion Media */}
              {maintenanceRequest.media && maintenanceRequest.media.length > 0 && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4" />
                    Completion Photos
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {maintenanceRequest.media.map((media, index) => (
                      <img
                        key={index}
                        src={media.url || media.path || "/placeholder.svg"}
                        alt={`Completion photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Date */}
              {maintenanceRequest.completed_at && (
                <div>
                  <Label className="text-sm font-medium">Completed On</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {formatDate(maintenanceRequest.completed_at)}
                  </p>
                </div>
              )}
            </div>

            {/* Action Selection */}
            <div className="space-y-4 border-t pt-4">
              <Label className="text-base font-semibold">Your Review</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={action === "approve" ? "default" : "outline"}
                  onClick={() => setAction("approve")}
                  disabled={isLoading}
                  className={`flex-1 ${
                    action === "approve"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant={action === "reject" ? "default" : "outline"}
                  onClick={() => setAction("reject")}
                  disabled={isLoading}
                  className={`flex-1 ${
                    action === "reject"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : ""
                  }`}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>

            {/* Rating (Tenants only, when approving) */}
            {isTenant && action === "approve" && (
              <div className="space-y-2">
                <Label>
                  Rate the Quality <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={isLoading}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {rating} {rating === 1 ? "star" : "stars"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  How satisfied are you with the completed work?
                </p>
              </div>
            )}

            {/* Feedback (Optional) */}
            {action === "approve" && (
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Feedback <span className="text-gray-500">(optional)</span>
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts about the completed work..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Rejection Reason (Required when rejecting) */}
            {action === "reject" && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please provide a detailed reason for rejecting this completion (minimum 10 characters)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  required
                  disabled={isLoading}
                  className={rejectionReason.length > 0 && rejectionReason.length < 10 ? "border-red-300" : ""}
                />
                {rejectionReason.length > 0 && rejectionReason.length < 10 && (
                  <p className="text-xs text-red-500">
                    Please provide at least 10 characters ({rejectionReason.length}/10)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  This reason will be shared with the caretaker/artisan to help them improve the work.
                </p>
              </div>
            )}

            {/* Info Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">What happens next?</p>
                  <p className="mt-1">
                    {action === "approve"
                      ? isTenant
                        ? "Your approval will be recorded. The request will be closed once the landlord also approves."
                        : "Your approval will be recorded. The request will be closed once the tenant also approves (or you can override)."
                      : "The work will be marked as 'Rework Required' and the caretaker/artisan will be notified to fix the issues."}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !canSubmit}
                className={
                  action === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {action === "approve" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Completion
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Completion
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

