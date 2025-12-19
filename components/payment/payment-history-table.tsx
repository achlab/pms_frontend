/**
 * Payment History Table Component
 * Displays payment transaction history
 */

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Eye, CheckCircle, XCircle } from "lucide-react";
import type { Payment } from "@/lib/api-types";
import { formatCurrency, formatDate, formatStatus } from "@/lib/api-utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { paymentService } from "@/lib/services/payment.service";

interface PaymentHistoryTableProps {
  payments: Payment[];
  currentPage?: number;
  perPage?: number;
  onStatusUpdate?: () => void;
}

export function PaymentHistoryTable({ 
  payments, 
  currentPage = 1, 
  perPage = 15,
  onStatusUpdate 
}: PaymentHistoryTableProps) {
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return 'N/A';
    const labels: Record<string, string> = {
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
      cheque: "Cheque",
    };
    return labels[method] || method;
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      recorded: "bg-blue-100 text-blue-800",
      partially_paid: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setNewStatus(payment.status);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedPayment) return;
    
    setIsUpdating(true);
    try {
      // Call the backend to update payment status
      await paymentService.updatePaymentStatus(selectedPayment.id, newStatus as any);
      
      // Update the selected payment immediately to reflect the change in the UI
      setSelectedPayment({
        ...selectedPayment,
        status: newStatus
      });
      
      toast.success(`Payment status updated to ${formatStatus(newStatus)}`);
      
      // Trigger refresh to fetch latest data from backend
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      // Don't close the modal immediately so user can see the change
      // setIsDetailsOpen(false);
      setNewStatus('');
    } catch (error: any) {
      toast.error(error?.message || "Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRowNumber = (index: number) => {
    return (currentPage - 1) * perPage + index + 1;
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-white dark:bg-slate-800">
        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-muted-foreground">No payment history found</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg bg-white dark:bg-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment, index) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{getRowNumber(index)}</TableCell>
                <TableCell>
                  {payment.invoice?.invoice_number || 
                   (payment.recorded_by?.id === payment.tenant?.id ? 
                    `Tenant-${payment.id.slice(-6).toUpperCase()}` : 'N/A')}
                </TableCell>
                <TableCell>{formatDate(payment.payment_date)}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                <TableCell className="font-mono text-sm">
                  {payment.payment_reference || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(payment.status)}>
                    {formatStatus(payment.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(payment)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View and manage payment information
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Number</label>
                  <p className="text-base font-semibold">{getRowNumber(payments.indexOf(selectedPayment))}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                  <p className="text-base font-semibold">{selectedPayment.invoice?.invoice_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                  <p className="text-base">{formatDate(selectedPayment.payment_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-base">{getPaymentMethodLabel(selectedPayment.payment_method)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                  <p className="text-base font-mono">{selectedPayment.payment_reference || 'N/A'}</p>
                </div>
              </div>

              {/* Tenant Information */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Tenant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-base">{selectedPayment.tenant?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Receipt Images */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Payment Receipt</h3>
                {(selectedPayment.receipt_images && selectedPayment.receipt_images.length > 0) || selectedPayment.receipt_url ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPayment.receipt_images && selectedPayment.receipt_images.length > 0 ? (
                      selectedPayment.receipt_images.map((image, index) => (
                        <a
                          key={index}
                          href={image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative group cursor-pointer"
                        >
                          <img
                            src={image}
                            alt={`Receipt ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      ))
                    ) : selectedPayment.receipt_url ? (
                      <a
                        href={selectedPayment.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group cursor-pointer"
                      >
                        <img
                          src={selectedPayment.receipt_url}
                          alt="Receipt"
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </a>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-muted-foreground">No receipt uploaded for this payment</p>
                  </div>
                )}
              </div>

              {/* Current Status */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Payment Status</h3>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {formatStatus(selectedPayment.status)}
                  </Badge>
                </div>
              </div>

              {/* Status Update (Only for Landlords) */}
              {user?.role === 'landlord' && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Update Payment Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Select Status
                      </label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-white dark:bg-slate-800">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recorded">Recorded</SelectItem>
                          <SelectItem value="pending">Pending Approval</SelectItem>
                          <SelectItem value="completed">Full Payment / Rent Paid</SelectItem>
                          <SelectItem value="partially_paid">Partial Payment</SelectItem>
                          <SelectItem value="failed">Failed / Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={handleStatusUpdate}
                      disabled={isUpdating || newStatus === selectedPayment.status}
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Update Status
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      * Updating status will notify the tenant and update related invoice if applicable.
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-base mt-1 text-gray-700 dark:text-gray-300">
                    {selectedPayment.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

