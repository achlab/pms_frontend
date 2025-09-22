import { DashboardStats, Activity, Property, ManualTask } from "@/types/dashboard"
import { StatsCard } from "./stats-card"
import { ActivityFeed } from "./activity-feed"
import { TaskList } from "./task-list"
import { Building2, Users, DollarSign, TrendingUp, Building } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/localization"

interface LandlordDashboardProps {
  stats: DashboardStats
  activities: Activity[]
  properties: Property[]
  tasks: ManualTask[]
  onTaskAction?: (taskId: string, action: "complete" | "start" | "cancel") => void
}

export function LandlordDashboard({ stats, activities, properties, tasks, onTaskAction }: LandlordDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Properties"
          value={stats?.totalProperties ?? 0}
          subtitle="Actively managed"
          icon={Building2}
          delay={100}
        />
        <StatsCard
          title="Total Units"
          value={stats?.totalUnits ?? 0}
          subtitle={`${stats?.vacantUnits ?? 0} vacant`}
          icon={Building}
          iconColorClass="text-blue-600 dark:text-blue-400"
          gradientFromClass="from-blue-100"
          gradientToClass="to-indigo-100"
          delay={200}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${stats?.occupiedUnits ?? 0}/${stats?.totalUnits ?? 0}`}
          subtitle="Units Occupied"
          icon={Users}
          iconColorClass="text-green-600 dark:text-green-400"
          gradientFromClass="from-green-100"
          gradientToClass="to-emerald-100"
          delay={300}
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyExpectedRent ?? 0)}
          subtitle="Expected total"
          icon={DollarSign}
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          gradientFromClass="from-emerald-100"
          gradientToClass="to-cyan-100"
          delay={400}
        />
      </div>

      {/* Financial Overview */}
      <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">This Month's Expected Rent</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats?.monthlyExpectedRent ?? 0)}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Rent Collected (YTD)</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats?.rentCollectedYTD ?? 0)}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Outstanding Balance</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(stats?.outstandingBalance ?? 0)}
            </p>
            <Button variant="link" size="sm" className="mt-1 p-0 h-auto text-orange-600 dark:text-orange-400">
              View overdue tenants →
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <ActivityFeed activities={activities} title="Recent Activity" />

        {/* Tasks */}
        <TaskList tasks={tasks} onTaskAction={onTaskAction} title="Pending Tasks" />
      </div>
    </div>
  )
}