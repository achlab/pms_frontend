import type { Invoice } from "@/lib/api-types";

export interface InvoiceSummaryMetrics {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
  partiallyPaidCount: number;
  draftCount: number;
  collectionRate: number;
  collectedAmount: number;
}

const numberOrZero = (value: unknown): number => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const extractCount = (summary: any, key: string): number => {
  const value = summary?.[key];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export function buildInvoiceSummary(
  invoices: Invoice[],
  apiSummary?: Record<string, any> | null
): InvoiceSummaryMetrics {
  const derived = invoices.reduce(
    (acc, invoice) => {
      const totalAmount = numberOrZero(invoice.total_amount);
      const outstanding = Math.max(numberOrZero(invoice.outstanding_balance), 0);
      const paidAmount = Math.max(totalAmount - outstanding, 0);
      const status = (invoice.status || "").toLowerCase();

      acc.totalAmount += totalAmount;
      acc.totalOutstanding += outstanding;
      acc.totalPaid += paidAmount;
      acc.statusMap.set(status, (acc.statusMap.get(status) ?? 0) + 1);

      return acc;
    },
    {
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      statusMap: new Map<string, number>(),
    }
  );

  const baseSummary: InvoiceSummaryMetrics = {
    totalInvoices: invoices.length,
    totalAmount: derived.totalAmount,
    totalPaid: derived.totalPaid,
    totalOutstanding: derived.totalOutstanding,
    pendingCount: derived.statusMap.get("pending") ?? 0,
    paidCount: derived.statusMap.get("paid") ?? 0,
    overdueCount: derived.statusMap.get("overdue") ?? 0,
    partiallyPaidCount: derived.statusMap.get("partially_paid") ?? 0,
    draftCount: derived.statusMap.get("draft") ?? 0,
    collectionRate: derived.totalAmount > 0 ? (derived.totalPaid / derived.totalAmount) * 100 : 0,
    collectedAmount: derived.totalPaid,
  };

  if (!apiSummary) {
    return baseSummary;
  }

  return {
    totalInvoices: numberOrZero(apiSummary.total_invoices) || baseSummary.totalInvoices,
    totalAmount: numberOrZero(apiSummary.total_amount) || baseSummary.totalAmount,
    totalPaid: numberOrZero(apiSummary.total_paid) || baseSummary.totalPaid,
    totalOutstanding:
      numberOrZero(apiSummary.total_outstanding) || baseSummary.totalOutstanding,
    pendingCount: extractCount(apiSummary, "pending_invoices") || baseSummary.pendingCount,
    paidCount: extractCount(apiSummary, "paid_invoices") || baseSummary.paidCount,
    overdueCount: extractCount(apiSummary, "overdue_invoices") || baseSummary.overdueCount,
    partiallyPaidCount:
      extractCount(apiSummary, "partially_paid_invoices") || baseSummary.partiallyPaidCount,
    draftCount: extractCount(apiSummary, "draft_invoices") || baseSummary.draftCount,
    collectionRate:
      numberOrZero(apiSummary.collection_rate_percentage ?? apiSummary.collection_rate) ||
      baseSummary.collectionRate,
    collectedAmount:
      numberOrZero(apiSummary.collected_amount ?? apiSummary.total_paid) ||
      baseSummary.collectedAmount,
  };
}

