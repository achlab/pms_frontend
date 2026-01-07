'use client';

import { useState } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  AlertCircle,
  Clock,
  CheckCircle2,
  Wrench,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Bell,
  FileText,
  Eye,
} from 'lucide-react';
import { useLandlordDashboard } from '@/lib/hooks/use-landlord-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export default function LandlordDashboardPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const { data, isLoading, error } = useLandlordDashboard(timeframe);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              Failed to load dashboard data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
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
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
            <p className="text-muted-foreground">
              Start adding properties to see your dashboard analytics.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const { overview, revenue, maintenance, charts, property_performance, recent_activity } = data;

  const getRevenueChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getRevenueChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 px-8 py-12 md:px-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Building2 className="h-3 w-3 mr-1" />
                      Portfolio Manager
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Property Dashboard
                  </h1>
                  
                  <p className="text-blue-100 text-lg max-w-2xl">
                    Comprehensive overview of your property portfolio performance, revenue analytics, and tenant management.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['week', 'month', 'quarter', 'year'] as const).map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeframe(tf)}
                      className={timeframe === tf 
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-white/10 border-white/30 text-white hover:bg-white/20"
                      }
                    >
                      {tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-white/60" />
                  <div className={cn("flex items-center gap-1", getRevenueChangeColor(revenue.change_percentage))}>
                    {getRevenueChangeIcon(revenue.change_percentage)}
                    <span className="text-sm font-bold text-white">
                      {revenue.change_percentage > 0 ? '+' : ''}{revenue.change_percentage}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Revenue This Period</p>
                  <p className="text-3xl font-bold">{formatCurrency(revenue.this_period)}</p>
                  <p className="text-white/70 text-xs mt-1">
                    Total: {formatCurrency(revenue.total)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Properties & Units */}
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-white/60" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    {overview.occupancy_rate}%
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Properties & Units</p>
                  <p className="text-3xl font-bold">{overview.total_properties}</p>
                  <p className="text-white/70 text-xs mt-1">
                    {overview.occupied_units}/{overview.total_units} units occupied
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Tenants */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-white/60" />
                  {overview.expiring_leases > 0 && (
                    <Badge className="bg-orange-500 text-white border-0">
                      {overview.expiring_leases} expiring
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Active Tenants</p>
                  <p className="text-3xl font-bold">{overview.occupied_units}</p>
                  <p className="text-white/70 text-xs mt-1">
                    Tenants with assigned units
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Requests */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Wrench className="h-8 w-8 text-white/60" />
                  {maintenance.urgent > 0 && (
                    <Badge className="bg-red-700 text-white border-0 animate-pulse">
                      {maintenance.urgent} urgent
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Maintenance</p>
                  <p className="text-3xl font-bold">{maintenance.total}</p>
                  <p className="text-white/70 text-xs mt-1">
                    {maintenance.pending} pending, {maintenance.in_progress} in progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Revenue Trends
                </CardTitle>
                <CardDescription>Monthly revenue for the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {charts.monthly_revenue.map((item: any, index: number) => {
                    const maxRevenue = Math.max(...charts.monthly_revenue.map((m: any) => m.revenue));
                    const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {item.month}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                        <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative h-full flex items-center px-3">
                            <span className="text-xs font-medium text-white drop-shadow">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <div className="space-y-6">
              {/* Pending Payments */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(revenue.pending)}
                      </span>
                      <Badge variant="secondary">{revenue.pending_count} invoices</Badge>
                    </div>
                    <Progress value={(revenue.pending / (revenue.pending + revenue.this_period)) * 100} className="h-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Awaiting payment from tenants
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Overdue Payments */}
              {revenue.overdue > 0 && (
                <Card className="shadow-lg border-2 border-red-200 bg-red-50/50 dark:bg-red-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      Overdue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                          {formatCurrency(revenue.overdue)}
                        </span>
                        <Badge variant="destructive">{revenue.overdue_count} invoices</Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push("/landlord/invoices?status=overdue")}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Send Reminders
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/properties/create")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/landlord/invoices")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Invoices
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/reports")}
                  >
                    <PieChart className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Property Performance */}
          {property_performance && property_performance.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Property Performance
                </CardTitle>
                <CardDescription>Revenue and occupancy by property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property_performance.map((property: any) => (
                    <div
                      key={property.id}
                      className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {property.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Units</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {property.occupied_units}/{property.units}
                          </p>
                        </div>

                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Occupancy</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {property.occupancy_rate}%
                          </p>
                        </div>

                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenue</p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(property.revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {recent_activity && recent_activity.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest payments and maintenance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recent_activity.slice(0, 8).map((activity: any, index: number) => (
                    <div
                      key={`${activity.type}-${activity.id}-${index}`}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className={cn(
                        "p-2 rounded-full",
                        activity.type === 'payment' 
                          ? "bg-green-100 dark:bg-green-900/20" 
                          : "bg-orange-100 dark:bg-orange-900/20"
                      )}>
                        {activity.type === 'payment' ? (
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {activity.type === 'payment' ? (
                          <>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Payment Received: {formatCurrency(activity.amount)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              From {activity.tenant}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.property} • {activity.tenant}
                            </p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>

                      <Badge className={
                        activity.type === 'payment'
                          ? "bg-green-100 text-green-700"
                          : activity.status === 'resolved'
                          ? "bg-green-100 text-green-700"
                          : activity.priority === 'emergency'
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }>
                        {activity.type === 'payment' ? activity.status : activity.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  );
}
