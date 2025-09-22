"use client"

import { AlertTriangle, Clock, CheckCircle } from "lucide-react"

const maintenanceStats = [
  { priority: "High", count: 3, color: "text-red-600", bgColor: "bg-red-100", icon: AlertTriangle },
  { priority: "Medium", count: 7, color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  { priority: "Low", count: 12, color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
]

export function MaintenanceHealth() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Maintenance Health</h3>

      <div className="grid grid-cols-3 gap-4">
        {maintenanceStats.map((stat) => (
          <div key={stat.priority} className="text-center">
            <div className={`mx-auto w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mb-2`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.priority} Priority</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Open Tickets</span>
          <span className="font-semibold text-gray-900 dark:text-white">22</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600 dark:text-gray-400">Avg. Resolution Time</span>
          <span className="font-semibold text-gray-900 dark:text-white">2.3 days</span>
        </div>
      </div>
    </div>
  )
}
