/**
 * Invoice List Component
 * Displays a list of invoices with filters
 */

"use client";

import { useState } from "react";
import { InvoiceCard } from "./invoice-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import type { Invoice, InvoiceStatus, InvoiceType } from "@/lib/api-types";

interface InvoiceListProps {
  invoices: Invoice[];
  onViewDetails?: (invoiceId: string) => void;
  onRecordPayment?: (invoiceId: string) => void;
  onFilterChange?: (filters: {
    status?: InvoiceStatus;
    invoice_type?: InvoiceType;
    search?: string;
  }) => void;
  actionLabel?: string;
}

export function InvoiceList({
  invoices,
  onViewDetails,
  onRecordPayment,
  onFilterChange,
  actionLabel,
}: InvoiceListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = () => {
    if (onFilterChange) {
      onFilterChange({
        status: statusFilter !== "all" ? (statusFilter as InvoiceStatus) : undefined,
        invoice_type: typeFilter !== "all" ? (typeFilter as InvoiceType) : undefined,
        search: searchQuery || undefined,
      });
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (onFilterChange) {
      onFilterChange({
        status: value !== "all" ? (value as InvoiceStatus) : undefined,
        invoice_type: typeFilter !== "all" ? (typeFilter as InvoiceType) : undefined,
        search: searchQuery || undefined,
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    if (onFilterChange) {
      onFilterChange({
        status: statusFilter !== "all" ? (statusFilter as InvoiceStatus) : undefined,
        invoice_type: value !== "all" ? (value as InvoiceType) : undefined,
        search: searchQuery || undefined,
      });
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesType = typeFilter === "all" || invoice.invoice_type === typeFilter;
    const matchesSearch =
      !searchQuery ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.property.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFilterChange();
                }
              }}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="utility">Utility</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border">
          <p className="text-muted-foreground">No invoices found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onViewDetails={onViewDetails}
              onRecordPayment={onRecordPayment}
              actionLabel={actionLabel}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredInvoices.length} of {invoices.length} invoices
      </div>
    </div>
  );
}

