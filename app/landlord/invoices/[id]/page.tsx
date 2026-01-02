"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Download, 
  Send, 
  CreditCard, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { landlordInvoiceService } from "@/lib/services/landlord-invoice.service";
import { caretakerInvoiceService } from "@/lib/services/caretaker-invoice.service";
import { paymentService } from "@/lib/services/payment.service";
import { RecordPaymentModal } from "@/components/payment/record-payment-modal";
import { PaymentHistoryCard } from "@/components/payment/payment-history-card";
import { formatCurrency, formatDate, formatStatus, getErrorMessage } from "@/lib/api-utils";
import type { Invoice, Payment } from "@/lib/api-types";

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Get appropriate service based on user role
  const getInvoiceService = () => {
    switch (user?.role) {
      case "landlord":
        return landlordInvoiceService;
      case "caretaker":
        return caretakerInvoiceService;
      default:
        return landlordInvoiceService; // fallback
    }
  };

  useEffect(() => {
    if (invoiceId) {
      loadInvoiceDetails();
    }
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      const invoiceService = getInvoiceService();
      
      const [invoiceResponse, paymentsResponse] = await Promise.allSettled([
        invoiceService.getInvoice(invoiceId),
        paymentService.getInvoicePayments(invoiceId)
      ]);

      if (invoiceResponse.status === "fulfilled") {
        setInvoice(invoiceResponse.value.data);
      } else {
        console.error("Failed to load invoice:", invoiceResponse.reason);
        toast.error("Failed to load invoice details");
      }

      if (paymentsResponse.status === "fulfilled") {
        setPayments(paymentsResponse.value.data.payments || []);
      } else {
        console.error("Failed to load payments:", paymentsResponse.reason);
        // Don't show error for payments as it's not critical
      }
    } catch (error) {
      console.error("Error loading invoice details:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!invoice) return;
    
    try {
      const invoiceService = getInvoiceService();
      const response = await invoiceService.exportInvoicePDF(invoice.id);
      
      // Open PDF in new tab
      window.open(response.data.pdf_url, '_blank');
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleSendReminder = async () => {
    if (!invoice || user?.role !== "landlord") return;
    
    try {
      await landlordInvoiceService.sendReminder(invoice.id);
      toast.success("Reminder sent successfully");
    } catch (error) {
      console.error("Failed to send reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
      partially_paid: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Invoice Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The invoice you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid";
  const canRecordPayment = user?.role === "landlord" && !isPaid;
  const canSendReminder = user?.role === "landlord" && !isPaid;

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Invoice {invoice.invoice_number}</h1>
              <p className="text-muted-foreground">
                {invoice.property.name} - Unit {invoice.unit.unit_number}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            
            {canSendReminder && (
              <Button variant="outline" onClick={handleSendReminder}>
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
            )}
            
            {canRecordPayment && (
              <Button onClick={() => setIsPaymentModalOpen(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(invoice.status)}
                    Invoice Status
                  </CardTitle>
                  <Badge className={getStatusColor(invoice.status)}>
                    {formatStatus(invoice.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className={`font-medium ${invoice.is_overdue ? "text-red-600" : ""}`}>
                      {formatDate(invoice.due_date)}
                      {invoice.is_overdue && (
                        <span className="text-xs ml-2">
                          ({invoice.days_overdue} days overdue)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Period</p>
                    <p className="font-medium">
                      {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Type</p>
                    <p className="font-medium capitalize">{invoice.invoice_type || "Rent"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Rent</span>
                    <span className="font-medium">{formatCurrency(invoice.base_rent_amount)}</span>
                  </div>

                  {/* Additional Charges */}
                  {Array.isArray(invoice.additional_charges) && invoice.additional_charges.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Additional Charges</p>
                        {invoice.additional_charges.map((charge: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {charge.name || charge.description}
                              {charge.description && charge.name !== charge.description && (
                                <span className="block text-xs">{charge.description}</span>
                              )}
                            </span>
                            <span className="font-medium">{formatCurrency(charge.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {typeof invoice.additional_charges === 'number' && invoice.additional_charges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Additional Charges</span>
                      <span className="font-medium">{formatCurrency(invoice.additional_charges)}</span>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>

                  {invoice.outstanding_balance > 0 && (
                    <div className="flex justify-between font-semibold text-primary">
                      <span>Outstanding Balance</span>
                      <span>{formatCurrency(invoice.outstanding_balance)}</span>
                    </div>
                  )}

                  {invoice.status === "paid" && invoice.paid_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        Paid on {formatDate(invoice.paid_at)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Payment History */}
            <PaymentHistoryCard 
              payments={payments}
              totalPaid={invoice.total_amount - invoice.outstanding_balance}
              remainingBalance={invoice.outstanding_balance}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{invoice.property.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit</p>
                  <p className="font-medium">Unit {invoice.unit.unit_number}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tenant Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{invoice.tenant.name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Landlord Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Landlord Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{invoice.landlord.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Record Payment Modal */}
        {canRecordPayment && (
          <RecordPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoice_number}
            outstandingBalance={invoice.outstanding_balance}
            onSuccess={() => {
              loadInvoiceDetails();
              toast.success("Payment recorded successfully!");
            }}
          />
        )}
      </div>
  );
}
