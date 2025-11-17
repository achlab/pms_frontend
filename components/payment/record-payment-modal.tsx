/**
 * Record Payment Modal Component
 * Modal for recording a payment against an invoice
 */

"use client";

import { useState } from "react";
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
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  outstandingBalance,
  onSuccess,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(outstandingBalance.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile_money");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(formatDateForApi(new Date()));
  const [notes, setNotes] = useState("");

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

    if (!paymentReference.trim()) {
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
            Record a payment for invoice {invoiceNumber}
          </DialogDescription>
        </DialogHeader>

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
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference">Payment Reference *</Label>
              <Input
                id="reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g., REF-MTN123456"
                required
              />
              <p className="text-xs text-muted-foreground">
                Transaction ID or reference number
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

