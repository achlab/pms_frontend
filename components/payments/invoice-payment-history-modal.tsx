"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { paymentService } from "@/lib/services/payment.service";
import type { Payment } from "@/lib/api-types";
import { formatCurrency } from "@/lib/api-utils";
import { Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvoicePaymentHistoryModalProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const paymentStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" }> = {
  completed: { label: "Completed", variant: "success" },
  recorded: { label: "Recorded", variant: "secondary" },
  pending: { label: "Pending", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
  partially_paid: { label: "Partial", variant: "default" },
};

const paymentMethodLabel: Record<string, string> = {
  cash: "Cash",
  mtn_momo: "MTN Momo",
  vodafone_cash: "Vodafone Cash",
  bank_transfer: "Bank Transfer",
};

export function InvoicePaymentHistoryModal({
  invoiceId,
  isOpen,
  onClose,
}: InvoicePaymentHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [remainingBalance, setRemainingBalance] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !invoiceId) return;

    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await paymentService.getInvoicePayments(invoiceId);
        setPayments(response.data?.payments || []);
        setInvoiceNumber(response.data?.invoice?.invoice_number || "");
        setRemainingBalance(response.data?.remaining_balance || 0);
        setTotalPaid(response.data?.total_paid || 0);
      } catch (error) {
        console.error("Failed to load invoice payments:", error);
        toast.error("Failed to load invoice payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [isOpen, invoiceId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Payments</DialogTitle>
          <DialogDescription>
            {invoiceNumber ? `Invoice ${invoiceNumber}` : "Invoice payments"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded for this invoice yet.</p>
        ) : (
          <>
            <div className="flex items-center justify-between bg-muted rounded-md p-3 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining Balance</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>

            <ScrollArea className="max-h-[420px] pr-2">
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant={paymentStatusMap[payment.status]?.variant || "secondary"}>
                        {paymentStatusMap[payment.status]?.label || payment.status}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        Method:{" "}
                        <span className="font-medium">
                          {paymentMethodLabel[payment.payment_method] || payment.payment_method}
                        </span>
                      </p>
                      {payment.payment_reference && (
                        <p>
                          Reference: <span className="font-medium">{payment.payment_reference}</span>
                        </p>
                      )}
                      {payment.notes && (
                        <p>
                          Notes: <span className="font-medium">{payment.notes}</span>
                        </p>
                      )}
                    </div>
                    {payment.evidence?.attachments && payment.evidence.attachments.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-2">
                          {payment.evidence.attachments.map((attachment, idx) => (
                            <Button
                              key={`${attachment.file_url || idx}`}
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={attachment.file_url || attachment.file_path || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Attachment {idx + 1}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

