"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { CreateInvoiceModal } from "./create-invoice-modal";
import { RecordPaymentModal } from "../payment/record-payment-modal";
import { SelectInvoiceModal } from "../payment/select-invoice-modal";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Calendar,
  RefreshCw,
  CreditCard,
  Eye,
  Paperclip,
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import { landlordInvoiceService } from "@/lib/services/landlord-invoice.service";
import { caretakerInvoiceService } from "@/lib/services/caretaker-invoice.service";
import { landlordPropertyService } from "@/lib/services/landlord-property.service";
import { caretakerPropertyService } from "@/lib/services/caretaker-property.service";
import { paymentService } from "@/lib/services/payment.service";
import type { Invoice, InvoiceStatistics, BulkInvoiceGenerationRequest, InvoiceStatus, InvoiceType, LandlordProperty, CaretakerProperty, PaymentEvidence, PaymentMethod } from "@/lib/api-types";
import { InvoicePaymentHistoryModal } from "@/components/payments/invoice-payment-history-modal";
import { buildInvoiceSummary } from "@/lib/utils/invoice-summary";

interface InvoiceDashboardProps {
  userRole: "landlord" | "caretaker" | "tenant";
}

export function InvoiceDashboard({ userRole }: InvoiceDashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statistics, setStatistics] = useState<InvoiceStatistics | null>(null);
  const [properties, setProperties] = useState<(LandlordProperty | CaretakerProperty)[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  // Bulk generation modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  
  // Create invoice modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Record payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string>("");
  const [selectedInvoiceBalance, setSelectedInvoiceBalance] = useState<number>(0);
  const [recordPaymentDefaults, setRecordPaymentDefaults] = useState<{
    amount?: number;
    payment_method?: PaymentMethod;
    payment_reference?: string;
    payment_date?: string;
    notes?: string;
  } | null>(null);
  const [pendingEvidenceId, setPendingEvidenceId] = useState<string | null>(null);
  
  // Select invoice modal
  const [isSelectInvoiceModalOpen, setIsSelectInvoiceModalOpen] = useState(false);
  const [bulkGenerationData, setBulkGenerationData] = useState<Partial<BulkInvoiceGenerationRequest>>({
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [showInvoicePaymentsModal, setShowInvoicePaymentsModal] = useState(false);
  const [historyInvoiceId, setHistoryInvoiceId] = useState<string | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [generationMode, setGenerationMode] = useState<"properties" | "units">("properties");

  // Payment evidence tracking (landlord)
  const [pendingEvidence, setPendingEvidence] = useState<PaymentEvidence[]>([]);
  const [processedEvidence, setProcessedEvidence] = useState<PaymentEvidence[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<PaymentEvidence | null>(null);
  const [isEvidenceReadonly, setIsEvidenceReadonly] = useState(false);

  const summaryMetrics = useMemo(
    () => buildInvoiceSummary(invoices, statistics ?? undefined),
    [invoices, statistics]
  );
  const collectionRateDisplay = Number.isFinite(summaryMetrics.collectionRate)
    ? summaryMetrics.collectionRate
    : 0;

  // Get appropriate services based on user role
  const getInvoiceService = useCallback(() => {
    switch (userRole) {
      case "landlord":
        return landlordInvoiceService;
      case "caretaker":
        return caretakerInvoiceService;
      default:
        return landlordInvoiceService; // fallback
    }
  }, [userRole]);

  const getPropertyService = useCallback(() => {
    switch (userRole) {
      case "landlord":
        return landlordPropertyService;
      case "caretaker":
        return caretakerPropertyService;
      default:
        return landlordPropertyService; // fallback
    }
  }, [userRole]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const invoiceService = getInvoiceService();
      const propertyService = getPropertyService();
      
      const [invoicesResponse, statisticsResponse, propertiesResponse] = await Promise.allSettled([
        invoiceService.getInvoices({
          status: statusFilter !== "all" ? statusFilter : undefined,
          invoice_type: typeFilter !== "all" ? typeFilter : undefined,
          search: searchQuery || undefined,
          start_date: dateRange.start?.toISOString().split('T')[0],
          end_date: dateRange.end?.toISOString().split('T')[0],
        }),
        invoiceService.getStatistics(),
        propertyService.getProperties()
      ]);

      if (invoicesResponse.status === "fulfilled") {
        setInvoices(invoicesResponse.value.data);
      } else {
        console.error("Failed to load invoices:", invoicesResponse.reason);
        toast.error("Failed to load invoices");
      }

      if (statisticsResponse.status === "fulfilled") {
        setStatistics(statisticsResponse.value.data);
      } else {
        console.error("Failed to load statistics:", statisticsResponse.reason);
        toast.error("Failed to load statistics");
      }

      if (propertiesResponse.status === "fulfilled") {
        setProperties(propertiesResponse.value.data);
      } else {
        console.error("Failed to load properties:", propertiesResponse.reason);
        toast.error("Failed to load properties");
      }

    } catch (error) {
      console.error("Error loading invoice data:", error);
      toast.error("Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  }, [getInvoiceService, getPropertyService, statusFilter, typeFilter, searchQuery, dateRange]);

  const fetchPaymentEvidence = useCallback(async () => {
    if (userRole !== "landlord") return;
    setEvidenceLoading(true);
    try {
      const [pendingResp, processedResp] = await Promise.all([
        paymentService.getPaymentEvidence({ status: "pending" }),
        paymentService.getPaymentEvidence({ status: "approved" }),
      ]);

      console.log("📥 Pending evidence:", pendingResp);
      console.log("📥 Processed evidence:", processedResp);

      setPendingEvidence(pendingResp.data || []);
      setProcessedEvidence(processedResp.data || []);
    } catch (error) {
      console.error("Failed to load payment evidence:", error);
      toast.error("Failed to load payment evidence");
    } finally {
      setEvidenceLoading(false);
    }
  }, [userRole]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Data refreshed successfully");
  }, [loadData]);

  // Handle record payment
  const handleRecordPayment = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setPendingEvidenceId(null);
      setRecordPaymentDefaults(null);
      setSelectedInvoiceId(invoiceId);
      setSelectedInvoiceNumber(invoice.invoice_number);
      setSelectedInvoiceBalance(invoice.outstanding_balance);
      setIsPaymentModalOpen(true);
    }
  };

  // Handle select invoice for payment
  const handleSelectInvoiceForPayment = (invoice: any) => {
    setPendingEvidenceId(null);
    setRecordPaymentDefaults(null);
    setSelectedInvoiceId(invoice.id);
    setSelectedInvoiceNumber(invoice.invoice_number);
    setSelectedInvoiceBalance(invoice.outstanding_balance);
    setIsPaymentModalOpen(true);
  };

  const handleViewInvoicePayments = (invoiceId: string) => {
    setHistoryInvoiceId(invoiceId);
    setShowInvoicePaymentsModal(true);
  };

  const handleReviewEvidence = (evidence: PaymentEvidence) => {
    setSelectedEvidence(evidence);
    setIsEvidenceReadonly(evidence.status !== "pending");
    setEvidenceModalOpen(true);
  };

  const handleApproveEvidence = (evidence: PaymentEvidence) => {
    setEvidenceModalOpen(false);

    if (!evidence.invoice?.id) {
      toast.error("Invoice information is missing for this evidence.");
      return;
    }

    setRecordPaymentDefaults({
      amount: evidence.amount,
      payment_method: evidence.payment_method,
      payment_reference: evidence.reference_number,
      payment_date: evidence.payment_date,
      notes: evidence.notes,
    });

    setPendingEvidenceId(evidence.id);
    setSelectedInvoiceId(evidence.invoice.id);
    setSelectedInvoiceNumber(evidence.invoice.invoice_number);
    setSelectedInvoiceBalance(
      evidence.invoice.outstanding_balance ??
        evidence.invoice.total_amount ??
        evidence.amount
    );
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = useCallback(async () => {
    await refreshData();
    if (pendingEvidenceId) {
      try {
        const response = await paymentService.approvePaymentEvidence(pendingEvidenceId);
        console.log("✅ Payment evidence approved:", response);
        toast.success("Payment evidence approved");
        await fetchPaymentEvidence();
      } catch (error) {
        console.error("Failed to approve payment evidence:", error);
        toast.error("Payment recorded, but evidence approval failed");
      } finally {
        setPendingEvidenceId(null);
        setRecordPaymentDefaults(null);
      }
    }
  }, [pendingEvidenceId, refreshData, fetchPaymentEvidence]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetchPaymentEvidence();
  }, [fetchPaymentEvidence]);

  // Load units for selected properties
  const loadUnitsForProperties = useCallback(async (propertyIds: string[]) => {
    if (propertyIds.length === 0) {
      setAvailableUnits([]);
      return;
    }

    try {
      const propertyService = getPropertyService();
      const unitsPromises = propertyIds.map(propertyId => 
        propertyService.getPropertyUnits(propertyId)
      );
      
      const unitsResponses = await Promise.allSettled(unitsPromises);
      const allUnits: any[] = [];
      
      unitsResponses.forEach((response, index) => {
        if (response.status === "fulfilled") {
          const units = response.value.data.map((unit: any) => ({
            ...unit,
            property_name: properties.find(p => p.id === propertyIds[index])?.name || 'Unknown Property'
          }));
          allUnits.push(...units);
        }
      });
      
      setAvailableUnits(allUnits);
    } catch (error) {
      console.error("Error loading units:", error);
      toast.error("Failed to load units");
    }
  }, [getPropertyService, properties]);

  // Handle property selection change
  const handlePropertySelectionChange = (propertyIds: string[]) => {
    setSelectedPropertyIds(propertyIds);
    setBulkGenerationData(prev => ({
      ...prev,
      property_ids: propertyIds,
      unit_ids: undefined // Clear unit selection when properties change
    }));
    setSelectedUnitIds([]);
    
    if (generationMode === "units") {
      loadUnitsForProperties(propertyIds);
    }
  };

  // Handle unit selection change
  const handleUnitSelectionChange = (unitIds: string[]) => {
    setSelectedUnitIds(unitIds);
    setBulkGenerationData(prev => ({
      ...prev,
      unit_ids: unitIds,
      property_ids: undefined // Clear property selection when units are selected
    }));
  };

  // Handle generation mode change
  const handleGenerationModeChange = (mode: "properties" | "units") => {
    setGenerationMode(mode);
    if (mode === "properties") {
      setBulkGenerationData(prev => ({
        ...prev,
        property_ids: selectedPropertyIds,
        unit_ids: undefined
      }));
      setSelectedUnitIds([]);
      setAvailableUnits([]);
    } else {
      setBulkGenerationData(prev => ({
        ...prev,
        unit_ids: selectedUnitIds,
        property_ids: undefined
      }));
      if (selectedPropertyIds.length > 0) {
        loadUnitsForProperties(selectedPropertyIds);
      }
    }
  };

  // Bulk generate invoices
  const handleBulkGenerate = async () => {
    if (userRole !== "landlord") {
      toast.error("Only landlords can generate invoices");
      return;
    }

    try {
      const hasPropertySelection = generationMode === "properties" && selectedPropertyIds.length > 0;
      const hasUnitSelection = generationMode === "units" && selectedUnitIds.length > 0;
      
      if (!hasPropertySelection && !hasUnitSelection) {
        toast.error(`Please select ${generationMode === "properties" ? "properties" : "units"}`);
        return;
      }

      if (!bulkGenerationData.invoice_date || !bulkGenerationData.due_date || 
          !bulkGenerationData.period_start || !bulkGenerationData.period_end) {
        toast.error("Please fill in all required dates");
        return;
      }

      const requestData: BulkInvoiceGenerationRequest = {
        ...bulkGenerationData,
        property_ids: generationMode === "properties" ? selectedPropertyIds : undefined,
        unit_ids: generationMode === "units" ? selectedUnitIds : undefined,
      } as BulkInvoiceGenerationRequest;

      const response = await landlordInvoiceService.bulkGenerate(requestData);
      
      toast.success(`Successfully generated ${response.data.length} invoices`);
      setBulkModalOpen(false);
      
      // Reset form
      setSelectedPropertyIds([]);
      setSelectedUnitIds([]);
      setAvailableUnits([]);
      setBulkGenerationData({
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      
      await refreshData();
      
    } catch (error) {
      console.error("Error generating invoices:", error);
      toast.error("Failed to generate invoices");
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      case "partially_paid":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDateDisplay = (date?: string) => {
    if (!date) {
      return "Unknown date";
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return "Unknown date";
    }
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "mtn_momo":
        return "MTN Momo";
      case "vodafone_cash":
        return "Vodafone Cash";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and billing for your properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {userRole === "landlord" && (
            <>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button
                onClick={() => setIsSelectInvoiceModalOpen(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
              <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Bulk Generate
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bulk Generate Invoices</DialogTitle>
                  <DialogDescription>
                    Generate invoices for multiple properties or units at once
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invoice_date">Invoice Date</Label>
                      <Input
                        id="invoice_date"
                        type="date"
                        value={bulkGenerationData.invoice_date}
                        onChange={(e) => setBulkGenerationData(prev => ({
                          ...prev,
                          invoice_date: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={bulkGenerationData.due_date}
                        onChange={(e) => setBulkGenerationData(prev => ({
                          ...prev,
                          due_date: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="period_start">Period Start</Label>
                      <Input
                        id="period_start"
                        type="date"
                        value={bulkGenerationData.period_start}
                        onChange={(e) => setBulkGenerationData(prev => ({
                          ...prev,
                          period_start: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="period_end">Period End</Label>
                      <Input
                        id="period_end"
                        type="date"
                        value={bulkGenerationData.period_end}
                        onChange={(e) => setBulkGenerationData(prev => ({
                          ...prev,
                          period_end: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Generation Mode</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="generationMode"
                          value="properties"
                          checked={generationMode === "properties"}
                          onChange={(e) => handleGenerationModeChange(e.target.value as "properties" | "units")}
                        />
                        Generate for entire properties
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="generationMode"
                          value="units"
                          checked={generationMode === "units"}
                          onChange={(e) => handleGenerationModeChange(e.target.value as "properties" | "units")}
                        />
                        Generate for specific units
                      </label>
                    </div>
                  </div>
                  
                  {generationMode === "properties" ? (
                    <div>
                      <Label htmlFor="properties">Select Properties</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                        {properties.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No properties available</p>
                        ) : (
                          properties.map((property) => (
                            <label key={property.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedPropertyIds.includes(property.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handlePropertySelectionChange([...selectedPropertyIds, property.id]);
                                  } else {
                                    handlePropertySelectionChange(selectedPropertyIds.filter(id => id !== property.id));
                                  }
                                }}
                              />
                              <span className="text-sm">{property.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({property.address})
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                      {selectedPropertyIds.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedPropertyIds.length} property(ies) selected
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="units">Select Units</Label>
                      {selectedPropertyIds.length === 0 ? (
                        <div>
                          <Label htmlFor="properties-for-units">First, select properties to load units</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                            {properties.map((property) => (
                              <label key={property.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedPropertyIds.includes(property.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handlePropertySelectionChange([...selectedPropertyIds, property.id]);
                                    } else {
                                      handlePropertySelectionChange(selectedPropertyIds.filter(id => id !== property.id));
                                    }
                                  }}
                                />
                                <span className="text-sm">{property.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                          {availableUnits.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Loading units...</p>
                          ) : (
                            availableUnits.map((unit) => (
                              <label key={unit.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedUnitIds.includes(unit.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleUnitSelectionChange([...selectedUnitIds, unit.id]);
                                    } else {
                                      handleUnitSelectionChange(selectedUnitIds.filter(id => id !== unit.id));
                                    }
                                  }}
                                />
                                <span className="text-sm">
                                  Unit {unit.unit_number} - {unit.property_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  (${unit.rental_amount})
                                </span>
                              </label>
                            ))
                          )}
                        </div>
                      )}
                      {selectedUnitIds.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedUnitIds.length} unit(s) selected
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="additional_charges">Additional Charges (Optional)</Label>
                    <div className="space-y-2">
                      {(bulkGenerationData.additional_charges || []).map((charge, index) => (
                        <div key={`bulk-charge-${index}`} className="flex gap-2 items-center">
                          <Input
                            placeholder="Description"
                            value={charge.description}
                            onChange={(e) => {
                              const newCharges = [...(bulkGenerationData.additional_charges || [])];
                              newCharges[index] = { ...charge, description: e.target.value };
                              setBulkGenerationData(prev => ({ ...prev, additional_charges: newCharges }));
                            }}
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={charge.amount}
                            onChange={(e) => {
                              const newCharges = [...(bulkGenerationData.additional_charges || [])];
                              newCharges[index] = { ...charge, amount: parseFloat(e.target.value) || 0 };
                              setBulkGenerationData(prev => ({ ...prev, additional_charges: newCharges }));
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newCharges = (bulkGenerationData.additional_charges || []).filter((_, i) => i !== index);
                              setBulkGenerationData(prev => ({ ...prev, additional_charges: newCharges }));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCharges = [...(bulkGenerationData.additional_charges || []), { description: "", amount: 0 }];
                          setBulkGenerationData(prev => ({ ...prev, additional_charges: newCharges }));
                        }}
                      >
                        Add Charge
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes for the invoices..."
                      value={bulkGenerationData.notes || ""}
                      onChange={(e) => setBulkGenerationData(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                    />
                  </div>
                </div>
                
                {/* Summary Section */}
                {(selectedPropertyIds.length > 0 || selectedUnitIds.length > 0) && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Generation Summary</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Mode:</strong> {generationMode === "properties" ? "Entire Properties" : "Specific Units"}</p>
                      <p><strong>Target:</strong> {
                        generationMode === "properties" 
                          ? `${selectedPropertyIds.length} property(ies)` 
                          : `${selectedUnitIds.length} unit(s)`
                      }</p>
                      <p><strong>Invoice Date:</strong> {bulkGenerationData.invoice_date}</p>
                      <p><strong>Due Date:</strong> {bulkGenerationData.due_date}</p>
                      <p><strong>Period:</strong> {bulkGenerationData.period_start} to {bulkGenerationData.period_end}</p>
                      {bulkGenerationData.additional_charges && bulkGenerationData.additional_charges.length > 0 && (
                        <p key="additional-charges-summary"><strong>Additional Charges:</strong> {bulkGenerationData.additional_charges.length} item(s)</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setBulkModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkGenerate}
                    disabled={selectedPropertyIds.length === 0 && selectedUnitIds.length === 0}
                  >
                    Generate Invoices
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={refreshData}
      />

      {/* Statistics Cards */}
      {!!summaryMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryMetrics.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {summaryMetrics.pendingCount} pending, {summaryMetrics.paidCount} paid
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Across all invoices
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalOutstanding)}</div>
              <p className="text-xs text-muted-foreground">
                {summaryMetrics.overdueCount} overdue invoices
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {collectionRateDisplay.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summaryMetrics.totalPaid)} collected
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search invoices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as InvoiceType | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <DatePicker
                  date={dateRange.start}
                  onDateChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                  placeholder="Start date"
                />
                <DatePicker
                  date={dateRange.end}
                  onDateChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    {userRole === "landlord" && (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Payment Evidence</CardTitle>
            <CardDescription>
              Review offline payment submissions from tenants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {evidenceLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : pendingEvidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending evidence to review.</p>
            ) : (
              pendingEvidence.map((evidence) => (
                <div
                  key={evidence.id}
                  className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Submitted {formatDateDisplay(evidence.submitted_at)}
                    </p>
                    <p className="font-semibold">
                      {evidence.invoice?.invoice_number || "Invoice"}
                    </p>
                    {(evidence.invoice?.property?.name || evidence.invoice?.unit?.unit_number) && (
                      <p className="text-sm text-muted-foreground">
                        {evidence.invoice?.property?.name || "Unknown property"}
                        {evidence.invoice?.unit?.unit_number ? ` • Unit ${evidence.invoice.unit.unit_number}` : ""}
                      </p>
                    )}
                    <p className="text-sm">
                      {(evidence.tenant?.name || "Unknown tenant")} • {formatCurrency(evidence.amount)} via{" "}
                      {getPaymentMethodLabel(evidence.payment_method)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payment Date: {formatDateDisplay(evidence.payment_date)}
                    </p>
                    {typeof evidence.invoice?.outstanding_balance === "number" && (
                      <p className="text-sm text-muted-foreground">
                        Outstanding Before Approval: {formatCurrency(evidence.invoice.outstanding_balance)}
                      </p>
                    )}
                    {evidence.attachments && evidence.attachments.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Paperclip className="h-4 w-4" />
                        {evidence.attachments.length} attachment{evidence.attachments.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleReviewEvidence(evidence)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recorded Evidence</CardTitle>
            <CardDescription>
              History of evidence that has been approved and recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {evidenceLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : processedEvidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recorded evidence entries.</p>
            ) : (
              processedEvidence.map((evidence) => (
                <div
                  key={evidence.id}
                  className="border rounded-lg p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-muted/40"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Recorded {formatDateDisplay(evidence.reviewed_at)}
                    </p>
                    <p className="font-semibold">
                      {evidence.invoice?.invoice_number || "Invoice"}
                    </p>
                    {(evidence.invoice?.property?.name || evidence.invoice?.unit?.unit_number) && (
                      <p className="text-sm text-muted-foreground">
                        {evidence.invoice?.property?.name || "Unknown property"}
                        {evidence.invoice?.unit?.unit_number ? ` • Unit ${evidence.invoice.unit.unit_number}` : ""}
                      </p>
                    )}
                    <p className="text-sm">
                      {(evidence.tenant?.name || "Unknown tenant")} • {formatCurrency(evidence.amount)} via{" "}
                      {getPaymentMethodLabel(evidence.payment_method)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payment Date: {formatDateDisplay(evidence.payment_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Recorded</Badge>
                    <Button variant="outline" onClick={() => handleReviewEvidence(evidence)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </>
    )}

    <Dialog
      open={evidenceModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          setEvidenceModalOpen(false);
          setSelectedEvidence(null);
        }
      }}
    >
      <DialogContent className="max-w-3xl">
        {selectedEvidence ? (
          <>
            <DialogHeader>
              <DialogTitle>Review Payment Evidence</DialogTitle>
              <DialogDescription>
                Invoice {selectedEvidence.invoice?.invoice_number || "Unknown invoice"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Tenant</p>
                  <p className="font-medium">{selectedEvidence.tenant?.name || "Unknown tenant"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(selectedEvidence.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{getPaymentMethodLabel(selectedEvidence.payment_method)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{formatDateDisplay(selectedEvidence.payment_date)}</p>
                </div>
                {selectedEvidence.reference_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reference Number</p>
                    <p className="font-medium">{selectedEvidence.reference_number}</p>
                  </div>
                )}
              </div>

              {selectedEvidence.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedEvidence.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Attachments</p>
                {selectedEvidence.attachments && selectedEvidence.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEvidence.attachments.map((file, index) => (
                      <div
                        key={`${file.file_url || file.file_path || index}`}
                        className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span>{file.file_name || `Attachment ${index + 1}`}</span>
                        </div>
                        {file.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No attachments provided.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEvidenceModalOpen(false);
                  setSelectedEvidence(null);
                }}
              >
                Close
              </Button>
              {!isEvidenceReadonly && (
                <Button onClick={() => handleApproveEvidence(selectedEvidence)}>
                  Approve &amp; Record Payment
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No payment evidence selected.
          </div>
        )}
      </DialogContent>
    </Dialog>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground">
                  {userRole === "landlord" 
                    ? "Create your first invoice or adjust your filters"
                    : "No invoices match your current filters"
                  }
                </p>
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="font-semibold">{invoice.invoice_number}</div>
                      {(invoice.property?.name || invoice.unit?.unit_number) && (
                        <div className="text-sm text-muted-foreground">
                          {(invoice.property?.name || "Unknown property")} - Unit {(invoice.unit?.unit_number || "N/A")}
                        </div>
                      )}
                      {invoice.tenant?.name && (
                        <div className="text-sm text-muted-foreground">
                          Tenant: {invoice.tenant.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                  <div className="text-right space-y-1">
                    <div className="font-semibold">{formatCurrency(invoice.total_amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDateDisplay(invoice.due_date)}
                    </div>
                    {invoice.outstanding_balance > 0 && (
                      <div className="text-sm text-destructive">
                        Outstanding: {formatCurrency(invoice.outstanding_balance)}
                      </div>
                    )}
                  </div>
                    
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {invoice.status.replace('_', ' ')}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {userRole === "landlord" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoicePayments(invoice.id)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                      {userRole === "landlord" && invoice.status !== "paid" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRecordPayment(invoice.id)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          {invoice.status === "pending" && (
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Select Invoice Modal */}
      <SelectInvoiceModal
        isOpen={isSelectInvoiceModalOpen}
        onClose={() => setIsSelectInvoiceModalOpen(false)}
        onSelectInvoice={handleSelectInvoiceForPayment}
      />

      {/* Record Payment Modal */}
      {selectedInvoiceId && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedInvoiceId(null);
            setRecordPaymentDefaults(null);
            setPendingEvidenceId(null);
          }}
          invoiceId={selectedInvoiceId}
          invoiceNumber={selectedInvoiceNumber}
          outstandingBalance={selectedInvoiceBalance}
          onSuccess={handlePaymentSuccess}
          defaultValues={recordPaymentDefaults || undefined}
        />
      )}

      <InvoicePaymentHistoryModal
        invoiceId={historyInvoiceId}
        isOpen={showInvoicePaymentsModal}
        onClose={() => {
          setShowInvoicePaymentsModal(false);
          setHistoryInvoiceId(null);
        }}
      />
    </div>
  );
}
