"use client";

import { useState } from "react";
import { usePaymentHistory } from "@/lib/hooks/use-invoice";
import { PaymentHistoryTable } from "@/components/payment/payment-history-table";
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CreditCard, RefreshCw, Download } from "lucide-react";
import { getErrorMessage, formatCurrency } from "@/lib/api-utils";
import type { PaymentMethod } from "@/lib/api-types";

export default function PaymentHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | undefined>();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const { data, isLoading, error, refetch, isFetching, isStale } = usePaymentHistory({
    payment_method: paymentMethodFilter,
    start_date: startDate,
    end_date: endDate,
    page: currentPage,
    per_page: 15,
    sort_by: "created_at",
    sort_order: "desc", // Latest payments first
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={10} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Payment History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
            {getErrorMessage(error)}
          </p>
          <Button onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  const payments = data?.data || [];
  const summary = data?.summary;
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <div className="container mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Payment History
                </h1>
                {isStale && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Cached Data</span>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground">
                View all your payment transactions
                {isStale && " (Updating...)"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} disabled={isFetching} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className={`bg-white dark:bg-slate-800 rounded-lg border p-4 relative ${isStale ? 'opacity-75' : ''}`}>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{summary.total_payments}</p>
              </div>
              <div className={`bg-white dark:bg-slate-800 rounded-lg border p-4 relative ${isStale ? 'opacity-75' : ''}`}>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.total_amount_paid)}
                </p>
              </div>
              <div className={`bg-white dark:bg-slate-800 rounded-lg border p-4 relative ${isStale ? 'opacity-75' : ''}`}>
                <p className="text-sm text-muted-foreground">Mobile Money</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.payment_methods_breakdown.mobile_money)}
                </p>
              </div>
              <div className={`bg-white dark:bg-slate-800 rounded-lg border p-4 relative ${isStale ? 'opacity-75' : ''}`}>
                <p className="text-sm text-muted-foreground">Bank Transfer</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary.payment_methods_breakdown.bank_transfer)}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
            <h3 className="font-semibold mb-4">Filter Payments</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentMethodFilter || "all"}
                  onValueChange={(value) =>
                    setPaymentMethodFilter(value !== "all" ? (value as PaymentMethod) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate || ""}
                  onChange={(e) => setEndDate(e.target.value || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPaymentMethodFilter(undefined);
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Table */}
          <PaymentHistoryTable 
            payments={payments} 
            currentPage={currentPage}
            perPage={15}
            onStatusUpdate={() => refetch()}
          />

          {/* Pagination Info */}
          <div className="text-sm text-muted-foreground text-center">
            Showing {payments.length} of {meta?.total || 0} payments
          </div>
        </div>
      </div>
  );
}
