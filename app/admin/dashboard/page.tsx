"use client"

import { useAuth } from "@/contexts/auth-context"
import {
  useSuperAdminOverview,
  useSuperAdminFinancialSummary,
  useSuperAdminOccupancyAnalytics,
  useSuperAdminMaintenanceOverview,
  useSuperAdminRecentActivities,
  useSuperAdminTopLandlords,
  useSuperAdminHealthScore,
} from "@/lib/hooks/use-super-admin-analytics"
import {
  useSuperAdminEmergencyRequests,
  useSuperAdminOpenRequests,
} from "@/lib/hooks/use-super-admin-maintenance"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Users, 
  Wrench, 
  AlertTriangle,
  Building2,
  Crown,
  Shield,
  Target,
  Zap,
  Award,
  BarChart3,
  PieChart,
  TrendingUpIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user: currentUser, isLoading: authLoading } = useAuth()

  // Fetch all dashboard data
  const { data: overview, loading: overviewLoading, error: overviewError, refetch: refetchOverview } = useSuperAdminOverview()
  const { data: financial, loading: financialLoading, error: financialError } = useSuperAdminFinancialSummary()
  const { data: occupancy, loading: occupancyLoading, error: occupancyError } = useSuperAdminOccupancyAnalytics()
  const { data: maintenance, loading: maintenanceLoading, error: maintenanceError } = useSuperAdminMaintenanceOverview()
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useSuperAdminRecentActivities(10)
  const { data: topLandlords, loading: landlordLoading, error: landlordError } = useSuperAdminTopLandlords(5)
  const { score: healthScore, loading: healthLoading, error: healthError } = useSuperAdminHealthScore()
  const { data: emergencyRequests } = useSuperAdminEmergencyRequests()
  const { data: openRequests } = useSuperAdminOpenRequests()

  const loading = overviewLoading || financialLoading || occupancyLoading || maintenanceLoading || authLoading
  const hasError = overviewError || financialError || occupancyError || maintenanceError || activitiesError || landlordError || healthError

  // Loading state
  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
    )
  }

  // Access control
  if (!currentUser || currentUser.role !== "super_admin") {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-8">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>
                Access Denied. This page is restricted to system administrators only.
              </AlertDescription>
            </Alert>
          </div>
        </div>
    )
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600";
    if (score >= 75) return "from-blue-500 to-cyan-600";
    if (score >= 60) return "from-orange-500 to-amber-600";
    return "from-red-500 to-pink-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Failed to Load Dashboard Data</p>
                  <p className="text-sm">
                    {overviewError || financialError || occupancyError || maintenanceError || activitiesError || landlordError || healthError}
                  </p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    This is likely a backend issue. Please check the backend server logs or contact your system administrator.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchOverview()}
                  className="ml-4 bg-white hover:bg-gray-50"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 px-8 py-12 md:px-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Crown className="h-3 w-3 mr-1" />
                      System Administrator
                    </Badge>
                    {healthScore !== null && (
                      <Badge className={cn(
                        "bg-gradient-to-r text-white border-0",
                        getHealthScoreColor(healthScore)
                      )}>
                        <Shield className="h-3 w-3 mr-1" />
                        Health: {healthScore.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Platform Command Center
                  </h1>
                  
                  <p className="text-purple-100 text-lg max-w-2xl">
                    Complete oversight of platform health, user activity, financial performance, 
                    and operational metrics across all properties and landlords.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="bg-white text-purple-600 hover:bg-purple-50"
                    onClick={() => router.push("/admin/users")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/admin/properties")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    View Properties
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alerts */}
          {(emergencyRequests?.data && emergencyRequests.data.length > 0) && (
            <Alert className="border-2 border-red-500 bg-red-50 dark:bg-red-950 shadow-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {emergencyRequests.data.length} Emergency Maintenance {emergencyRequests.data.length === 1 ? 'Request' : 'Requests'}
                    </p>
                    <p className="text-sm">Immediate attention required</p>
                  </div>
                  <Link href="/admin/maintenance?priority=emergency">
                    <Button variant="destructive" size="sm">
                      View Emergencies →
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Platform Overview - Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-white/60" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    {financial?.collection_rate?.toFixed(1)}% collected
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Platform Revenue</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(overview?.total_monthly_revenue || 0)}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    {formatCurrency(financial?.total_outstanding || 0)} outstanding
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Properties & Units */}
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Home className="h-8 w-8 text-white/60" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    {overview?.overall_occupancy_rate?.toFixed(1)}%
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Properties & Units</p>
                  <p className="text-3xl font-bold">{overview?.total_properties || 0}</p>
                  <p className="text-white/70 text-xs mt-1">
                    {overview?.total_units || 0} units, {occupancy?.occupied_units || 0} occupied
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Users */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-white/60" />
                  <Badge className="bg-white/20 text-white border-white/30">
                    {(overview?.total_landlords || 0) + (overview?.total_caretakers || 0) + (overview?.total_tenants || 0)} total
                  </Badge>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Platform Users</p>
                  <p className="text-3xl font-bold">{(overview?.total_landlords || 0) + (overview?.total_caretakers || 0) + (overview?.total_tenants || 0)}</p>
                  <p className="text-white/70 text-xs mt-1">
                    {overview?.active_leases || 0} active leases
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Overview */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Wrench className="h-8 w-8 text-white/60" />
                  {emergencyRequests?.data && emergencyRequests.data.length > 0 && (
                    <Badge className="bg-red-700 text-white border-0 animate-pulse">
                      {emergencyRequests.data.length} urgent
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Maintenance</p>
                  <p className="text-3xl font-bold">{openRequests?.meta?.total || 0}</p>
                  <p className="text-white/70 text-xs mt-1">
                    {maintenance?.total_requests ? ((maintenance.completed_requests / maintenance.total_requests) * 100).toFixed(1) : 0}% completion rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Performance */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Financial Breakdown */}
            <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Financial Performance
                </CardTitle>
                <CardDescription>Revenue collection and outstanding balances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Collection Rate */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Collection Rate</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatCurrency(financial?.total_revenue || 0)} collected
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{financial?.collection_rate?.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress value={financial?.collection_rate || 0} className="h-3" />
                </div>

                <Separator />

                {/* Outstanding Balance */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Outstanding Balance</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatCurrency(financial?.total_overdue || 0)} overdue
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(financial?.total_outstanding || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatCurrency(financial?.total_outstanding || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(financial?.total_overdue || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health & Quick Stats */}
            <div className="space-y-6">
              {/* System Health Score */}
              {healthScore !== null && (
                <Card className={cn(
                  "shadow-lg border-0 bg-gradient-to-r text-white",
                  getHealthScoreColor(healthScore)
                )}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-6xl font-bold mb-2">{healthScore.toFixed(0)}%</p>
                      <p className="text-white/80">
                        {healthScore >= 90 ? "Excellent" : 
                         healthScore >= 75 ? "Good" :
                         healthScore >= 60 ? "Fair" : "Needs Attention"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vacant Units</span>
                    <Badge variant="secondary">{occupancy?.vacant_units || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Expiring Leases</span>
                    <Badge variant="secondary">{overview?.active_leases || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Open Requests</span>
                    <Badge variant="secondary">{maintenance?.open_requests || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/admin/users")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    User Management
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/admin/properties")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Properties
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    onClick={() => router.push("/admin/activity")}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    View Activity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Occupancy Analytics */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Occupancy Analytics
              </CardTitle>
              <CardDescription>Unit distribution and occupancy trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Home className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <p className="text-3xl font-bold text-blue-600">{occupancy?.total_units || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Units</p>
                </div>

                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <p className="text-3xl font-bold text-green-600">{occupancy?.occupied_units || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Occupied</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {overview?.overall_occupancy_rate?.toFixed(1)}% rate
                  </p>
                </div>

                <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <XCircle className="h-8 w-8 mx-auto mb-3 text-orange-600" />
                  <p className="text-3xl font-bold text-orange-600">{occupancy?.vacant_units || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vacant</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    {((occupancy?.vacant_units || 0) / (occupancy?.total_units || 1) * 100).toFixed(1)}% vacant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Landlords */}
          {topLandlords && topLandlords.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Top Performing Landlords
                </CardTitle>
                <CardDescription>Ranked by occupancy rate and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLandlords.map((landlord: any, index: number) => (
                    <div
                      key={landlord.id}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    >
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full font-bold text-white",
                        index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                        index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700" :
                        index === 2 ? "bg-gradient-to-r from-orange-400 to-orange-600" :
                        "bg-gradient-to-r from-blue-400 to-blue-600"
                      )}>
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{landlord.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {landlord.properties_count} properties • {landlord.units_count} units
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20">
                            {landlord.occupancy_rate?.toFixed(1)}% occupied
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(landlord.total_revenue || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {activities && activities.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Recent Platform Activity
                </CardTitle>
                <CardDescription>Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.slice(0, 10).map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className={cn(
                        "p-2 rounded-full",
                        activity.type === 'payment' ? "bg-green-100 dark:bg-green-900/20" :
                        activity.type === 'maintenance' ? "bg-orange-100 dark:bg-orange-900/20" :
                        activity.type === 'lease' ? "bg-blue-100 dark:bg-blue-900/20" :
                        "bg-purple-100 dark:bg-purple-900/20"
                      )}>
                        {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                        {activity.type === 'maintenance' && <Wrench className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'lease' && <Calendar className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'user' && <Users className="h-4 w-4 text-purple-600" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {activity.description || activity.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.user_name} • {activity.property_name || 'System'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>

                      <Badge className={
                        activity.status === 'completed' || activity.status === 'active' 
                          ? "bg-green-100 text-green-700"
                          : activity.status === 'pending'
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }>
                        {activity.status || activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  )
}
