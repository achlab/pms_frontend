import { ManualTask } from "@/types/dashboard"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskListProps {
  tasks: ManualTask[]
  onTaskAction?: (taskId: string, action: "complete" | "start" | "cancel") => void
  title?: string
  maxItems?: number
}

export function TaskList({ tasks, onTaskAction, title = "Tasks", maxItems = 5 }: TaskListProps) {
  const getPriorityColor = (priority: ManualTask["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-orange-600 dark:text-orange-400"
      case "low":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getStatusColor = (status: ManualTask["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <AnimatedCard delay={300} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.slice(0, maxItems).map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                  <AlertTriangle className="h-4 w-4" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
            {onTaskAction && task.status !== "completed" && (
              <div className="flex items-center gap-2">
                {task.status === "pending" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTaskAction(task.id, "start")}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                  >
                    Start
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTaskAction(task.id, "complete")}
                    className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                  >
                    Complete
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </AnimatedCard>
  )
}
