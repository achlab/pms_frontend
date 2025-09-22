import { Activity } from "@/types/dashboard"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Bell, CheckCircle, Clock, FileText, Wrench, AlertTriangle, DollarSign, Home, User } from "lucide-react"

interface ActivityFeedProps {
  activities: Activity[]
  title?: string
  maxItems?: number
}

export function ActivityFeed({ activities, title = "Recent Activity", maxItems = 5 }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "maintenance_request":
      case "maintenance_update":
      case "maintenance_resolved":
        return <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      case "payment_confirmed":
      case "payment_recorded":
        return <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "lease_viewed":
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case "tenant_registration":
        return <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      case "property_added":
      case "property_verification":
        return <Home className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
      case "fraud_detection":
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
    }
  }

  return (
    <AnimatedCard delay={400} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.slice(0, maxItems).map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {activity.user ? `${activity.user} ${activity.title}` : activity.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(activity.timestamp).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {activity.status && (
              <span
                className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : activity.status === "in_progress"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </AnimatedCard>
  )
}
