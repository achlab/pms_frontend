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
import { useTenantProperties, useTenantPropertyUnits } from "@/lib/hooks/use-tenant-property";
import { formatDateForApi, getFirstValidationError } from "@/lib/api-utils";
import { toast } from "sonner";
import { Upload, X, AlertCircle } from "lucide-react";
import type { MaintenancePriority } from "@/lib/api-types";

interface CreateRequestFormProps {
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
  compact?: boolean; // If true, renders in a more compact format for modals
}

export function CreateRequestForm({ onSuccess, onCancel, compact = false }: CreateRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("normal");
  const [categoryId, setCategoryId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const { data: categoriesData, isLoading: loadingCategories, error: categoriesError } = useMaintenanceCategories();
  const { data: propertiesData, isLoading: loadingProperties, error: propertiesError } = useTenantProperties();
  const { data: unitsData, isLoading: loadingUnits, error: unitsError } = useTenantPropertyUnits(propertyId);
  const { mutate: createRequest, isLoading: creating } = useCreateMaintenanceRequest();

  const categories = categoriesData?.data || [];
  const properties = propertiesData?.data || [];
  const units = unitsData?.data || [];

  // Debug logging
  console.log("Form Debug:", {
    categoriesData,
    categories,
    loadingCategories,
    categoriesError,
    categoriesLength: categories.length,
    propertiesData,
    properties,
    loadingProperties,
    propertiesError,
    propertiesLength: properties.length,
    unitsData,
    units,
    loadingUnits,
    unitsError,
    unitsLength: units.length,
    selectedPropertyId: propertyId,
    selectedUnitId: unitId
  });

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

    if (title.trim().length < 10) {
      toast.error("Title must be at least 10 characters long");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (description.trim().length < 20) {
      toast.error("Description must be at least 20 characters long");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    if (!propertyId) {
      toast.error("Please select a property");
      return;
    }

    // Check if the selected property is in the available properties list
    const selectedProperty = properties.find(p => p.id === propertyId);
    if (!selectedProperty) {
      toast.error("Selected property is not available. Please refresh and try again.");
      return;
    }

    // Validate preferred start date if provided
    if (preferredDate && preferredDate.trim()) {
      const selectedDate = new Date(preferredDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        toast.error("Preferred start date must be tomorrow or later");
        return;
      }
    }

    try {
      const requestData: any = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category_id: categoryId,
        property_id: propertyId,
      };

      // Only include optional fields if they have values
      if (unitId && unitId.trim()) {
        requestData.property_unit_id = unitId.trim();
      }

      if (preferredDate && preferredDate.trim()) {
        requestData.preferred_start_date = preferredDate.trim();
      }

      if (files.length > 0) {
        requestData.media = files;
      }
      
      console.log("🚀 Submitting maintenance request:", requestData);
      
      const result = await createRequest(requestData);

      toast.success("Maintenance request created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("normal");
      setCategoryId("");
      setPropertyId("");
      setUnitId("");
      setPreferredDate("");
      setFiles([]);

      if (onSuccess && result?.data?.id) {
        onSuccess(result.data.id);
      }
    } catch (error) {
      toast.error(getFirstValidationError(error));
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="title">Title *</Label>
              <span className={`text-xs ${title.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                {title.length}/10 min
              </span>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaking kitchen faucet"
              required
              className={title.length > 0 && title.length < 10 ? 'border-red-300' : ''}
            />
            {title.length > 0 && title.length < 10 && (
              <p key="title-validation" className="text-xs text-red-500">Title must be at least 10 characters long</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Description *</Label>
              <span className={`text-xs ${description.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                {description.length}/20 min
              </span>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              required
              className={description.length > 0 && description.length < 20 ? 'border-red-300' : ''}
            />
            {description.length > 0 && description.length < 20 && (
              <p key="description-validation" className="text-xs text-red-500">Description must be at least 20 characters long</p>
            )}
          </div>

          {/* Property */}
          <div className="space-y-2">
            <Label htmlFor="property">Property *</Label>
            <Select 
              value={propertyId} 
              onValueChange={(value) => {
                setPropertyId(value);
                setUnitId(""); // Reset unit when property changes
              }} 
              disabled={loadingProperties}
            >
              <SelectTrigger id="property">
                <SelectValue placeholder={
                  loadingProperties 
                    ? "Loading properties..." 
                    : propertiesError 
                      ? "Error loading properties"
                      : properties.length === 0
                        ? "No properties available"
                        : "Select property"
                } />
              </SelectTrigger>
              <SelectContent>
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))
                ) : !loadingProperties && (
                  <SelectItem key="no-properties" value="no-properties" disabled>
                    {propertiesError ? "Failed to load properties" : "No properties available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {propertiesError && (
              <p key="properties-error" className="text-sm text-red-600 dark:text-red-400">
                Error loading properties. Please refresh the page or contact support.
              </p>
            )}
          </div>

          {/* Unit (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit (Optional)</Label>
            <Select 
              value={unitId} 
              onValueChange={setUnitId} 
              disabled={loadingUnits || !propertyId}
            >
              <SelectTrigger id="unit">
                <SelectValue placeholder={
                  !propertyId
                    ? "Select property first"
                    : loadingUnits 
                      ? "Loading units..." 
                      : unitsError 
                        ? "Error loading units"
                        : units.length === 0
                          ? "No units available"
                          : "Select unit (optional)"
                } />
              </SelectTrigger>
              <SelectContent>
                {units.length > 0 ? (
                  units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      Unit {unit.unit_number}
                      {unit.tenant && ` (${unit.tenant.name})`}
                    </SelectItem>
                  ))
                ) : !loadingUnits && propertyId && (
                  <SelectItem key="no-units" value="no-units" disabled>
                    {unitsError ? "Failed to load units" : "No units available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {unitsError && (
              <p key="units-error" className="text-sm text-red-600 dark:text-red-400">
                Error loading units. Please refresh the page or contact support.
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingCategories}>
              <SelectTrigger id="category">
                <SelectValue placeholder={
                  loadingCategories 
                    ? "Loading categories..." 
                    : categoriesError 
                      ? "Error loading categories"
                      : categories.length === 0
                        ? "No categories available"
                        : "Select category"
                } />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))
                ) : !loadingCategories && (
                  <SelectItem key="no-categories" value="no-categories" disabled>
                    {categoriesError ? "Failed to load categories" : "No categories available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {categoriesError && (
              <p key="categories-error" className="text-sm text-red-600 dark:text-red-400">
                Error loading categories. Please refresh the page or contact support.
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as MaintenancePriority)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="low" value="low">Low</SelectItem>
                <SelectItem key="normal" value="normal">Normal</SelectItem>
                <SelectItem key="urgent" value="urgent">Urgent</SelectItem>
                <SelectItem key="emergency" value="emergency">Emergency</SelectItem>
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
              min={formatDateForApi(new Date(Date.now() + 24 * 60 * 60 * 1000))}
            />
            <p className="text-xs text-gray-500">
              Select a future date (tomorrow or later) when you'd prefer the maintenance to start. Leave empty if no preference.
            </p>
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
                    key={`${file.name}-${index}-${file.size}`}
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
                  Your request will start as <strong>Pending</strong> and be reviewed by your landlord.
                  Once approved, it will be assigned to a caretaker or artisan. You'll receive updates via notifications at each step.
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
  );

  if (compact) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Maintenance Request</CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}

