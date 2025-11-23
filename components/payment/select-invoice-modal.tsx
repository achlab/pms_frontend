/**
 * Select Invoice Modal Component
 * Allows landlords to select an invoice to record payment for
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  DollarSign,
  CreditCard
} from "lucide-react";
import { landlordInvoiceService } from "@/lib/services/landlord-invoice.service";
import { formatCurrency, formatDate } from "@/lib/api-utils";
import { toast } from "sonner";
import type { Invoice } from "@/lib/api-types";

interface SelectInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export function SelectInvoiceModal({
  isOpen,
  onClose,
  onSelectInvoice,
}: SelectInvoiceModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadUnpaidInvoices();
    }
  }, [isOpen]);

  const loadUnpaidInvoices = async () => {
    try {
      setLoading(true);
      // Load pending and overdue invoices (not paid ones)
      const [pendingResponse, overdueResponse] = await Promise.allSettled([
        landlordInvoiceService.getPendingInvoices({ per_page: 50 }),
        landlordInvoiceService.getOverdueInvoices({ per_page: 50 })
      ]);

      const allInvoices: Invoice[] = [];
      
      if (pendingResponse.status === "fulfilled") {
        allInvoices.push(...pendingResponse.value.data);
      }
      
      if (overdueResponse.status === "fulfilled") {
        allInvoices.push(...overdueResponse.value.data);
      }

      // Remove duplicates and sort by due date
      const uniqueInvoices = allInvoices.filter((invoice, index, self) => 
        index === self.findIndex(i => i.id === invoice.id)
      );
      
      uniqueInvoices.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      
      setInvoices(uniqueInvoices);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.tenant.name.toLowerCase().includes(query) ||
      invoice.property.name.toLowerCase().includes(query) ||
      invoice.unit.unit_number.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
      partially_paid: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleSelectInvoice = (invoice: Invoice) => {
    onSelectInvoice(invoice);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Invoice for Payment</DialogTitle>
          <DialogDescription>
            Choose an unpaid invoice to record a payment for
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number, tenant name, property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Invoice List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No invoices found" : "No unpaid invoices"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : "All invoices are paid or there are no invoices yet"
                }
              </p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                onClick={() => handleSelectInvoice(invoice)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Invoice Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-lg">
                            {invoice.invoice_number}
                          </span>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.replace('_', ' ')}
                        </Badge>
                        {invoice.is_overdue && (
                          <Badge variant="destructive">
                            {invoice.days_overdue} days overdue
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{invoice.tenant.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{invoice.property.name} - Unit {invoice.unit.unit_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due: {formatDate(invoice.due_date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount Info */}
                    <div className="text-right space-y-1 ml-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-bold">
                          {formatCurrency(invoice.total_amount)}
                        </span>
                      </div>
                      {invoice.outstanding_balance > 0 && (
                        <div className="text-sm text-orange-600 font-medium">
                          Outstanding: {formatCurrency(invoice.outstanding_balance)}
                        </div>
                      )}
                      <Button size="sm" className="mt-2">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Record Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {!loading && filteredInvoices.length > 0 && (
          <div className="border-t pt-3 text-sm text-muted-foreground">
            Showing {filteredInvoices.length} unpaid invoice{filteredInvoices.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
