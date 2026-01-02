/**
 * Invoice Status Display Helpers
 * Handles payment verification workflow status badges and labels
 */

import type { InvoiceStatus } from "@/lib/api-types";

export interface StatusBadgeConfig {
  label: string;
  color: "default" | "warning" | "success" | "danger" | "info" | "orange";
  description: string;
}

export function getInvoiceStatusBadge(status: InvoiceStatus): StatusBadgeConfig {
  const statusMap: Record<InvoiceStatus, StatusBadgeConfig> = {
    pending: {
      label: "Unpaid",
      color: "danger",
      description: "No payment recorded",
    },
    payment_submitted: {
      label: "Awaiting Verification",
      color: "orange",
      description: "Payment submitted, awaiting landlord approval",
    },
    payment_verified: {
      label: "Payment Verified",
      color: "info",
      description: "Payment verified by landlord",
    },
    partially_paid: {
      label: "Partially Paid",
      color: "info",
      description: "Partial payment verified",
    },
    paid: {
      label: "Fully Paid",
      color: "success",
      description: "Invoice fully paid and verified",
    },
    overdue: {
      label: "Overdue",
      color: "danger",
      description: "Payment past due date",
    },
  };

  return statusMap[status] || statusMap.pending;
}

export function getPaymentVerificationStatus(
  invoiceStatus: InvoiceStatus,
  verificationStatus?: string | null,
  pendingAmount?: number
): {
  showBadge: boolean;
  label: string;
  color: string;
  icon?: string;
} {
  // If payment submitted but not verified
  if (invoiceStatus === "payment_submitted" && verificationStatus === "pending_verification") {
    return {
      showBadge: true,
      label: `GH₵${pendingAmount?.toFixed(2) || "0.00"} Pending Verification`,
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      icon: "⏳",
    };
  }

  // If payment was rejected
  if (verificationStatus === "rejected") {
    return {
      showBadge: true,
      label: "Payment Rejected",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      icon: "❌",
    };
  }

  // If payment verified
  if (verificationStatus === "verified") {
    return {
      showBadge: true,
      label: "Verified by Landlord",
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: "✓",
    };
  }

  return { showBadge: false, label: "", color: "" };
}

/**
 * Format status for display in dropdown
 */
export function formatInvoiceDropdownLabel(invoice: {
  invoice_number: string;
  total_amount: number;
  outstanding_balance?: number;
  status: InvoiceStatus;
  verification_status?: string | null;
  pending_verification_amount?: number;
}): string {
  const statusBadge = getInvoiceStatusBadge(invoice.status);
  const balance = invoice.outstanding_balance ?? invoice.total_amount;

  let label = `${invoice.invoice_number} - GH₵${balance.toFixed(2)}`;

  // Add status indicator
  if (invoice.status === "payment_submitted") {
    label += ` [Awaiting Verification: GH₵${invoice.pending_verification_amount?.toFixed(2) || "0.00"}]`;
  } else if (invoice.status === "partially_paid") {
    label += ` [${statusBadge.label}]`;
  } else if (invoice.status === "paid") {
    label += ` [✓ Paid]`;
  } else if (invoice.status === "overdue") {
    label += ` [⚠ Overdue]`;
  }

  return label;
}

/**
 * Get CSS classes for status badges
 */
export function getStatusBadgeClasses(color: StatusBadgeConfig["color"]): string {
  const colorMap: Record<StatusBadgeConfig["color"], string> = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };

  return `${colorMap[color]} text-xs font-medium px-2.5 py-0.5 rounded-full`;
}
