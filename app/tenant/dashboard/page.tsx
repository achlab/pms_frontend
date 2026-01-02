"use client";

import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useRouter } from "next/navigation";
import {
  Home,
  DollarSign,
  Calendar,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowRight,
  Building2,
  CreditCard,
  FileText,
  Activity,
  Award,
  Target,
  Zap,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TenantDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useDashboard(true);

  const dashboardData = data?.data;

  // Debug logging
  console.log("Tenant Dashboard Debug:", {
    data,
    dashboardData,
    isLoading,
    error,
    hasActiveLease: dashboardData?.has_active_lease,
    apiResponse: data,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !dashboardData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load dashboard data. Please refresh the page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!dashboardData.has_active_lease) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
          <div className="max-w-7xl mx-auto">
            <Card className="text-center p-12">
              <Home className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Active Lease</h2>
              <p className="text-muted-foreground mb-6">
                You don't have an active lease at the moment.
              </p>
              <Button onClick={() => router.push("/properties")}>
                Browse Available Properties
              </Button>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle both old and new response formats
  const lease = dashboardData?.lease;
  const payments = dashboardData?.payments;
  const payment_history = dashboardData?.payment_history || [];
  const maintenance = dashboardData?.maintenance;
  const recent_maintenance = dashboardData?.recent_maintenance || [];
  const payment_trends = dashboardData?.payment_trends || [];

  // Determine payment status color
  const getPaymentStatusColor = () => {
    if (!payments?.next_payment) return "text-green-600";
    if (payments.next_payment.status === "overdue") return "text-red-600";
    if (payments.next_payment.days_until_due <= 3) return "text-orange-600";
    return "text-blue-600";
  };

  const getPaymentScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-500";
    if (score >= 75) return "from-blue-500 to-cyan-500";
    if (score >= 60) return "from-orange-500 to-amber-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 px-8 py-12 md:px-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <Badge className="bg-white/20 text-white border-white/30">Active Lease</Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Welcome Home! 🏠
              </h1>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-6 w-6 text-white" />
                    <h3 className="text-white font-semibold text-lg">Your Property</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{lease?.property?.name || 'Loading...'}</p>
                  <p className="text-blue-100 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {lease?.property?.address || 'Loading...'}
                  </p>
                  <p className="text-blue-100 mt-2">
                    Unit {lease?.unit?.unit_number || 'N/A'} • {lease?.unit?.bedrooms || 0} Bed • {lease?.unit?.bathrooms || 0} Bath
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-6 w-6 text-white" />
                    <h3 className="text-white font-semibold text-lg">Lease Details</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-white">
                      <span className="text-blue-100">Start Date:</span>
                      <span className="font-semibold">{lease?.start_date ? formatDate(lease.start_date) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span className="text-blue-100">End Date:</span>
                      <span className="font-semibold">{lease?.end_date ? formatDate(lease.end_date) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span className="text-blue-100">Days Remaining:</span>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {lease?.days_remaining || 0} days
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Payment Score */}
            <Card className={`bg-gradient-to-r ${getPaymentScoreColor(payments?.payment_score || 0)} text-white border-0 shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Payment Score</p>
                    <p className="text-3xl font-bold">{payments?.payment_score || 0}%</p>
                    <p className="text-white/80 text-xs mt-1">
                      {payments?.on_time_payments || 0}/{payments?.completed_payments || 0} on time
                    </p>
                  </div>
                  <Award className="h-12 w-12 text-white/40" />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Rent */}
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Monthly Rent</p>
                    <p className="text-3xl font-bold">{formatCurrency(lease?.rent_amount || 0)}</p>
                    <p className="text-white/80 text-xs mt-1">Security: {formatCurrency(lease?.security_deposit || 0)}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-white/40" />
                </div>
              </CardContent>
            </Card>

            {/* Next Payment */}
            <Card className={`bg-gradient-to-r ${
              !payments?.next_payment ? "from-green-500 to-emerald-500" :
              payments.next_payment.status === "overdue" ? "from-red-500 to-pink-500" :
              payments.next_payment.days_until_due <= 3 ? "from-orange-500 to-amber-500" :
              "from-purple-500 to-indigo-500"
            } text-white border-0 shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Next Payment</p>
                    {payments?.next_payment ? (
                      <>
                        <p className="text-3xl font-bold">{formatCurrency(payments.next_payment.amount)}</p>
                        <p className="text-white/80 text-xs mt-1">
                          {payments.next_payment.days_until_due >= 0
                            ? `Due in ${payments.next_payment.days_until_due} days`
                            : `Overdue by ${Math.abs(payments.next_payment.days_until_due)} days`
                          }
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">All Paid</p>
                        <p className="text-white/80 text-xs mt-1">No pending payments</p>
                      </>
                    )}
                  </div>
                  {payments.next_payment?.status === "overdue" ? (
                    <AlertTriangle className="h-12 w-12 text-white/60" />
                  ) : (
                    <CheckCircle2 className="h-12 w-12 text-white/40" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Requests */}
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Maintenance</p>
                    <p className="text-3xl font-bold">{maintenance?.total || 0}</p>
                    <p className="text-white/80 text-xs mt-1">
                      {maintenance?.in_progress || 0} in progress, {maintenance?.completed || 0} completed
                    </p>
                  </div>
                  <Wrench className="h-12 w-12 text-white/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Payment History */}
            <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Recent Payment History
                </CardTitle>
                <CardDescription>Your last 6 payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payment_history && payment_history.length > 0 ? (
                    payment_history.map((payment: any) => (
                      <div
                        key={payment.id}
                        className={`p-4 rounded-lg border-2 ${
                          payment.status === "completed"
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                            : payment.status === "overdue"
                            ? "bg-red-50 border-red-200 dark:bg-red-900/20"
                            : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Due: {formatDate(payment.due_date)}
                            </p>
                            {payment.payment_date && (
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Paid: {formatDate(payment.payment_date)}
                                {payment.was_on_time && (
                                  <span className="ml-2 text-green-600">✓ On Time</span>
                                )}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={
                              payment.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : payment.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No payment history yet</p>
                  )}
                </div>

                {payments?.next_payment && (
                  <Button
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/pay-rent")}
                  >
                    Pay Now - {formatCurrency(payments.next_payment.amount)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Landlord Contact */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Your Landlord
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{lease?.landlord?.name || 'Landlord'}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      {lease?.landlord?.email || 'N/A'}
                    </div>
                    {lease?.landlord?.phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        {lease.landlord.phone}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/settings")}>
                    Contact Landlord
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/maintenance/create")}
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    New Maintenance Request
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/payments")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View All Payments
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/my-lease")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Lease Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Maintenance Requests */}
          {recent_maintenance && recent_maintenance.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-emerald-600" />
                  Recent Maintenance Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {recent_maintenance.map((request: any) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer"
                      onClick={() => router.push(`/maintenance?requestId=${request.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                        <Badge className={
                          request.status === "completed" ? "bg-green-100 text-green-700" :
                          request.status === "in_progress" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{request.priority} Priority</span>
                        <span>{request.days_open} days ago</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push("/maintenance")}
                >
                  View All Maintenance Requests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
