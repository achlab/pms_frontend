/**
 * Dashboard Stats Overview Component
 * Displays key metrics cards for the tenant dashboard
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, FileText, AlertCircle, CheckCircle } from "lucide-react";
import type { DashboardOverview } from "@/lib/api-types";
import { formatCurrency } from "@/lib/api-utils";

interface DashboardStatsOverviewProps {
  overview: DashboardOverview;
}

export function DashboardStatsOverview({ overview }: DashboardStatsOverviewProps) {
  const stats = [
    {
      title: "Total Invoices",
      value: overview.total_invoices,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Paid Invoices",
      value: overview.paid_invoices,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Invoices",
      value: overview.pending_invoices,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Overdue Invoices",
      value: overview.overdue_invoices,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Financial Summary Cards */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Amount Paid
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(overview.total_amount_paid)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Outstanding Balance
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(overview.outstanding_balance)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

