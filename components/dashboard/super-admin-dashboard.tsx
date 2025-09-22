import { DashboardStats, Activity, FraudAlert } from "@/types/dashboard"
import { StatsCard } from "./stats-card"
import { ActivityFeed } from "./activity-feed"
import { Users, Building2, TrendingUp, Shield, AlertTriangle } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/localization"

interface SuperAdminDashboardProps {
  stats: DashboardStats
  activities: Activity[]
  fraudAlerts: FraudAlert[]
}

export function SuperAdminDashboard({ stats, activities, fraudAlerts }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          subtitle={`${stats?.landlords ?? 0} Landlords · ${stats?.tenants ?? 0} Tenants`}
          icon={Users}
          iconColorClass="text-blue-600 dark:text-blue-400"
          gradientFromClass="from-blue-100"
          gradientToClass="to-indigo-100"
          delay={100}
        />
        <StatsCard
          title="Properties"
          value={stats?.totalProperties ?? 0}
          subtitle={`${stats?.verifiedProperties ?? 0} Verified · ${stats?.pendingVerification ?? 0} Pending`}
          icon={Building2}
          iconColorClass="text-green-600 dark:text-green-400"
          gradientFromClass="from-green-100"
          gradientToClass="to-emerald-100"
          delay={200}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          subtitle="+12.5% this month"
          icon={TrendingUp}
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          gradientFromClass="from-emerald-100"
          gradientToClass="to-cyan-100"
          delay={300}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Fraud Alerts"
          value={stats?.fraudFlags ?? 0}
          subtitle="Require review"
          icon={Shield}
          iconColorClass="text-red-600 dark:text-red-400"
          gradientFromClass="from-red-100"
          gradientToClass="to-orange-100"
          delay={400}
        />
      </div>

      {/* System Health & Alerts */}
      <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            System Health & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Health Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">System Health</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.systemHealth ?? 0}%</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalUsers ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Verifications</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingVerification ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {fraudAlerts.filter(alert => alert.severity === "critical").length}
              </p>
            </div>
          </div>

          {/* Fraud Alerts */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Recent Fraud Alerts</h3>
            {fraudAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20"
              >
                <AlertTriangle className="h-5 w-5 mt-1 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Property ID: {alert.propertyId}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Landlord: {alert.landlord}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">{alert.issue}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(alert.reportedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  Review
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </AnimatedCard>

      {/* System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activities} title="System Activity" />

        {/* Verification Queue */}
        <AnimatedCard delay={600} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Verification Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Pending Property Verifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stats?.pendingVerification ?? 0} properties awaiting review</p>
              </div>
              <Button
                variant="outline"
                className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
              >
                Review All
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Ghana Card Verifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">12 cards pending verification</p>
              </div>
              <Button
                variant="outline"
                className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
              >
                Verify Cards
              </Button>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </div>
  )
}