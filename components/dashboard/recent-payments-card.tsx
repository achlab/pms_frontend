/**
 * Recent Payments Card Component
 * Displays recent payment transactions
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RecentPayment } from "@/lib/api-types";
import { formatCurrency, formatDate } from "@/lib/api-utils";

interface RecentPaymentsCardProps {
  payments: RecentPayment[];
  upcomingDueDate?: string | null;
}

export function RecentPaymentsCard({ payments, upcomingDueDate }: RecentPaymentsCardProps) {
  const router = useRouter();

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/payments")}
            className="text-primary"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Due Date */}
        {upcomingDueDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Next Payment Due
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {formatDate(upcomingDueDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Payments List */}
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push("/payments")}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(payment.payment_date)}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {payments.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/pay-rent")}
          >
            Make a Payment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

