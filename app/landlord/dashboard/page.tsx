"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";
import {
  useLandlordDashboard,
  useQuickStats,
  usePortfolioHealthScore,
} from "@/lib/hooks/use-landlord-analytics";
import { useUnassignedMaintenanceRequests } from "@/lib/hooks/use-landlord-maintenance";
import { useExpiringLeases } from "@/lib/hooks/use-landlord-leases";
import { useOverdueInvoices } from "@/lib/hooks/use-landlord-invoices";
import {
  Building2,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  FileText,
  UserPlus,
  ArrowRight,
  Activity,
  Percent,
} from "lucide-react";

export default function LandlordDashboardPage() {
  // Fetch dashboard data with loading states
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useLandlordDashboard();
  const { data: quickStats, loading: statsLoading } = useQuickStats();
  const { score: healthScore, loading: scoreLoading } = usePortfolioHealthScore();
  
  // Fetch urgent items
  const { data: unassignedRequests, loading: unassignedLoading } = useUnassignedMaintenanceRequests({ per_page: 5 });
  const { data: expiringLeases, loading: leasesLoading } = useExpiringLeases(30);
  const { data: overdueInvoices, loading: invoicesLoading } = useOverdueInvoices({ per_page: 5 });

  // Main loading state
  if (dashboardLoading || statsLoading || scoreLoading) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Error Loading Dashboard</h2>
            <p className="mt-2 text-red-600 dark:text-red-300">{dashboardError}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const financialSummary = dashboardData?.financial_summary;
  const occupancyAnalytics = dashboardData?.occupancy_analytics;
  const maintenanceAnalytics = dashboardData?.maintenance_analytics;
  const tenantAnalytics = dashboardData?.tenant_analytics;

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Landlord Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive overview of your property portfolio
            </p>
          </div>
          
          {/* Portfolio Health Score */}
          {healthScore > 0 && (
            <Card className="w-full md:w-auto">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <svg className="w-16 h-16">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${(healthScore / 100) * 175.93} 175.93`}
                        strokeLinecap="round"
                        className={`${
                          healthScore >= 80
                            ? "text-green-500"
                            : healthScore >= 60
                            ? "text-yellow-500"
                            : "text-red-500"
                        } transition-all`}
                        transform="rotate(-90 32 32)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{healthScore}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Health</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Attention"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                GH¢{financialSummary?.total_revenue?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {financialSummary && financialSummary.growth_percentage >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">+{financialSummary.growth_percentage}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{financialSummary?.growth_percentage}%</span>
                  </>
                )}
                {" "}from last month
              </p>
            </CardContent>
          </Card>

          {/* Total Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.property_summary?.total_properties || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData?.property_summary?.active_properties || 0} active
              </p>
            </CardContent>
          </Card>

          {/* Occupancy Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {occupancyAnalytics?.overall_occupancy_rate?.toFixed(1) || "0"}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {occupancyAnalytics?.occupied_units || 0} / {occupancyAnalytics?.total_units || 0} units
              </p>
            </CardContent>
          </Card>

          {/* Active Tenants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tenantAnalytics?.total_tenants || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {tenantAnalytics?.active_leases || 0} active leases
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Urgent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned Maintenance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-base">Unassigned Requests</CardTitle>
                </div>
                {!unassignedLoading && unassignedRequests && unassignedRequests.data.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs font-medium px-2 py-1 rounded">
                    {unassignedRequests.data.length}
                  </span>
                )}
              </div>
              <CardDescription>Maintenance requests awaiting assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {unassignedLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : unassignedRequests && unassignedRequests.data.length > 0 ? (
                <div className="space-y-3">
                  {unassignedRequests.data.slice(0, 5).map((request) => (
                    <Link
                      key={request.id}
                      href={`/maintenance`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{request.title}</p>
                        <p className="text-xs text-gray-500">{request.property.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        request.priority === "emergency"
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      }`}>
                        {request.priority}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/maintenance"
                    className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                  >
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                  <p className="text-sm">All requests assigned!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiring Leases */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-base">Expiring Leases</CardTitle>
                </div>
                {!leasesLoading && expiringLeases.length > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs font-medium px-2 py-1 rounded">
                    {expiringLeases.length}
                  </span>
                )}
              </div>
              <CardDescription>Leases expiring in next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {leasesLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : expiringLeases.length > 0 ? (
                <div className="space-y-3">
                  {expiringLeases.slice(0, 5).map((lease) => (
                    <Link
                      key={lease.id}
                      href={`/my-lease`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lease.tenant.name}</p>
                        <p className="text-xs text-gray-500">{lease.unit.unit_number}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(lease.end_date).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/my-lease"
                    className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                  >
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                  <p className="text-sm">No leases expiring soon</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-base">Overdue Invoices</CardTitle>
                </div>
                {!invoicesLoading && overdueInvoices.length > 0 && (
                  <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs font-medium px-2 py-1 rounded">
                    {overdueInvoices.length}
                  </span>
                )}
              </div>
              <CardDescription>Invoices past due date</CardDescription>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : overdueInvoices.length > 0 ? (
                <div className="space-y-3">
                  {overdueInvoices.slice(0, 5).map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{invoice.tenant.name}</p>
                        <p className="text-xs text-gray-500">{invoice.invoice_number}</p>
                      </div>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        GH¢{invoice.total_amount.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/invoices"
                    className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
                  >
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mb-2 text-green-500" />
                  <p className="text-sm">No overdue invoices</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Maintenance & Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                <CardTitle>Maintenance Overview</CardTitle>
              </div>
              <CardDescription>Current maintenance request status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-medium">{maintenanceAnalytics?.total_pending_requests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm">In Progress</span>
                  </div>
                  <span className="font-medium">{maintenanceAnalytics?.total_in_progress_requests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-medium">{maintenanceAnalytics?.total_completed_requests || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm">Emergency</span>
                  </div>
                  <span className="font-medium text-red-600">{maintenanceAnalytics?.emergency_requests || 0}</span>
                </div>
              </div>
              <Link
                href="/maintenance"
                className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-6"
              >
                View all maintenance <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <CardTitle>Financial Summary</CardTitle>
              </div>
              <CardDescription>Current month financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                  <span className="font-medium text-green-600">
                    GH¢{financialSummary?.total_revenue?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
                  <span className="font-medium text-red-600">
                    GH¢{financialSummary?.total_expenses?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm font-medium">Net Profit</span>
                  <span className="font-bold text-lg">
                    GH¢{financialSummary?.net_profit?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</span>
                  <span className="font-medium">
                    {financialSummary?.profit_margin?.toFixed(1) || "0"}%
                  </span>
                </div>
              </div>
              <Link
                href="/reports"
                className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-6"
              >
                View detailed analytics <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/properties"
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors group"
              >
                <Building2 className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-2" />
                <span className="text-sm font-medium">Add Property</span>
              </Link>
              <Link
                href="/tenants"
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors group"
              >
                <UserPlus className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-2" />
                <span className="text-sm font-medium">Add Tenant</span>
              </Link>
              <Link
                href="/invoices"
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors group"
              >
                <FileText className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-2" />
                <span className="text-sm font-medium">Create Invoice</span>
              </Link>
              <Link
                href="/my-lease"
                className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors group"
              >
                <Home className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-2" />
                <span className="text-sm font-medium">New Lease</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
