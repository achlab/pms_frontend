"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, CreditCard, Receipt } from "lucide-react";
import type { Payment } from "@/lib/api-types";
import { formatCurrency } from "@/lib/api-utils";

interface PaymentHistoryListProps {
  title?: string;
  payments: Payment[];
  loading?: boolean;
  emptyMessage?: string;
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

export function PaymentHistoryList({
  title = "Payment History",
  payments,
  loading,
  emptyMessage = "No payment history available.",
}: PaymentHistoryListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <CreditCard className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-lg border p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {payment.invoice?.invoice_number || "Invoice"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.payment_date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethodLabel[payment.payment_method] || payment.payment_method}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      {payment.payment_reference && (
                        <p className="text-muted-foreground">
                          Reference: <span className="font-medium">{payment.payment_reference}</span>
                        </p>
                      )}
                      {payment.notes && (
                        <p className="text-muted-foreground">
                          Notes: <span className="font-medium">{payment.notes}</span>
                        </p>
                      )}
                    </div>
                    <Badge variant={paymentStatusMap[payment.status]?.variant || "secondary"}>
                      {paymentStatusMap[payment.status]?.label || payment.status}
                    </Badge>
                  </div>

                  {payment.evidence?.attachments && payment.evidence.attachments.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-2">
                        {payment.evidence.attachments.map((attachment, idx) => (
                          <Button
                            key={`${attachment.file_url || idx}`}
                            asChild
                            variant="outline"
                            size="sm"
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
        )}
      </CardContent>
    </Card>
  );
}

