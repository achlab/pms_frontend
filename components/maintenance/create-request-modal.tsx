/**
 * Create Maintenance Request Modal
 * Modal version of the create maintenance request form for tenants
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateRequestForm } from "./create-request-form";
import { X } from "lucide-react";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (requestId: string) => void;
}

export function CreateRequestModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (requestId: string) => {
    setIsSubmitting(false);
    onSuccess?.(requestId);
    onClose();
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Maintenance Request</DialogTitle>
          <DialogDescription>
            Submit a new maintenance request for your property. Your request will be reviewed by your landlord.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <CreateRequestForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            compact={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

