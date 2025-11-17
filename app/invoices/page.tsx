"use client";

import { useState } from "react";
import { MainLayout } from "@/components/main-layout";
import { useInvoices } from "@/lib/hooks/use-invoice";
import { InvoiceList } from "@/components/invoice/invoice-list";
import { RecordPaymentModal } from "@/components/payment/record-payment-modal";
import { InvoiceListSkeleton, PageHeaderSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import { getErrorMessage } from "@/lib/api-utils";
import { useRouter } from "next/navigation";
import type { InvoiceStatus, InvoiceType } from "@/lib/api-types";

export default function InvoicesPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<InvoiceType | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string>("");
  const [selectedInvoiceBalance, setSelectedInvoiceBalance] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useInvoices({
    status: statusFilter,
    invoice_type: typeFilter,
    page: currentPage,
    per_page: 15,
  });

  const handleRecordPayment = (invoiceId: string) => {
    const invoice = data?.data?.find((inv) => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoiceId(invoiceId);
      setSelectedInvoiceNumber(invoice.invoice_number);
      setSelectedInvoiceBalance(invoice.outstanding_balance);
      setIsPaymentModalOpen(true);
    }
  };

  const handleFilterChange = (filters: {
    status?: InvoiceStatus;
    invoice_type?: InvoiceType;
    search?: string;
  }) => {
    setStatusFilter(filters.status);
    setTypeFilter(filters.invoice_type);
    setSearchQuery(filters.search);
    setCurrentPage(1); // Reset to first page when filters change
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6 space-y-6">
          <PageHeaderSkeleton />
          <InvoiceListSkeleton items={6} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Failed to Load Invoices
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
      </MainLayout>
    );
  }

  const invoices = data?.data || [];
  const summary = data?.summary;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="container mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                My Invoices
              </h1>
              <p className="text-lg text-muted-foreground">
                View and manage your invoices and payments
              </p>
            </div>
            <Button onClick={() => refetch()} disabled={isFetching} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{summary.total_invoices}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  GHS {summary.total_amount.toFixed(2)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  GHS {summary.total_paid.toFixed(2)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  GHS {summary.total_outstanding.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Invoice List */}
          <InvoiceList
            invoices={invoices}
            onViewDetails={(id) => router.push(`/invoices/${id}`)}
            onRecordPayment={handleRecordPayment}
            onFilterChange={handleFilterChange}
          />

          {/* Record Payment Modal */}
          {selectedInvoiceId && (
            <RecordPaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => {
                setIsPaymentModalOpen(false);
                setSelectedInvoiceId(null);
              }}
              invoiceId={selectedInvoiceId}
              invoiceNumber={selectedInvoiceNumber}
              outstandingBalance={selectedInvoiceBalance}
              onSuccess={() => {
                refetch();
              }}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
