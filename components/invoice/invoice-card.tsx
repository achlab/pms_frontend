/**
 * Invoice Card Component
 * Displays individual invoice information in a card format
 */

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, DollarSign, FileText, CreditCard } from "lucide-react";
import type { Invoice } from "@/lib/api-types";
import { formatCurrency, formatDate, formatStatus } from "@/lib/api-utils";

interface InvoiceCardProps {
  invoice: Invoice;
  onViewDetails?: (invoiceId: string) => void;
  onRecordPayment?: (invoiceId: string) => void;
}

export function InvoiceCard({ invoice, onViewDetails, onRecordPayment }: InvoiceCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      partially_paid: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.is_overdue;

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? "border-red-200" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {invoice.property.name} - Unit {invoice.unit.unit_number}
            </p>
          </div>
          <Badge className={getStatusColor(invoice.status)}>
            {formatStatus(invoice.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Invoice Date
            </div>
            <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due Date
            </div>
            <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
              {formatDate(invoice.due_date)}
              {isOverdue && (
                <span className="text-xs ml-2">
                  ({invoice.days_overdue} days overdue)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Period */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Billing Period</p>
          <p className="font-medium text-sm">
            {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
          </p>
        </div>

        {/* Financial Details */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Rent</span>
            <span className="font-medium">{formatCurrency(invoice.base_rent_amount)}</span>
          </div>

          {invoice.additional_charges > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Additional Charges</span>
              <span className="font-medium">{formatCurrency(invoice.additional_charges)}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total Amount</span>
            <span className="text-lg">{formatCurrency(invoice.total_amount)}</span>
          </div>

          {invoice.outstanding_balance > 0 && (
            <div className="flex justify-between font-semibold text-primary">
              <span>Outstanding Balance</span>
              <span className="text-lg">{formatCurrency(invoice.outstanding_balance)}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewDetails(invoice.id)}
            >
              View Details
            </Button>
          )}

          {!isPaid && onRecordPayment && (
            <Button
              className="flex-1"
              onClick={() => onRecordPayment(invoice.id)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

