/**
 * Create Maintenance Request Form Component
 * Form for creating new maintenance requests with file upload
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateMaintenanceRequest, useMaintenanceCategories } from "@/lib/hooks/use-maintenance";
import { formatDateForApi, getErrorMessage } from "@/lib/api-utils";
import { toast } from "sonner";
import { Upload, X, AlertCircle } from "lucide-react";
import type { MaintenancePriority } from "@/lib/api-types";

interface CreateRequestFormProps {
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

export function CreateRequestForm({ onSuccess, onCancel }: CreateRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("normal");
  const [categoryId, setCategoryId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const { data: categoriesData, isLoading: loadingCategories } = useMaintenanceCategories();
  const { mutate: createRequest, isLoading: creating } = useCreateMaintenanceRequest();

  const categories = categoriesData?.data || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      const result = await createRequest({
        title: title.trim(),
        description: description.trim(),
        priority,
        category_id: categoryId,
        preferred_start_date: preferredDate || undefined,
        media: files.length > 0 ? files : undefined,
      });

      toast.success("Maintenance request created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("normal");
      setCategoryId("");
      setPreferredDate("");
      setFiles([]);

      if (onSuccess && result?.data?.id) {
        onSuccess(result.data.id);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Maintenance Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaking kitchen faucet"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingCategories}>
              <SelectTrigger id="category">
                <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as MaintenancePriority)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Start Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Preferred Start Date (Optional)</Label>
            <Input
              id="date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={formatDateForApi(new Date())}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images or videos
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB per file
                </p>
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium">What happens next?</p>
                <p className="mt-1">
                  Your request will be reviewed by your landlord and assigned to a caretaker.
                  You'll receive updates via notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={creating}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={creating || loadingCategories} className="flex-1">
              {creating ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

