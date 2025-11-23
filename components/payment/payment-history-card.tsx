/**
 * Payment History Card Component
 * Displays payment history with proper method formatting
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2,
  Copy,
  ExternalLink
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/api-utils";
import { toast } from "sonner";
import type { Payment, PaymentMethod } from "@/lib/api-types";

interface PaymentHistoryCardProps {
  payments: Payment[];
  totalPaid: number;
  remainingBalance: number;
}

export function PaymentHistoryCard({ 
  payments, 
  totalPaid, 
  remainingBalance 
}: PaymentHistoryCardProps) {
  
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "mtn_momo":
      case "vodafone_cash":
        return <Smartphone className="h-4 w-4" />;
      case "bank_transfer":
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "cash":
        return "Cash";
      case "mtn_momo":
        return "MTN Mobile Money";
      case "vodafone_cash":
        return "Vodafone Cash";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method.replace('_', ' ');
    }
  };

  const getPaymentMethodColor = (method: PaymentMethod) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800 border-green-200";
      case "mtn_momo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "vodafone_cash":
        return "bg-red-100 text-red-800 border-red-200";
      case "bank_transfer":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const copyReference = (reference: string) => {
    navigator.clipboard.writeText(reference);
    toast.success("Reference copied to clipboard");
  };

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>No payments recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payments have been recorded for this invoice.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining Balance</p>
            <p className={`text-lg font-semibold ${remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {formatCurrency(remainingBalance)}
            </p>
          </div>
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4 space-y-3">
              {/* Payment Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(payment.payment_method)}
                    <span className="font-medium">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <Badge className={getPaymentMethodColor(payment.payment_method)}>
                    {getPaymentMethodLabel(payment.payment_method)}
                  </Badge>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {payment.status}
                </Badge>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{formatDate(payment.payment_date)}</p>
                </div>
                
                {payment.payment_reference && (
                  <div>
                    <p className="text-muted-foreground">Reference</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {payment.payment_reference}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyReference(payment.payment_reference)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Notes */}
              {payment.notes && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{payment.notes}</p>
                </div>
              )}

              {/* Recorded By */}
              {payment.recorded_by && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Recorded by {payment.recorded_by.name} on {formatDate(payment.created_at)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Method Summary */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Payment Methods Used</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(
              payments.reduce((acc, payment) => {
                const method = payment.payment_method;
                acc[method] = (acc[method] || 0) + payment.amount;
                return acc;
              }, {} as Record<PaymentMethod, number>)
            ).map(([method, amount]) => (
              <div key={method} className="text-center p-2 bg-muted rounded">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getPaymentMethodIcon(method as PaymentMethod)}
                  <span className="text-xs font-medium">
                    {getPaymentMethodLabel(method as PaymentMethod)}
                  </span>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
