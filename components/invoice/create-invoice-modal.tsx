/**
 * Create Invoice Modal Component
 * Modal for creating new invoices with full backend integration
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { landlordInvoiceService } from "@/lib/services/landlord-invoice.service";
import { landlordPropertyService } from "@/lib/services/landlord-property.service";
import { formatCurrency, formatDateForApi, getErrorMessage } from "@/lib/api-utils";
import type { 
  CreateInvoiceRequest, 
  InvoiceType, 
  LandlordProperty, 
  LandlordUnit,
  AvailableTenant 
} from "@/lib/api-types";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AdditionalCharge {
  name: string;
  description: string;
  amount: number;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<CreateInvoiceRequest>>({
    invoice_date: formatDateForApi(new Date()),
    due_date: formatDateForApi(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    period_start: formatDateForApi(new Date()),
    period_end: formatDateForApi(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    base_rent_amount: 0,
    invoice_type: "rent" as InvoiceType,
  });

  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([]);
  const [properties, setProperties] = useState<LandlordProperty[]>([]);
  const [units, setUnits] = useState<LandlordUnit[]>([]);
  const [tenants, setTenants] = useState<AvailableTenant[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load properties on mount
  useEffect(() => {
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen]);

  // Load units when property changes
  useEffect(() => {
    if (selectedProperty) {
      loadUnits(selectedProperty);
    } else {
      setUnits([]);
      setSelectedUnit("");
    }
  }, [selectedProperty]);

  // Load tenants when unit changes
  useEffect(() => {
    if (selectedUnit) {
      loadTenants();
      // Set base rent from unit
      const unit = units.find(u => u.id === selectedUnit);
      if (unit) {
        const rentAmount = unit.rental_amount || unit.monthly_rent || 0;
        setFormData(prev => ({
          ...prev,
          base_rent_amount: rentAmount,
          unit_id: selectedUnit,
          property_id: selectedProperty,
        }));
      }
    }
  }, [selectedUnit, units, selectedProperty]);

  const loadProperties = async () => {
    try {
      setIsLoadingData(true);
      const response = await landlordPropertyService.getProperties();
      console.log("Loaded properties:", response.data);
      setProperties(response.data);
    } catch (error) {
      console.error("Failed to load properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadUnits = async (propertyId: string) => {
    try {
      setIsLoadingData(true);
      const response = await landlordPropertyService.getPropertyUnits(propertyId);
      // Show all units - we'll handle tenant selection separately
      setUnits(response.data);
      console.log("Loaded units for property:", propertyId, response.data);
    } catch (error) {
      console.error("Failed to load units:", error);
      toast.error("Failed to load units");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTenants = async () => {
    try {
      setIsLoadingData(true);
      const unit = units.find(u => u.id === selectedUnit);
      
      if (unit) {
        // If unit has tenant data, use it
        if (unit.tenant) {
          setTenants([{
            id: unit.tenant.id,
            name: unit.tenant.name,
            email: unit.tenant.email,
            phone: unit.tenant.phone,
            is_available: true,
          }]);
          setFormData(prev => ({
            ...prev,
            tenant_id: unit.tenant!.id,
          }));
        } else {
          // If no tenant data, try to load all available tenants
          // This would typically be a separate API call
          console.log("Unit has no tenant data, you may need to implement tenant selection");
          setTenants([]);
          toast.info("Please ensure the unit has a tenant assigned before creating an invoice");
        }
      }
    } catch (error) {
      console.error("Failed to load tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setIsLoadingData(false);
    }
  };

  const addAdditionalCharge = () => {
    setAdditionalCharges(prev => [...prev, { name: "", description: "", amount: 0 }]);
  };

  const removeAdditionalCharge = (index: number) => {
    setAdditionalCharges(prev => prev.filter((_, i) => i !== index));
  };

  const updateAdditionalCharge = (index: number, field: keyof AdditionalCharge, value: string | number) => {
    setAdditionalCharges(prev => prev.map((charge, i) => 
      i === index ? { ...charge, [field]: value } : charge
    ));
  };

  const calculateTotal = () => {
    const baseAmount = formData.base_rent_amount || 0;
    const additionalAmount = additionalCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    return baseAmount + additionalAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.tenant_id || !formData.unit_id || !formData.property_id) {
      toast.error("Please select a property, unit, and tenant");
      return;
    }

    if (!formData.base_rent_amount || formData.base_rent_amount <= 0) {
      toast.error("Please enter a valid base rent amount");
      return;
    }

    if (!formData.invoice_date || !formData.due_date || !formData.period_start || !formData.period_end) {
      toast.error("Please fill in all required dates");
      return;
    }

    // Validate dates
    const invoiceDate = new Date(formData.invoice_date);
    const dueDate = new Date(formData.due_date);
    const periodStart = new Date(formData.period_start);
    const periodEnd = new Date(formData.period_end);

    if (dueDate < invoiceDate) {
      toast.error("Due date must be on or after invoice date");
      return;
    }

    if (periodEnd < periodStart) {
      toast.error("Period end date must be on or after period start date");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare additional charges in the format expected by the backend
      const formattedCharges = additionalCharges
        .filter(charge => charge.name.trim() && charge.amount > 0)
        .map(charge => ({
          name: charge.name.trim(),
          description: charge.description.trim() || charge.name.trim(),
          amount: charge.amount,
        }));

      const requestData: CreateInvoiceRequest = {
        tenant_id: formData.tenant_id!,
        unit_id: formData.unit_id!,
        invoice_date: formData.invoice_date!,
        due_date: formData.due_date!,
        period_start: formData.period_start!,
        period_end: formData.period_end!,
        base_rent_amount: formData.base_rent_amount!,
        additional_charges: formattedCharges.length > 0 ? formattedCharges : undefined,
        invoice_type: formData.invoice_type,
        notes: formData.notes?.trim() || undefined,
      };

      await landlordInvoiceService.createInvoice(requestData);

      toast.success("Invoice created successfully!");
      
      // Reset form
      resetForm();
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_date: formatDateForApi(new Date()),
      due_date: formatDateForApi(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      period_start: formatDateForApi(new Date()),
      period_end: formatDateForApi(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      base_rent_amount: 0,
      invoice_type: "rent" as InvoiceType,
    });
    setAdditionalCharges([]);
    setSelectedProperty("");
    setSelectedUnit("");
    setUnits([]);
    setTenants([]);
  };

  const selectedUnitData = units.find(u => u.id === selectedUnit);
  const selectedTenantData = tenants.find(t => t.id === formData.tenant_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for a tenant
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Property, Unit, and Tenant Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property & Tenant Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Property Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="property">Property *</Label>
                    <Select
                      value={selectedProperty}
                      onValueChange={setSelectedProperty}
                      disabled={isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name} - {property.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unit Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select
                      value={selectedUnit}
                      onValueChange={setSelectedUnit}
                      disabled={!selectedProperty || isLoadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedProperty 
                            ? "Select a property first" 
                            : isLoadingData 
                              ? "Loading units..." 
                              : units.length === 0 
                                ? "No units available" 
                                : "Select a unit"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {units.length === 0 ? (
                          <SelectItem value="no-units-available" disabled>
                            {isLoadingData ? "Loading units..." : selectedProperty ? "No units found for this property" : "Select a property first"}
                          </SelectItem>
                        ) : (
                          units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              Unit {unit.unit_number} - {formatCurrency(unit.rental_amount || unit.monthly_rent || 0)}
                              {unit.tenant ? ` (${unit.tenant.name})` : " (Available)"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedProperty && units.length === 0 && !isLoadingData && (
                      <p className="text-sm text-muted-foreground">
                        No units found for this property. Please ensure the property has units configured.
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Details */}
                {selectedUnitData && selectedTenantData && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Selected Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Property:</strong> {properties.find(p => p.id === selectedProperty)?.name}</p>
                        <p><strong>Unit:</strong> {selectedUnitData.unit_number}</p>
                        <p><strong>Monthly Rent:</strong> {formatCurrency(selectedUnitData.rental_amount || selectedUnitData.monthly_rent || 0)}</p>
                      </div>
                      <div>
                        <p><strong>Tenant:</strong> {selectedTenantData.name}</p>
                        <p><strong>Email:</strong> {selectedTenantData.email}</p>
                        <p><strong>Phone:</strong> {selectedTenantData.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Invoice Date */}
                  <div className="space-y-2">
                    <Label htmlFor="invoice_date">Invoice Date *</Label>
                    <Input
                      id="invoice_date"
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Period Start */}
                  <div className="space-y-2">
                    <Label htmlFor="period_start">Billing Period Start *</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={formData.period_start}
                      onChange={(e) => setFormData(prev => ({ ...prev, period_start: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Period End */}
                  <div className="space-y-2">
                    <Label htmlFor="period_end">Billing Period End *</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={formData.period_end}
                      onChange={(e) => setFormData(prev => ({ ...prev, period_end: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Invoice Type */}
                  <div className="space-y-2">
                    <Label htmlFor="invoice_type">Invoice Type</Label>
                    <Select
                      value={formData.invoice_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, invoice_type: value as InvoiceType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Base Rent Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="base_rent_amount">Base Rent Amount *</Label>
                    <Input
                      id="base_rent_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.base_rent_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_rent_amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Charges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Additional Charges
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdditionalCharge}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Charge
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {additionalCharges.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No additional charges. Click "Add Charge" to add utilities, fees, or other charges.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {additionalCharges.map((charge, index) => (
                      <div key={`additional-charge-${index}`} className="flex items-end gap-4 p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Label>Charge Name</Label>
                          <Input
                            value={charge.name}
                            onChange={(e) => updateAdditionalCharge(index, "name", e.target.value)}
                            placeholder="e.g., Water Bill, Service Charge"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={charge.description}
                            onChange={(e) => updateAdditionalCharge(index, "description", e.target.value)}
                            placeholder="Optional description"
                          />
                        </div>
                        <div className="w-32 space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={charge.amount}
                            onChange={(e) => updateAdditionalCharge(index, "amount", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAdditionalCharge(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total Calculation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Invoice Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Rent:</span>
                    <span>{formatCurrency(formData.base_rent_amount || 0)}</span>
                  </div>
                  {additionalCharges
                    .filter(charge => charge.name && charge.amount > 0)
                    .map((charge, index) => (
                      <div key={`charge-${index}-${charge.name}`} className="flex justify-between text-sm">
                        <span>{charge.name}:</span>
                        <span>{formatCurrency(charge.amount)}</span>
                      </div>
                    ))}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or instructions for this invoice..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.tenant_id || !formData.unit_id}>
              {isLoading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
