/**
 * Add Note Modal Component
 * Modal for adding notes/comments to maintenance requests
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAddMaintenanceNote } from "@/lib/hooks/use-maintenance";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-utils";

interface AddNoteModalProps {
  requestId: string;
  requestNumber: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddNoteModal({
  requestId,
  requestNumber,
  open,
  onClose,
  onSuccess,
}: AddNoteModalProps) {
  const [note, setNote] = useState("");
  const { mutate: addNote, isLoading } = useAddMaintenanceNote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim()) {
      toast.error("Please enter a note");
      return;
    }

    try {
      await addNote({
        requestId,
        note: note.trim(),
      });

      toast.success("Note added successfully!");
      setNote("");
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleClose = () => {
    setNote("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a comment or note to request {requestNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note *</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter your comment or note..."
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your note will be visible to the property manager and caretakers.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

