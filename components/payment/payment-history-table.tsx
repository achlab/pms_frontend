/**
 * Payment History Table Component
 * Displays payment transaction history
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import type { Payment } from "@/lib/api-types";
import { formatCurrency, formatDate, formatStatus } from "@/lib/api-utils";

interface PaymentHistoryTableProps {
  payments: Payment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      mobile_money: "Mobile Money",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
      cheque: "Cheque",
    };
    return labels[method] || method;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
    <div className="border rounded-lg bg-white dark:bg-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment #</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.payment_number}</TableCell>
              <TableCell>
                {payment.invoice ? payment.invoice.invoice_number : "N/A"}
              </TableCell>
              <TableCell>{formatDate(payment.payment_date)}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
              <TableCell className="font-mono text-sm">
                {payment.payment_reference}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(payment.status)}>
                  {formatStatus(payment.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

