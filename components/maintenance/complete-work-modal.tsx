/**
 * Complete Work Modal Component
 * Allows caretakers/artisans to mark a request as completed with cost breakdown and media
 */

"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Upload, X, DollarSign } from "lucide-react";
import { useUpdateMaintenanceStatus } from "@/lib/hooks/use-caretaker-maintenance";
import { toast } from "sonner";
import type { MaintenanceRequest, CompleteMaintenanceRequest } from "@/lib/api-types";
import { formatCurrency } from "@/lib/api-utils";

interface CompleteWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest | null;
  onSuccess?: () => void;
}

export function CompleteWorkModal({
  isOpen,
  onClose,
  maintenanceRequest,
  onSuccess,
}: CompleteWorkModalProps) {
  const [completionNotes, setCompletionNotes] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [artisanFee, setArtisanFee] = useState("");
  const [additionalExpenses, setAdditionalExpenses] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStatusMutation = useUpdateMaintenanceStatus({
    onSuccess: (data) => {
      toast.success("Work marked as completed", {
        description: "The request has been marked as completed and is awaiting review.",
      });
      resetForm();
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error("Failed to complete work", {
        description: error.message || "An error occurred while marking the request as completed.",
      });
    },
  });

  const resetForm = () => {
    setCompletionNotes("");
    setLaborCost("");
    setMaterialCost("");
    setArtisanFee("");
    setAdditionalExpenses("");
    setMediaFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const labor = parseFloat(laborCost) || 0;
    const material = parseFloat(materialCost) || 0;
    const fee = parseFloat(artisanFee) || 0;
    const expenses = parseFloat(additionalExpenses) || 0;
    return labor + material + fee + expenses;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!maintenanceRequest) return;

    // Calculate total cost
    const totalCost = calculateTotal();

    // Prepare completion data
    const completionData: CompleteMaintenanceRequest = {
      completion_notes: completionNotes || undefined,
      labor_cost: laborCost ? parseFloat(laborCost) : undefined,
      material_cost: materialCost ? parseFloat(materialCost) : undefined,
      artisan_fee: artisanFee ? parseFloat(artisanFee) : undefined,
      additional_expenses: additionalExpenses ? parseFloat(additionalExpenses) : undefined,
      media: mediaFiles.length > 0 ? mediaFiles : undefined,
    };

    // If there's a total cost, include it as actual_cost
    const updateData: any = {
      status: "completed",
      note: completionNotes || "Work completed successfully",
      actual_cost: totalCost > 0 ? totalCost : undefined,
    };

    // Add cost breakdown if any costs are provided
    if (completionData.labor_cost || completionData.material_cost || completionData.artisan_fee || completionData.additional_expenses) {
      updateData.cost_description = `Labor: ${formatCurrency(completionData.labor_cost || 0)}, Materials: ${formatCurrency(completionData.material_cost || 0)}, Fee: ${formatCurrency(completionData.artisan_fee || 0)}, Additional: ${formatCurrency(completionData.additional_expenses || 0)}`;
    }

    // For now, we'll use the updateMaintenanceStatus hook
    // If the backend requires FormData for media, we'll need to handle that separately
    // TODO: Create a dedicated completeMaintenance service method that handles FormData
    
    updateStatusMutation.mutate({
      requestId: maintenanceRequest.id,
      data: updateData,
    });
  };

  if (!maintenanceRequest) return null;

  const isLoading = updateStatusMutation.isPending;
  const totalCost = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark Work as Completed</DialogTitle>
          <DialogDescription>
            Provide completion details, costs, and any photos of the completed work.
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

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="completionNotes">
              Completion Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="completionNotes"
              placeholder="Describe what work was completed, any issues encountered, and the final outcome..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              This information will be visible to the tenant and landlord for review.
            </p>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <Label className="text-base font-semibold">Cost Breakdown</Label>
              <span className="text-gray-500 text-sm">(optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laborCost">Labor Cost</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialCost">Material Cost</Label>
                <Input
                  id="materialCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artisanFee">Artisan Fee</Label>
                <Input
                  id="artisanFee"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={artisanFee}
                  onChange={(e) => setArtisanFee(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalExpenses">Additional Expenses</Label>
                <Input
                  id="additionalExpenses"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={additionalExpenses}
                  onChange={(e) => setAdditionalExpenses(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {totalCost > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-900 dark:text-green-100">Total Cost:</span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-2 border-t pt-4">
            <Label>Photos of Completed Work</Label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>

              {mediaFiles.length > 0 && (
                <div className="space-y-2">
                  {mediaFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload photos showing the completed work. This helps with quality review.
            </p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium">What happens next?</p>
                <p className="mt-1">
                  The request will be marked as "Completed" and sent to the tenant and landlord for review.
                  They can approve the work or request rework if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t pt-4">
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
              disabled={isLoading || !completionNotes.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                "Mark as Completed"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

