"use client"

import { MainLayout } from "@/components/main-layout"
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
import { Activity, TrendingUp, TrendingDown, Minus, DollarSign, Home, Users, Wrench, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth()

  // Fetch all dashboard data using new hooks
  const { data: overview, loading: overviewLoading } = useSuperAdminOverview()
  const { data: financial, loading: financialLoading } = useSuperAdminFinancialSummary()
  const { data: occupancy, loading: occupancyLoading } = useSuperAdminOccupancyAnalytics()
  const { data: maintenance, loading: maintenanceLoading } = useSuperAdminMaintenanceOverview()
  const { data: activities, loading: activitiesLoading } = useSuperAdminRecentActivities(10)
  const { data: topLandlords, loading: landlordLoading } = useSuperAdminTopLandlords(5)
  const { score: healthScore, loading: healthLoading } = useSuperAdminHealthScore()
  const { data: emergencyRequests } = useSuperAdminEmergencyRequests()
  const { data: openRequests } = useSuperAdminOpenRequests()

  const loading = overviewLoading || financialLoading || occupancyLoading || maintenanceLoading || authLoading

  // Loading state
  if (loading) {
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
    )
  }

  // Access control
  if (!currentUser || currentUser.role !== "super_admin") {
    return (
      <MainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              System Administration Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor system health, user activity, and property verification across the platform.
            </p>
          </div>
          {healthScore !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">System Health:</span>
              <Badge
                variant={
                  healthScore >= 80
                    ? "default"
                    : healthScore >= 60
                    ? "secondary"
                    : "destructive"
                }
              >
                {healthScore.toFixed(1)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Alert Cards */}
        {(emergencyRequests?.data && emergencyRequests.data.length > 0) && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Emergency Maintenance Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 dark:text-red-300">
                {emergencyRequests.data.length} emergency maintenance {emergencyRequests.data.length === 1 ? 'request' : 'requests'} require immediate attention.
              </p>
              <Link href="/admin/maintenance?priority=emergency" className="text-sm text-red-600 hover:underline mt-2 inline-block">
                View Emergency Requests →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.active_users || 0} active users
              </p>
            </CardContent>
          </Card>

          {/* Total Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.total_properties || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.total_units || 0} units total
              </p>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financial?.total_monthly_revenue.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {financial?.collection_rate.toFixed(1)}% collection rate
              </p>
            </CardContent>
          </Card>

          {/* Occupancy Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview?.occupancy_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {occupancy?.occupied_units || 0} of {occupancy?.total_units || 0} units
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Outstanding Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${financial?.total_outstanding.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {financial?.overdue_invoices || 0} overdue invoices
              </p>
            </CardContent>
          </Card>

          {/* Maintenance Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openRequests?.meta?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {maintenance?.completion_rate.toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          {/* Vacant Units */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacant Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancy?.vacant_units || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all properties
              </p>
            </CardContent>
          </Card>

          {/* Active Leases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview?.active_leases || 0}</div>
              <p className="text-xs text-muted-foreground">
                {overview?.expiring_leases || 0} expiring soon
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Landlords */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Landlords</CardTitle>
              <CardDescription>Based on occupancy rate and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {landlordLoading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : topLandlords && topLandlords.length > 0 ? (
                  topLandlords.map((landlord, idx) => (
                    <div key={landlord.landlord_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <div>
                          <p className="text-sm font-medium">{landlord.landlord_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {landlord.properties} {landlord.properties === 1 ? 'property' : 'properties'}, {landlord.total_units} units
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{landlord.occupancy_rate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          ${landlord.monthly_revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : activities && activities.length > 0 ? (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user_name} • {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
