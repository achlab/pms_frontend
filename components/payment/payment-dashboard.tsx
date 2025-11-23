/**
 * Payment Dashboard Component
 * Comprehensive payment management for landlords
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/api-utils";
import { PaymentHistoryCard } from "./payment-history-card";
import type { Payment, PaymentMethod } from "@/lib/api-types";

interface PaymentDashboardProps {
  userRole: "landlord" | "caretaker";
}

export function PaymentDashboard({ userRole }: PaymentDashboardProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("month");

  // Mock data for demonstration
  const mockPayments: Payment[] = [
    {
      id: "1",
      payment_number: "PAY-001",
      tenant: { id: "1", name: "John Doe" },
      landlord: { id: "1", name: "Jane Smith" },
      amount: 1200,
      payment_method: "mtn_momo",
      payment_reference: "MP251123.1234.A56789",
      payment_date: "2025-11-23",
      status: "completed",
      notes: "Monthly rent payment",
      recorded_by: { id: "1", name: "Jane Smith" },
      created_at: "2025-11-23T10:30:00Z",
    },
    {
      id: "2", 
      payment_number: "PAY-002",
      tenant: { id: "2", name: "Alice Johnson" },
      landlord: { id: "1", name: "Jane Smith" },
      amount: 800,
      payment_method: "cash",
      payment_reference: "",
      payment_date: "2025-11-22",
      status: "completed",
      notes: "Partial payment",
      recorded_by: { id: "1", name: "Jane Smith" },
      created_at: "2025-11-22T14:15:00Z",
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 1000);
  }, []);

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
        return "MTN MoMo";
      case "vodafone_cash":
        return "Vodafone Cash";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method.replace('_', ' ');
    }
  };

  // Calculate statistics
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPayments = payments.length;
  const methodBreakdown = payments.reduce((acc, payment) => {
    acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.amount;
    return acc;
  }, {} as Record<PaymentMethod, number>);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchQuery || 
      payment.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payment_reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter;
    
    // Date filtering logic would go here
    const matchesDate = true; // Simplified for now
    
    return matchesSearch && matchesMethod && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Track and manage all payment records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              Recorded payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPayments > 0 ? formatCurrency(totalAmount / totalPayments) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(payments.map(p => p.tenant.id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Made payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Breakdown by payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(methodBreakdown).map(([method, amount]) => (
              <div key={method} className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getPaymentMethodIcon(method as PaymentMethod)}
                  <span className="font-medium">
                    {getPaymentMethodLabel(method as PaymentMethod)}
                  </span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {((amount / totalAmount) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as PaymentMethod | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                  <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">
                  No payments match your current filters
                </p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(payment.payment_method)}
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.tenant.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatDate(payment.payment_date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </p>
                      {payment.payment_reference && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {payment.payment_reference}
                        </p>
                      )}
                    </div>
                    
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
