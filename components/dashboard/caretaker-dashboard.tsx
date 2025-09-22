import { DashboardStats, Activity, ManualTask } from "@/types/dashboard"
import { StatsCard } from "./stats-card"
import { ActivityFeed } from "./activity-feed"
import { TaskList } from "./task-list"
import { Building2, Wrench, CheckCircle, AlertTriangle } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Button } from "@/components/ui/button"

interface CaretakerDashboardProps {
  stats: DashboardStats
  activities: Activity[]
  tasks: ManualTask[]
  onTaskAction?: (taskId: string, action: "complete" | "start" | "cancel") => void
}

export function CaretakerDashboard({ stats, activities, tasks, onTaskAction }: CaretakerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Assigned Properties"
          value={stats.totalProperties}
          subtitle={`${stats.totalUnits} total units`}
          icon={Building2}
          delay={100}
        />
        <StatsCard
          title="Active Requests"
          value={stats.activeMaintenanceRequests}
          subtitle={`${stats.urgentRequests} Urgent · ${stats.normalRequests} Normal`}
          icon={Wrench}
          iconColorClass="text-orange-600 dark:text-orange-400"
          gradientFromClass="from-orange-100"
          gradientToClass="to-red-100"
          delay={200}
        />
        <StatsCard
          title="Completed This Week"
          value={stats.completedThisWeek}
          subtitle="Maintenance tasks"
          icon={CheckCircle}
          iconColorClass="text-green-600 dark:text-green-400"
          gradientFromClass="from-green-100"
          gradientToClass="to-emerald-100"
          delay={300}
        />
        <StatsCard
          title="Urgent Priority"
          value={stats.urgentRequests}
          subtitle="Need immediate attention"
          icon={AlertTriangle}
          iconColorClass="text-red-600 dark:text-red-400"
          gradientFromClass="from-red-100"
          gradientToClass="to-orange-100"
          delay={400}
        />
      </div>

      {/* Maintenance Overview */}
      <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Maintenance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Urgent Requests</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgentRequests}</p>
            <Button variant="link" size="sm" className="mt-1 p-0 h-auto text-red-600 dark:text-red-400">
              View urgent tasks →
            </Button>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">In Progress</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.activeMaintenanceRequests - stats.urgentRequests}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Completed Tasks</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedThisWeek}</p>
            <p className="text-sm text-green-600 dark:text-green-400">This week</p>
          </div>
        </CardContent>
      </AnimatedCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <TaskList
          tasks={tasks.filter(task => task.status !== "completed")}
          onTaskAction={onTaskAction}
          title="Active Tasks"
        />

        {/* Recent Activity */}
        <ActivityFeed activities={activities} title="Recent Updates" />
      </div>
    </div>
  )
}