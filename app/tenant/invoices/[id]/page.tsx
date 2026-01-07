"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { useAuth } from "@/contexts/auth-context";
import { useInvoice, useInvoicePayments } from "@/lib/hooks/use-invoice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PaymentHistoryList } from "@/components/payments/payment-history-list";
import {
  ArrowLeft,
  CreditCard,
  RefreshCw,
  AlertCircle,
  FileText,
  Building2,
  User,
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate, formatStatus, getErrorMessage } from "@/lib/api-utils";

export default function TenantInvoiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const invoiceId = params?.id || "";

  const {
    data: invoiceResponse,
    isLoading,
    error,
    refetch,
  } = useInvoice(invoiceId, Boolean(invoiceId));

  const {
    data: paymentsResponse,
    isLoading: paymentsLoading,
  } = useInvoicePayments(invoiceId, Boolean(invoiceId));

  const invoice = invoiceResponse?.data;
  const payments = paymentsResponse?.data?.payments ?? [];

  const totalPaid = useMemo(() => {
    if (!invoice) return 0;
    const outstanding = Number(invoice.outstanding_balance ?? 0);
    const total = Number(invoice.total_amount ?? 0);
    return Math.max(total - outstanding, 0);
  }, [invoice]);

  if (!user || user.role !== "tenant") {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="rounded-xl border bg-white dark:bg-slate-900 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">
              You do not have permission to view this invoice.
            </p>
            <Button className="mt-6" onClick={() => router.push("/login")}>
              Return to Login
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-xl border bg-white dark:bg-slate-900 px-6 py-4 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium text-muted-foreground">Loading invoice details...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <Card className="border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-200">
                <AlertCircle className="h-5 w-5" />
                Failed to load invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-700 dark:text-red-100">
              {getErrorMessage(error)}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <div className="rounded-xl border bg-white dark:bg-slate-900 p-10 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h2 className="mt-4 text-2xl font-semibold">Invoice not found</h2>
            <p className="mt-2 text-muted-foreground">
              The invoice you are looking for does not exist or you no longer have access to it.
            </p>
            <Button className="mt-6" onClick={() => router.push("/tenant/invoices")}>
              Return to My Invoices
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const statusBadgeVariant: Record<string, string> = {
    paid: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
    partially_paid: "bg-orange-100 text-orange-800 border-orange-200",
  };

  const propertyName = invoice.property?.name || "Unknown property";
  const unitNumber = invoice.unit?.unit_number || "N/A";

  const additionalChargesArray = Array.isArray(invoice.additional_charges)
    ? invoice.additional_charges
    : [];

  const handleSubmitEvidence = () => {
    router.push(`/tenant/invoices?invoiceId=${invoice.id}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()} className="shrink-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <p className="text-sm text-muted-foreground">Invoice</p>
                <h1 className="text-3xl font-bold">#{invoice.invoice_number}</h1>
                <p className="text-muted-foreground">
                  {propertyName} — Unit {unitNumber}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleSubmitEvidence}>
                <CreditCard className="mr-2 h-4 w-4" />
                Submit Payment Evidence
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Invoice Overview
                    </CardTitle>
                    <Badge className={statusBadgeVariant[invoice.status] || "bg-slate-100 text-slate-800"}>
                      {formatStatus(invoice.status)}
                    </Badge>
                  </div>
                  {invoice.status === "paid" && invoice.paid_at && (
                    <p className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Paid on {formatDate(invoice.paid_at)}
                    </p>
                  )}
                  {invoice.status === "overdue" && invoice.due_date && (
                    <p className="flex items-center gap-2 text-sm text-red-600">
                      <Clock className="h-4 w-4" />
                      Overdue since {formatDate(invoice.due_date)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className={`font-medium ${invoice.is_overdue ? "text-red-600" : ""}`}>
                      {formatDate(invoice.due_date)}
                      {invoice.is_overdue && invoice.days_overdue ? (
                        <span className="text-xs text-red-500">
                          {" "}
                          ({invoice.days_overdue} days overdue)
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Period</p>
                    <p className="font-medium">
                      {formatDate(invoice.period_start)} – {formatDate(invoice.period_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Type</p>
                    <p className="font-medium capitalize">{invoice.invoice_type || "rent"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Property & Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="font-semibold">{propertyName}</p>
                    {invoice.property?.address && (
                      <p className="text-sm text-muted-foreground">{invoice.property.address}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit</p>
                    <p className="font-semibold">{unitNumber}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Landlord</p>
                      <p className="font-medium">{invoice.landlord?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Created On</p>
                      <p className="font-medium">{formatDate(invoice.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Base Rent</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(Number(invoice.base_rent_amount ?? invoice.total_amount))}
                      </span>
                    </div>

                    {additionalChargesArray.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Additional Charges</p>
                          {additionalChargesArray.map((charge, index) => (
                            <div key={`${charge.name || charge.description || index}`} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {charge.name || "Charge"}
                                {charge.description && (
                                  <span className="block text-xs text-muted-foreground">
                                    {charge.description}
                                  </span>
                                )}
                              </span>
                              <span className="font-medium">{formatCurrency(Number(charge.amount))}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount</span>
                      <span>{formatCurrency(Number(invoice.total_amount))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Amount Paid</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-orange-600">
                      <span>Outstanding Balance</span>
                      <span>{formatCurrency(Number(invoice.outstanding_balance))}</span>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
                      <p className="font-semibold text-slate-900 dark:text-white">Notes from landlord</p>
                      <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <PaymentHistoryList
                title="Payments & Credits"
                payments={payments}
                loading={paymentsLoading}
                emptyMessage="You have not made any payments toward this invoice yet."
              />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Need to pay later?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Submit your payment evidence whenever you make an offline payment.</p>
                  <p>You can attach up to 5 images or PDFs of receipts for faster verification.</p>
                  <Button className="w-full" onClick={handleSubmitEvidence}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Submit Payment Evidence
                  </Button>
                  <p className="text-xs text-slate-500">
                    Your landlord will verify and record the payment so both of you remain in sync.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

