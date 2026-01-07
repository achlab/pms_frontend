"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MainLayout } from "@/components/main-layout";
import { InvoiceList } from "@/components/invoice/invoice-list";
import { InvoiceListSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, FileText, RefreshCw, ArrowLeft, CreditCard, Loader2, Camera, Upload, X, Image as ImageIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import paymentService from "@/lib/services/payment.service";
import { getErrorMessage } from "@/lib/api-utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useInvoices } from "@/lib/hooks/use-invoice";
import type { InvoiceStatus, InvoiceType, Payment } from "@/lib/api-types";
import { PaymentHistoryList } from "@/components/payments/payment-history-list";

export default function TenantInvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isTenantUser = user?.role === "tenant";
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<InvoiceType | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptPreviews, setReceiptPreviews] = useState<{ url: string; type: "image" | "pdf"; name: string }[]>([]);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_method: "",
    payment_date: new Date().toISOString().split("T")[0],
    reference_number: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({
    amount: "",
    payment_method: "",
    payment_date: "",
  });
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);

  const MAX_ATTACHMENTS = 5;
  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const { data, isLoading, error, refetch, isFetching } = useInvoices({
    status: statusFilter,
    invoice_type: typeFilter,
    page: currentPage,
    per_page: 15,
    refetchInterval: 15000, // Auto-refresh every 15 seconds to sync landlord updates
  });

  const invoices = data?.data || [];

  // Handle invoiceId from query parameter (from notification click)
  useEffect(() => {
    const invoiceIdFromQuery = searchParams.get('invoiceId');
    if (invoiceIdFromQuery && invoices.length > 0) {
      const invoice = invoices.find((inv: any) => inv.id === invoiceIdFromQuery);
      if (invoice) {
        // Open payment modal for the invoice
        setSelectedInvoice(invoice);
        setPaymentData({
          amount: invoice.outstanding_balance.toString(),
          payment_method: "",
          payment_date: new Date().toISOString().split("T")[0],
          reference_number: "",
          notes: "",
        });
        setFormErrors({
          amount: "",
          payment_method: "",
          payment_date: "",
        });
        setReceiptPreviews([]);
        setReceiptFiles([]);
        setShowPaymentModal(true);
        
        // Remove invoiceId from URL to clean it up
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('invoiceId');
        const newUrl = newSearchParams.toString() ? `/tenant/invoices?${newSearchParams.toString()}` : '/tenant/invoices';
        router.replace(newUrl);
      }
    }
  }, [searchParams, invoices, router]);

  const handleFilterChange = (filters: {
    status?: InvoiceStatus;
    type?: InvoiceType;
    search?: string;
  }) => {
    setStatusFilter(filters.status);
    setTypeFilter(filters.type);
    setSearchQuery(filters.search);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const loadPaymentHistory = useCallback(async () => {
    if (!isTenantUser) return;
    setPaymentHistoryLoading(true);
    try {
      const response = await paymentService.getPaymentHistory({ per_page: 20 });
      setPaymentHistory(response.data || []);
    } catch (error) {
      console.error("Failed to load payment history:", error);
      toast.error("Failed to load payment history");
    } finally {
      setPaymentHistoryLoading(false);
    }
  }, [isTenantUser]);

  useEffect(() => {
    loadPaymentHistory();
  }, [loadPaymentHistory]);

  // Redirect if not a tenant
  if (!isTenantUser) {
    return (
      <MainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  // Attachment handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    let currentCount = receiptFiles.length;
    const filesToAdd: File[] = [];
    const previewsToAdd: { url: string; type: "image" | "pdf"; name: string }[] = [];

    Array.from(files).forEach((file) => {
      if (currentCount >= MAX_ATTACHMENTS) {
        toast.error(`You can upload up to ${MAX_ATTACHMENTS} attachments.`);
        return;
      }

      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isPdf) {
        toast.error("Only image or PDF files are allowed.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
        return;
      }

      currentCount += 1;
      filesToAdd.push(file);
      previewsToAdd.push({
        url: URL.createObjectURL(file),
        type: isPdf ? "pdf" : "image",
        name: file.name,
      });
    });

    if (filesToAdd.length > 0) {
      setReceiptFiles((prev) => [...prev, ...filesToAdd]);
      setReceiptPreviews((prev) => [...prev, ...previewsToAdd]);
    }

    // Allow re-uploading the same file
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setReceiptPreviews((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }
      return next;
    });

    setReceiptFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation function
  const validateForm = () => {
    const errors = {
      amount: "",
      payment_method: "",
      payment_date: "",
    };

    let isValid = true;

    // Validate amount
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      errors.amount = "Payment amount is required";
      isValid = false;
    } else if (selectedInvoice && parseFloat(paymentData.amount) > selectedInvoice.outstanding_balance) {
      errors.amount = `Amount cannot exceed GH₵${selectedInvoice.outstanding_balance.toFixed(2)}`;
      isValid = false;
    }

    // Validate payment method
    if (!paymentData.payment_method) {
      errors.payment_method = "Please select a payment method";
      isValid = false;
    }

    // Validate payment date
    if (!paymentData.payment_date) {
      errors.payment_date = "Payment date is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Reset form and errors
  const resetForm = () => {
    setPaymentData({
      amount: "",
      payment_method: "",
      payment_date: new Date().toISOString().split("T")[0],
      reference_number: "",
      notes: "",
    });
    setFormErrors({
      amount: "",
      payment_method: "",
      payment_date: "",
    });
    receiptPreviews.forEach((preview) => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
    setReceiptPreviews([]);
    setReceiptFiles([]);
  };

  const summary = data?.summary;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
          <div className="container mx-auto p-6 space-y-6">
            <InvoiceListSkeleton />
          </div>
        </div>

        <PaymentHistoryList
          payments={paymentHistory}
          loading={paymentHistoryLoading}
          title="My Payment History"
          emptyMessage="You have not submitted any payments yet."
        />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
          <div className="container mx-auto p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                    Error Loading Invoices
                  </h3>
                  <p className="mt-1 text-red-700 dark:text-red-300">
                    {getErrorMessage(error)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="container mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  My Invoices
                </h1>
                <p className="text-lg text-muted-foreground">
                  View and manage your rental invoices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => refetch()} disabled={isFetching} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{summary.total_invoices}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  GHS {summary.total_amount.toFixed(2)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  GHS {summary.total_paid.toFixed(2)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  GHS {summary.total_outstanding.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Invoice List */}
          <InvoiceList
            invoices={invoices}
            onViewDetails={(id) => router.push(`/tenant/invoices/${id}`)}
            onRecordPayment={(id) => {
              const invoice = invoices.find(inv => inv.id === id);
              if (invoice) {
                setSelectedInvoice(invoice);
                setPaymentData(prev => ({
                  ...prev,
                  amount: invoice.outstanding_balance.toString(),
                }));
                resetForm();
                setPaymentData(prev => ({
                  ...prev,
                  amount: invoice.outstanding_balance.toString(),
                  payment_date: new Date().toISOString().split("T")[0],
                }));
                setShowPaymentModal(true);
              }
            }}
            onFilterChange={handleFilterChange}
            actionLabel="Submit Evidence"
          />

          {invoices.length === 0 && !isLoading && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You don't have any invoices yet. Your landlord will create invoices for your rent payments.
              </p>
            </div>
          )}

          {/* Payment Modal */}
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Submit Payment Evidence for Invoice {selectedInvoice?.invoice_number}
                </DialogTitle>
              </DialogHeader>

              {selectedInvoice && (
                <div className="space-y-4 py-4">
                  {/* Invoice Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Property:</span>
                      <span className="font-medium">{selectedInvoice.property.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Unit:</span>
                      <span className="font-medium">{selectedInvoice.unit.unit_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="font-medium">GH₵{selectedInvoice.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-gray-600 dark:text-gray-400">Outstanding Balance:</span>
                      <span className="font-bold text-orange-600">
                        GH₵{selectedInvoice.outstanding_balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Guidance */}
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-900 dark:text-amber-100">
                    Submit the details and receipt of your offline payment. Your landlord will review the evidence and record it against this invoice.
                  </div>

                  {/* Payment Evidence Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-medium">
                        Payment Amount *
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={selectedInvoice.outstanding_balance}
                        value={paymentData.amount}
                        onChange={(e) => {
                          setPaymentData({ ...paymentData, amount: e.target.value });
                          // Clear error when user types
                          if (formErrors.amount) {
                            setFormErrors({ ...formErrors, amount: "" });
                          }
                        }}
                        onBlur={validateForm}
                        placeholder="Enter amount"
                        className={formErrors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {formErrors.amount && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.amount}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Maximum: GH₵{selectedInvoice.outstanding_balance.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_method" className="text-sm font-medium">
                        Payment Method *
                      </Label>
                      <Select
                        value={paymentData.payment_method}
                        onValueChange={(value) => {
                          setPaymentData({ ...paymentData, payment_method: value });
                          // Clear error when user selects
                          if (formErrors.payment_method) {
                            setFormErrors({ ...formErrors, payment_method: "" });
                          }
                        }}
                      >
                        <SelectTrigger className={formErrors.payment_method ? "border-red-500 focus:ring-red-500" : ""}>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                          <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.payment_method && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.payment_method}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_date" className="text-sm font-medium">
                        Payment Date *
                      </Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={paymentData.payment_date}
                        onChange={(e) => {
                          setPaymentData({ ...paymentData, payment_date: e.target.value });
                          // Clear error when user selects
                          if (formErrors.payment_date) {
                            setFormErrors({ ...formErrors, payment_date: "" });
                          }
                        }}
                        className={formErrors.payment_date ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {formErrors.payment_date && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.payment_date}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference_number">Reference Number (Optional)</Label>
                      <Input
                        id="reference_number"
                        type="text"
                        value={paymentData.reference_number}
                        onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
                        placeholder="e.g., TXN123456 or receipt number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        type="text"
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                        placeholder="Add any additional notes"
                      />
                    </div>

                    {/* Receipt Image Upload */}
                    <div className="space-y-2">
                      <Label>Upload Receipt Photo (Optional)</Label>
                      
                      {/* Hidden file inputs */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex-1"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>

                      {/* Attachment Previews */}
                      {receiptPreviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {receiptPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              {preview.type === "image" ? (
                                <img
                                  src={preview.url}
                                  alt={`Receipt ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                              ) : (
                                <div className="w-full h-32 rounded-lg border bg-gray-50 flex flex-col items-center justify-center text-gray-600">
                                  <FileText className="h-8 w-8 mb-2" />
                                  <span className="text-xs text-center px-2 break-words">
                                    {preview.name || "PDF Attachment"}
                                  </span>
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeAttachment(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload receipt images or PDF documents (max {MAX_ATTACHMENTS} files, {MAX_FILE_SIZE_MB}MB each)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    console.log("🔵 Submit Payment Evidence button clicked");
                    console.log("📋 Selected Invoice:", selectedInvoice);
                    console.log("💳 Payment Data:", paymentData);
                    
                    if (!selectedInvoice) {
                      console.error("❌ No selected invoice");
                      toast.error("No invoice selected");
                      return;
                    }

                    // Validate form first
                    if (!validateForm()) {
                      console.error("❌ Form validation failed");
                      toast.error("Please fill in all required fields");
                      return;
                    }

                    const formData = new FormData();
                    formData.append("tenant_id", selectedInvoice.tenant.id);
                    formData.append("unit_id", selectedInvoice.unit.id);
                    formData.append("property_id", selectedInvoice.property.id);
                    formData.append("amount", paymentData.amount);
                    formData.append("payment_method", paymentData.payment_method);
                    formData.append("payment_date", paymentData.payment_date);
                    if (paymentData.reference_number) {
                      formData.append("reference_number", paymentData.reference_number);
                    }
                    if (paymentData.notes) {
                      formData.append("notes", paymentData.notes);
                    }
                    receiptFiles.forEach((file) => formData.append("attachments[]", file));

                    console.log("📤 Sending payment evidence form data:", Array.from(formData.entries()));

                    try {
                      setIsSubmitting(true);
                      console.log("⏳ Submitting payment evidence...");

                      const response = await paymentService.submitPaymentEvidence(selectedInvoice.id, formData);
                      
                      console.log("✅ Payment evidence response:", response);
                      toast.success("Payment evidence submitted! Await landlord verification.");
                      setShowPaymentModal(false);
                      
                      // Reset form
                      resetForm();

                      // Refresh invoice list to show updated status
                      await refetch();
                      await loadPaymentHistory();
                    } catch (error: any) {
                      console.error("❌ Payment submission error:", error);
                      console.error("Error details:", {
                        message: error?.message,
                        response: error?.response,
                        stack: error?.stack
                      });
                      toast.error(error?.message || "Failed to submit payment evidence");
                    } finally {
                      setIsSubmitting(false);
                      console.log("🏁 Payment evidence submission complete");
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Submit Evidence
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
}