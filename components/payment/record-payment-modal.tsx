/**
 * Record Payment Modal Component
 * Modal for recording a payment against an invoice
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
import { useRecordPayment } from "@/lib/hooks/use-invoice";
import { formatCurrency, formatDateForApi, getErrorMessage } from "@/lib/api-utils";
import { toast } from "sonner";
import type { PaymentMethod } from "@/lib/api-types";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  outstandingBalance: number;
  onSuccess?: () => void;
  defaultValues?: {
    amount?: number;
    payment_method?: PaymentMethod;
    payment_reference?: string;
    payment_date?: string;
    notes?: string;
  };
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  outstandingBalance,
  onSuccess,
  defaultValues,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(outstandingBalance.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(formatDateForApi(new Date()));
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (isOpen) {
      setAmount(
        defaultValues?.amount !== undefined
          ? defaultValues.amount.toString()
          : outstandingBalance.toString()
      );
      setPaymentMethod(defaultValues?.payment_method ?? "cash");
      setPaymentReference(defaultValues?.payment_reference ?? "");
      setPaymentDate(defaultValues?.payment_date ?? formatDateForApi(new Date()));
      setNotes(defaultValues?.notes ?? "");
    }
  }, [isOpen, defaultValues, outstandingBalance]);


  const { mutate: recordPayment, isLoading } = useRecordPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amountNum > outstandingBalance) {
      toast.error("Payment amount cannot exceed outstanding balance");
      return;
    }

    // Validate payment date is not in the future
    const paymentDateObj = new Date(paymentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (paymentDateObj > today) {
      toast.error("Payment date cannot be in the future");
      return;
    }

    if (paymentMethod !== "cash" && !paymentReference.trim()) {
      toast.error("Please enter a payment reference");
      return;
    }

    try {
      await recordPayment({
        invoiceId,
        data: {
          amount: amountNum,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_date: paymentDate,
          notes: notes || undefined,
        },
      });

      toast.success("Payment recorded successfully!");
      
      // Reset form
      setAmount(outstandingBalance.toString());
      setPaymentReference("");
      setNotes("");
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment that was received outside the system for invoice {invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs font-bold">i</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Manual Payment Recording</p>
              <p>Use this form to record payments you've already received through cash, mobile money, or bank transfer. This helps keep accurate records and updates the invoice status.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Outstanding Balance */}
            <div className="space-y-2">
              <Label>Outstanding Balance</Label>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(outstandingBalance)}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <div className="space-y-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={outstandingBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount((outstandingBalance / 2).toFixed(2))}
                  >
                    Half ({formatCurrency(outstandingBalance / 2)})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(outstandingBalance.toString())}
                  >
                    Full Amount
                  </Button>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                  <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference">
                Payment Reference 
                {paymentMethod === "cash" ? " (Optional)" : " *"}
              </Label>
              <Input
                id="reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={
                  paymentMethod === "mtn_momo" ? "e.g., MP251123.1234.A56789" :
                  paymentMethod === "vodafone_cash" ? "e.g., VC251123123456" :
                  paymentMethod === "bank_transfer" ? "e.g., TXN123456789" :
                  "Receipt number or reference"
                }
                required={paymentMethod !== "cash"}
              />
              <p className="text-xs text-muted-foreground">
                {paymentMethod === "mtn_momo" ? "MTN Mobile Money transaction ID" :
                 paymentMethod === "vodafone_cash" ? "Vodafone Cash transaction ID" :
                 paymentMethod === "bank_transfer" ? "Bank transfer reference number" :
                 paymentMethod === "cash" ? "Receipt number (optional for cash payments)" :
                 "Transaction ID or reference number"}
              </p>
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

